import mongoose from 'mongoose';
import { z } from 'zod';
import { Comment, Project } from '../models/index.js';
import { formatComment } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/helpers.js';

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

export const listComments = asyncHandler(async (req, res) => {
  const projectId = req.query.projectId;
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return fail(res, 'projectId required', 400);
  }
  const canAccess = await canAccessProject(req.user, projectId);
  if (!canAccess) return fail(res, 'Forbidden', 403);

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

  return ok(res, {
    data,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  });
});

export const createComment = asyncHandler(async (req, res) => {
  const projectId = req.body.projectId;
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return fail(res, 'projectId required', 400);
  }
  const canAccess = await canAccessProject(req.user, projectId);
  if (!canAccess) return fail(res, 'Forbidden', 403);

  const parsed = createSchema.parse({ text: req.body.text });
  const doc = await Comment.create({
    projectId,
    userId: req.user.id,
    message: parsed.text,
  });

  const populated = await Comment.findById(doc._id).populate('userId', 'name role').lean();
  return ok(res, {
    comment: formatComment({
      ...populated,
      authorName: populated.userId?.name,
      authorRole: populated.userId?.role,
    }),
  }, 'Comment created');
});

export const deleteComment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return fail(res, 'Invalid id', 400);
  }
  const c = await Comment.findById(req.params.id)
    .populate({
      path: 'projectId',
      populate: { path: 'assignmentId', select: 'createdBy' },
    })
    .lean();

  if (!c) return fail(res, 'Not found', 404);
  const ownerId = c.projectId?.assignmentId?.createdBy
    ? String(c.projectId.assignmentId.createdBy)
    : null;
  const uid = c.userId?._id ?? c.userId;
  const isAuthor = String(uid) === req.user.id;
  const isTeacherOwner = req.user.role === 'teacher' && ownerId === req.user.id;
  if (!isAuthor && !isTeacherOwner) return fail(res, 'Forbidden', 403);

  await Comment.deleteOne({ _id: c._id });
  return ok(res, null, 'Comment deleted');
});

