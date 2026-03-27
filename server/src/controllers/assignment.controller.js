import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Assignment, Project, User, Rating, Comment } from '../models/index.js';
import { config } from '../config.js';
import { formatAssignment } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/helpers.js';
import { safeBaseNameFromUpload } from '../utils/filename.js';

const toolsSchema = z.array(z.enum(['ev3', 'tinkercad'])).min(1);
const createFieldsSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  deadline: z.string().min(1).refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid deadline'),
  tools: z.string().transform((s) => JSON.parse(s)).pipe(toolsSchema),
});
const updateBodySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  deadline: z.string().min(1).refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid deadline').optional(),
  tools: z.array(z.enum(['ev3', 'tinkercad'])).min(1).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

function resolveAssignmentStatus(a) {
  if (!a) return 'active';
  if (a.status === 'archived') return 'archived';
  const deadline = new Date(a.deadline);
  if (!Number.isNaN(deadline.getTime()) && Date.now() > deadline.getTime()) return 'expired';
  return 'active';
}
async function syncExpiredIfNeeded(a) {
  if (!a?._id) return;
  const next = resolveAssignmentStatus(a);
  if (next === 'expired' && a.status !== 'expired') {
    await Assignment.updateOne({ _id: a._id, status: { $ne: 'archived' } }, { $set: { status: 'expired' } });
  }
}
function parsePage(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export const listAssignments = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePage(req);
  const isTeacher = req.user.role === 'teacher';
  const filter = isTeacher ? { createdBy: req.user.id } : { status: { $ne: 'archived' } };
  const [total, rows, studentCount] = await Promise.all([
    Assignment.countDocuments(filter),
    Assignment.find(filter).sort({ deadline: -1, createdAt: -1 }).skip(offset).limit(pageSize).populate('createdBy', 'name').lean(),
    isTeacher ? User.countDocuments({ role: 'student' }) : Promise.resolve(0),
  ]);
  const data = await Promise.all(rows.map(async (a) => {
    const status = resolveAssignmentStatus(a);
    await syncExpiredIfNeeded(a);
    const subCount = await Project.countDocuments({ assignmentId: a._id });
    const instructorName = a.createdBy?.name;
    return { ...formatAssignment({ ...a, status }, instructorName), submissionCount: subCount, studentTotal: isTeacher ? studentCount : undefined };
  }));
  return ok(res, { data, page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1, studentTotal: isTeacher ? studentCount : undefined });
});

export const getAssignmentById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return fail(res, 'Invalid id', 400);
  const a = await Assignment.findById(req.params.id).populate('createdBy', 'name').lean();
  if (!a) return fail(res, 'Assignment not found', 404);
  if (req.user.role === 'teacher' && String(a.createdBy._id) !== req.user.id) return fail(res, 'Forbidden', 403);
  const status = resolveAssignmentStatus(a);
  await syncExpiredIfNeeded(a);
  if (req.user.role === 'student' && status === 'archived') return fail(res, 'Assignment not found', 404);
  return ok(res, { assignment: formatAssignment({ ...a, status }, a.createdBy?.name) });
});

export const createAssignment = asyncHandler(async (req, res) => {
  const body = createFieldsSchema.parse(req.body);
  let fileUrl = ''; let attachmentOriginalName = '';
  if (req.file) {
    fileUrl = path.relative(config.uploadDir, req.file.path).replace(/\\/g, '/');
    attachmentOriginalName = safeBaseNameFromUpload(req.file.originalname);
  }
  try {
    const doc = await Assignment.create({ title: body.title, description: body.description, deadline: new Date(body.deadline), status: 'active', fileUrl, attachmentOriginalName, tools: body.tools, createdBy: req.user.id });
    const populated = await Assignment.findById(doc._id).populate('createdBy', 'name').lean();
    return ok(res, { assignment: formatAssignment(populated, populated.createdBy?.name) }, 'Assignment created');
  } catch (e) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw e;
  }
});

export const updateAssignment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return fail(res, 'Invalid id', 400);
  const body = updateBodySchema.parse(req.body);
  const updates = {};
  if (body.title != null) updates.title = body.title;
  if (body.description != null) updates.description = body.description;
  if (body.deadline != null) updates.deadline = new Date(body.deadline);
  if (body.tools != null) updates.tools = body.tools;
  if (body.status != null) updates.status = body.status;
  if (!Object.keys(updates).length) return fail(res, 'No fields to update', 400);
  const doc = await Assignment.findOneAndUpdate({ _id: req.params.id, createdBy: req.user.id }, { $set: updates }, { new: true, runValidators: true }).populate('createdBy', 'name').lean();
  if (!doc) return fail(res, 'Assignment not found', 404);
  const status = resolveAssignmentStatus(doc);
  await syncExpiredIfNeeded(doc);
  return ok(res, { assignment: formatAssignment({ ...doc, status }, doc.createdBy?.name) }, 'Assignment updated');
});

export const archiveAssignment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return fail(res, 'Invalid id', 400);
  const doc = await Assignment.findOneAndUpdate({ _id: req.params.id, createdBy: req.user.id }, { $set: { status: 'archived' } }, { new: true }).populate('createdBy', 'name').lean();
  if (!doc) return fail(res, 'Assignment not found', 404);
  return ok(res, { assignment: formatAssignment({ ...doc, status: 'archived' }, doc.createdBy?.name) }, 'Assignment archived');
});

export const restoreAssignment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return fail(res, 'Invalid id', 400);
  const current = await Assignment.findOne({ _id: req.params.id, createdBy: req.user.id }).lean();
  if (!current) return fail(res, 'Assignment not found', 404);
  const nextStatus = Date.now() > new Date(current.deadline).getTime() ? 'expired' : 'active';
  const doc = await Assignment.findOneAndUpdate({ _id: req.params.id, createdBy: req.user.id }, { $set: { status: nextStatus } }, { new: true }).populate('createdBy', 'name').lean();
  return ok(res, { assignment: formatAssignment({ ...doc, status: nextStatus }, doc.createdBy?.name) }, 'Assignment restored');
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return fail(res, 'Invalid id', 400);
  const a = await Assignment.findOne({ _id: req.params.id, createdBy: req.user.id }).lean();
  if (!a) return fail(res, 'Assignment not found', 404);
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
  return ok(res, null, 'Assignment deleted');
});

export const downloadAttachment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return fail(res, 'Invalid id', 400);
  const a = await Assignment.findById(req.params.id).lean();
  if (!a?.fileUrl) return fail(res, 'No attachment', 404);
  const full = path.join(config.uploadDir, a.fileUrl);
  if (!fs.existsSync(full)) return fail(res, 'File missing', 404);
  res.download(full, a.attachmentOriginalName || 'attachment');
});

