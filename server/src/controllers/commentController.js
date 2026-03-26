import mongoose from 'mongoose';
import { Comment, Project } from '../models/index.js';
import { formatComment } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const createSchema = z.object({
  text: z.string().min(1).max(5000),
});

function parsePage(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

async function canAccessProject(user, projectId) {
  const p = await Project.findById(projectId).populate({ path: 'assignmentId', select: 'createdBy' }).lean();
  if (!p) return null;
  const ownerId = p.assignmentId?.createdBy ? String(p.assignmentId.createdBy) : null;
  const studentId = String(p.studentId);
  if (user.role === 'teacher' && ownerId === user.id) return true;
  if (user.role === 'student' && studentId === user.id) return true;
  return false;
}

export const list = asyncHandler(async (req, res) => {
  const projectId = req.query.projectId;
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: 'projectId required' });
  }
  const ok = await canAccessProject(req.user, projectId);
  if (!ok) return res.status(403).json({ error: 'Forbidden' });

  const { page, pageSize, offset } = parsePage(req);
  const total = await Comment.countDocuments({ projectId });
  const rows = await Comment.find({ projectId })
    .sort({ createdAt: 1 })
    .skip(offset)
    .limit(pageSize)
    .populate('userId', 'name role')
    .lean();

  const data = rows.map((c) =>
    formatComment({
      ...c,
      authorName: c.userId?.name,
      authorRole: c.userId?.role,
    }),
  );

  res.json({
    data,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  });
});

export const create = asyncHandler(async (req, res) => {
  const projectId = req.body.projectId;
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: 'projectId required' });
  }
  const ok = await canAccessProject(req.user, projectId);
  if (!ok) return res.status(403).json({ error: 'Forbidden' });

  const parsed = createSchema.parse({ text: req.body.text });
  const doc = await Comment.create({
    projectId,
    userId: req.user.id,
    message: parsed.text,
  });

  const populated = await Comment.findById(doc._id).populate('userId', 'name role').lean();
  res.status(201).json({
    comment: formatComment({
      ...populated,
      authorName: populated.userId?.name,
      authorRole: populated.userId?.role,
    }),
  });
});

export const remove = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const c = await Comment.findById(req.params.id)
    .populate({
      path: 'projectId',
      populate: { path: 'assignmentId', select: 'createdBy' },
    })
    .lean();

  if (!c) return res.status(404).json({ error: 'Not found' });
  const ownerId = c.projectId?.assignmentId?.createdBy
    ? String(c.projectId.assignmentId.createdBy)
    : null;
  const uid = c.userId?._id ?? c.userId;
  const isAuthor = String(uid) === req.user.id;
  const isTeacherOwner = req.user.role === 'teacher' && ownerId === req.user.id;
  if (!isAuthor && !isTeacherOwner) return res.status(403).json({ error: 'Forbidden' });

  await Comment.deleteOne({ _id: c._id });
  res.status(204).send();
});
