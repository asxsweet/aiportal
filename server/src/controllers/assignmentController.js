import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Assignment, Project, User, Rating, Comment } from '../models/index.js';
import { config } from '../config.js';
import { formatAssignment } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const toolsSchema = z.array(z.enum(['ev3', 'tinkercad'])).min(1);

const createFieldsSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tools: z.string().transform((s) => JSON.parse(s)).pipe(toolsSchema),
});

const updateBodySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tools: z.array(z.enum(['ev3', 'tinkercad'])).min(1).optional(),
});

function parsePage(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePage(req);
  const isTeacher = req.user.role === 'teacher';
  const filter = isTeacher ? { createdBy: req.user.id } : {};

  const [total, rows, studentCount] = await Promise.all([
    Assignment.countDocuments(filter),
    Assignment.find(filter)
      .sort({ deadline: -1, createdAt: -1 })
      .skip(offset)
      .limit(pageSize)
      .populate('createdBy', 'name')
      .lean(),
    isTeacher ? User.countDocuments({ role: 'student' }) : Promise.resolve(0),
  ]);

  const data = await Promise.all(
    rows.map(async (a) => {
      const subCount = await Project.countDocuments({ assignmentId: a._id });
      const instructorName = a.createdBy?.name;
      return {
        ...formatAssignment(a, instructorName),
        submissionCount: subCount,
        studentTotal: isTeacher ? studentCount : undefined,
      };
    }),
  );

  res.json({
    data,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
    studentTotal: isTeacher ? studentCount : undefined,
  });
});

export const getById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const a = await Assignment.findById(req.params.id).populate('createdBy', 'name').lean();
  if (!a) return res.status(404).json({ error: 'Assignment not found' });
  if (req.user.role === 'teacher' && String(a.createdBy._id) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({
    assignment: formatAssignment(a, a.createdBy?.name),
  });
});

export const create = asyncHandler(async (req, res) => {
  const body = createFieldsSchema.parse(req.body);
  let fileUrl = '';
  let attachmentOriginalName = '';
  if (req.file) {
    fileUrl = path.relative(config.uploadDir, req.file.path).replace(/\\/g, '/');
    attachmentOriginalName = req.file.originalname;
  }
  try {
    const doc = await Assignment.create({
      title: body.title,
      description: body.description,
      deadline: new Date(body.deadline),
      fileUrl,
      attachmentOriginalName,
      tools: body.tools,
      createdBy: req.user.id,
    });
    const populated = await Assignment.findById(doc._id).populate('createdBy', 'name').lean();
    res.status(201).json({
      assignment: formatAssignment(populated, populated.createdBy?.name),
    });
  } catch (e) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw e;
  }
});

export const update = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const body = updateBodySchema.parse(req.body);
  const updates = {};
  if (body.title != null) updates.title = body.title;
  if (body.description != null) updates.description = body.description;
  if (body.deadline != null) updates.deadline = new Date(body.deadline);
  if (body.tools != null) updates.tools = body.tools;
  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No fields to update' });

  const doc = await Assignment.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    { $set: updates },
    { new: true, runValidators: true },
  )
    .populate('createdBy', 'name')
    .lean();

  if (!doc) return res.status(404).json({ error: 'Assignment not found' });
  res.json({ assignment: formatAssignment(doc, doc.createdBy?.name) });
});

export const remove = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const a = await Assignment.findOne({ _id: req.params.id, createdBy: req.user.id }).lean();
  if (!a) return res.status(404).json({ error: 'Assignment not found' });

  const projects = await Project.find({ assignmentId: a._id }).select('_id fileUrl').lean();
  const pids = projects.map((p) => p._id);
  await Rating.deleteMany({ projectId: { $in: pids } });
  await Comment.deleteMany({ projectId: { $in: pids } });
  await Project.deleteMany({ assignmentId: a._id });
  await Assignment.deleteOne({ _id: a._id });

  if (a.fileUrl) {
    const full = path.join(config.uploadDir, a.fileUrl);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }
  for (const p of projects) {
    if (p.fileUrl) {
      const f = path.join(config.uploadDir, p.fileUrl);
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  }

  res.status(204).send();
});

export const downloadAttachment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const a = await Assignment.findById(req.params.id).lean();
  if (!a?.fileUrl) return res.status(404).json({ error: 'No attachment' });
  const full = path.join(config.uploadDir, a.fileUrl);
  if (!fs.existsSync(full)) return res.status(404).json({ error: 'File missing' });
  res.download(full, a.attachmentOriginalName || 'attachment');
});
