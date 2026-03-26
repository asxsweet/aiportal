import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Assignment, Project, User, Rating } from '../models/index.js';
import { config } from '../config.js';
import { formatProject, formatRating } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { evaluateProject, averageAiScore, computeFinalScore } from '../services/aiEvaluation.js';

const createFieldsSchema = z.object({
  assignmentId: z.string(),
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  tools: z.string().transform((s) => JSON.parse(s)).pipe(z.array(z.enum(['ev3', 'tinkercad'])).min(1)),
  teamMembers: z
    .string()
    .optional()
    .transform((s) => {
      if (!s) return [];
      try {
        const arr = JSON.parse(s);
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    }),
});

function parsePage(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function parseTeamObjectIds(rawList) {
  const ids = [];
  for (const x of rawList) {
    const s = String(x).trim();
    if (mongoose.Types.ObjectId.isValid(s) && String(new mongoose.Types.ObjectId(s)) === s) {
      ids.push(new mongoose.Types.ObjectId(s));
    }
  }
  return ids;
}

async function enrichProject(p) {
  const teamDocs = p.teamMembers?.length
    ? await User.find({ _id: { $in: p.teamMembers } }).select('name').lean()
    : [];
  const teamMembers = teamDocs.map((u) => u.name);
  const rating = await Rating.findOne({ projectId: p._id }).lean();
  return formatProject(p, {
    teamMembers,
    rating: formatRating(rating),
  });
}

export const downloadFile = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const row = await Project.findById(req.params.id).populate({ path: 'assignmentId', select: 'createdBy' }).lean();
  if (!row) return res.status(404).json({ error: 'Not found' });
  const ownerId = row.assignmentId?.createdBy ? String(row.assignmentId.createdBy) : null;
  if (req.user.role === 'student' && String(row.studentId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.user.role === 'teacher' && ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const full = path.join(config.uploadDir, row.fileUrl);
  if (!fs.existsSync(full)) return res.status(404).json({ error: 'File missing' });
  res.download(full, row.originalFilename || 'submission');
});

export const list = asyncHandler(async (req, res) => {
  const assignmentId = req.query.assignmentId;
  if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(400).json({ error: 'assignmentId query required' });
  }
  const { page, pageSize, offset } = parsePage(req);

  if (req.user.role === 'student') {
    const rows = await Project.find({ assignmentId, studentId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    const data = [];
    for (const p of rows) {
      data.push(await enrichProject(p));
    }
    return res.json({
      data,
      page: 1,
      pageSize: data.length,
      total: data.length,
      totalPages: 1,
    });
  }

  const total = await Project.countDocuments({ assignmentId });
  const rows = await Project.find({ assignmentId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(pageSize)
    .populate('studentId', 'name')
    .lean();

  const data = [];
  for (const p of rows) {
    const sid = p.studentId?._id || p.studentId;
    const enriched = await enrichProject({ ...p, studentId: sid });
    enriched.studentName = p.studentId?.name;
    data.push(enriched);
  }

  res.json({
    data,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  });
});

export const getById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const p = await Project.findById(req.params.id)
    .populate('studentId', 'name')
    .populate({ path: 'assignmentId', select: 'title createdBy' })
    .lean();

  if (!p) return res.status(404).json({ error: 'Project not found' });
  const ownerId = p.assignmentId?.createdBy ? String(p.assignmentId.createdBy) : null;
  const sid = p.studentId?._id ?? p.studentId;
  if (req.user.role === 'student' && String(sid) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.user.role === 'teacher' && ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const studentName = p.studentId?.name;
  const assignmentTitle = p.assignmentId?.title;
  const flat = { ...p, studentId: p.studentId?._id || p.studentId };
  const payload = await enrichProject(flat);
  payload.studentName = studentName;
  payload.assignmentTitle = assignmentTitle;

  res.json({ project: payload });
});

export const create = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required (PDF, DOC, DOCX)' });
  }
  const body = createFieldsSchema.parse(req.body);
  if (!mongoose.Types.ObjectId.isValid(body.assignmentId)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Invalid assignment id' });
  }

  const assignment = await Assignment.findById(body.assignmentId).lean();
  if (!assignment) {
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Assignment not found' });
  }

  const existing = await Project.findOne({
    assignmentId: body.assignmentId,
    studentId: req.user.id,
  }).lean();
  if (existing) {
    fs.unlinkSync(req.file.path);
    return res.status(409).json({ error: 'You already submitted for this assignment' });
  }

  const teamMemberIds = parseTeamObjectIds(body.teamMembers);
  const relPath = path.relative(config.uploadDir, req.file.path).replace(/\\/g, '/');

  try {
    const project = await Project.create({
      assignmentId: body.assignmentId,
      studentId: req.user.id,
      title: body.title,
      description: body.description,
      fileUrl: relPath,
      originalFilename: req.file.originalname,
      tools: body.tools,
      teamMembers: teamMemberIds,
    });

    const ai = await evaluateProject({
      title: body.title,
      description: body.description,
      tools: body.tools,
    });
    const aiAvg = averageAiScore(ai.scores);
    await Rating.create({
      projectId: project._id,
      aiScore: aiAvg,
      aiIdea: ai.scores.idea,
      aiAlgorithm: ai.scores.algorithm,
      aiTechnical: ai.scores.technical,
      aiTools: ai.scores.toolsUsage,
      feedback: ai.feedback,
      finalScore: aiAvg,
    });

    const full = await Project.findById(project._id).lean();
    const out = await enrichProject(full);
    const populated = await Project.findById(project._id)
      .populate('studentId', 'name')
      .populate({ path: 'assignmentId', select: 'title' })
      .lean();
    out.studentName = populated.studentId?.name;
    out.assignmentTitle = populated.assignmentId?.title;

    res.status(201).json({ project: out });
  } catch (e) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw e;
  }
});
