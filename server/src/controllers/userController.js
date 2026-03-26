import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { z } from 'zod';
import { User, Assignment, Project, Rating, Comment } from '../models/index.js';
import { config } from '../config.js';
import { formatUser } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from './authController.js';

function parsePage(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function unlinkSafe(rel) {
  if (!rel) return;
  const full = path.join(config.uploadDir, rel);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

function profileCompletionPct(u) {
  let score = 0;
  if (u.name?.trim()) score += 25;
  if (u.email) score += 25;
  if ((u.avatar || '').trim()) score += 25;
  if ((u.bio || '').trim().length >= 20) score += 25;
  else if ((u.bio || '').trim()) score += 12;
  return Math.min(100, score);
}

async function studentStats(userId) {
  const uid = new mongoose.Types.ObjectId(userId);
  const projects = await Project.find({ studentId: uid }).select('_id status assignmentId').lean();
  const pids = projects.map((p) => p._id);
  const completed = projects.filter((p) => p.status === 'graded').length;
  let avgScore = null;
  if (pids.length) {
    const agg = await Rating.aggregate([
      { $match: { projectId: { $in: pids }, finalScore: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$finalScore' } } },
    ]);
    if (agg[0]?.avg != null) avgScore = Math.round(agg[0].avg);
  }
  const recentProjects = await Project.find({ studentId: uid })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: 'assignmentId', select: 'title' })
    .lean();

  const recent = recentProjects.map((p) => ({
    id: String(p._id),
    title: p.title,
    assignmentTitle: p.assignmentId?.title || '—',
    status: p.status,
    submittedAt: p.createdAt,
  }));

  return {
    assignmentsCompleted: completed,
    assignmentsSubmitted: projects.length,
    avgScore,
    recentProjects: recent,
  };
}

async function teacherStats(teacherId) {
  const tid = new mongoose.Types.ObjectId(teacherId);
  const myAssignmentIds = await Assignment.find({ createdBy: tid }).distinct('_id');
  const totalAssignments = myAssignmentIds.length;

  const studentIds = await Project.distinct('studentId', {
    assignmentId: { $in: myAssignmentIds },
  });
  const totalStudents = studentIds.length;

  const avgAgg = await Project.aggregate([
    { $match: { assignmentId: { $in: myAssignmentIds } } },
    {
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'projectId',
        as: 'r',
      },
    },
    { $unwind: '$r' },
    { $match: { 'r.finalScore': { $ne: null } } },
    { $group: { _id: null, avg: { $avg: '$r.finalScore' } } },
  ]);
  const avgClassPerformance = avgAgg[0]?.avg != null ? Math.round(avgAgg[0].avg) : null;

  return {
    totalStudents,
    totalAssignments,
    avgClassPerformance,
  };
}

async function studentActivity(userId) {
  const uid = new mongoose.Types.ObjectId(userId);
  const items = [];

  const projects = await Project.find({ studentId: uid })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate({ path: 'assignmentId', select: 'title' })
    .lean();
  for (const p of projects) {
    items.push({
      id: `sub-${p._id}`,
      type: 'submission',
      title: p.title,
      subtitle: p.assignmentId?.title || '',
      at: p.createdAt,
      href: `/project/${p._id}`,
    });
  }

  const comments = await Comment.find({ userId: uid })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate({ path: 'projectId', select: 'title' })
    .lean();
  for (const c of comments) {
    items.push({
      id: `com-${c._id}`,
      type: 'comment',
      title: (c.message || '').slice(0, 80) + ((c.message || '').length > 80 ? '…' : ''),
      subtitle: c.projectId?.title || '',
      at: c.createdAt,
      href: c.projectId ? `/project/${c.projectId._id}` : undefined,
    });
  }

  const pidsForGrades = await Project.find({ studentId: uid }).distinct('_id');
  if (pidsForGrades.length) {
    const ratings = await Rating.find({
      projectId: { $in: pidsForGrades },
      finalScore: { $ne: null },
    })
      .sort({ gradedAt: -1 })
      .limit(8)
      .populate({
        path: 'projectId',
        select: 'title assignmentId studentId',
        populate: { path: 'assignmentId', select: 'title' },
      })
      .lean();

    for (const r of ratings) {
      if (!r.projectId) continue;
      items.push({
        id: `grade-${r._id}`,
        type: 'grade',
        title: r.projectId.assignmentId?.title || r.projectId.title || 'Graded',
        subtitle: String(r.finalScore),
        at: r.gradedAt || r.updatedAt,
        href: `/project/${r.projectId._id}`,
      });
    }
  }

  items.sort((a, b) => new Date(b.at) - new Date(a.at));
  return items.slice(0, 12);
}

async function teacherActivity(teacherId) {
  const tid = new mongoose.Types.ObjectId(teacherId);
  const myAssignmentIds = await Assignment.find({ createdBy: tid }).distinct('_id');
  const items = [];

  const subs = await Project.find({ assignmentId: { $in: myAssignmentIds } })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate({ path: 'studentId', select: 'name' })
    .populate({ path: 'assignmentId', select: 'title' })
    .lean();

  for (const p of subs) {
    items.push({
      id: `sub-${p._id}`,
      type: 'submission_received',
      title: p.title,
      subtitle: `${p.studentId?.name || 'Student'} · ${p.assignmentId?.title || ''}`,
      at: p.createdAt,
      href: `/project/${p._id}`,
    });
  }

  const graded = await Rating.find({ finalScore: { $ne: null } })
    .sort({ gradedAt: -1 })
    .limit(15)
    .populate({
      path: 'projectId',
      select: 'title assignmentId studentId',
      populate: [
        { path: 'assignmentId', select: 'title createdBy' },
        { path: 'studentId', select: 'name' },
      ],
    })
    .lean();

  for (const r of graded) {
    const a = r.projectId?.assignmentId;
    if (!a || String(a.createdBy) !== String(tid)) continue;
    items.push({
      id: `grade-${r._id}`,
      type: 'grade_given',
      title: r.projectId?.title || 'Project',
      subtitle: `${r.projectId?.studentId?.name || 'Student'} → ${r.finalScore}`,
      at: r.gradedAt || r.updatedAt,
      href: r.projectId ? `/project/${r.projectId._id}` : undefined,
    });
  }

  items.sort((a, b) => new Date(b.at) - new Date(a.at));
  return items.slice(0, 12);
}

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const base = formatUser(user);
  const completion = profileCompletionPct(user);

  if (user.role === 'student') {
    const stats = await studentStats(req.user.id);
    const activity = await studentActivity(req.user.id);
    return res.json({ user: base, stats, activity, profileCompletion: completion });
  }

  const stats = await teacherStats(req.user.id);
  const activity = await teacherActivity(req.user.id);
  res.json({ user: base, stats, activity, profileCompletion: completion });
});

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(2000).optional(),
  language: z.enum(['en', 'ru', 'kz']).optional(),
  institution: z.string().max(255).optional().nullable(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      assignmentUpdates: z.boolean().optional(),
      comments: z.boolean().optional(),
    })
    .optional(),
});

export const updateProfile = asyncHandler(async (req, res) => {
  const body = updateSchema.parse(req.body);
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (body.email && body.email.toLowerCase() !== user.email) {
    const taken = await User.findOne({
      email: body.email.toLowerCase(),
      _id: { $ne: user._id },
    }).lean();
    if (taken) return res.status(409).json({ error: 'Email already in use' });
    user.email = body.email.toLowerCase();
  }
  if (body.name != null) user.name = body.name.trim();
  if (body.bio != null) user.bio = body.bio.trim();
  if (body.language != null) user.language = body.language;
  if (body.institution !== undefined) user.institution = body.institution ?? '';
  if (body.notifications) {
    const cur = user.toObject?.()?.notifications ?? user.notifications ?? {};
    const n = body.notifications;
    user.notifications = {
      email: n.email !== undefined ? n.email : cur.email !== false,
      assignmentUpdates:
        n.assignmentUpdates !== undefined ? n.assignmentUpdates : cur.assignmentUpdates !== false,
      comments: n.comments !== undefined ? n.comments : cur.comments !== false,
    };
  }
  await user.save();
  res.json({ user: formatUser(user.toObject()) });
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const updatePassword = asyncHandler(async (req, res) => {
  const body = passwordSchema.parse(req.body);
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  const ok = await bcrypt.compare(body.currentPassword, user.password);
  if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });
  user.password = await bcrypt.hash(body.newPassword, 10);
  await user.save();
  res.json({ ok: true });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image file required' });
  const user = await User.findById(req.user.id);
  if (!user) {
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'User not found' });
  }
  const relPath = path.relative(config.uploadDir, req.file.path).replace(/\\/g, '/');
  const prev = user.avatar;
  user.avatar = relPath;
  await user.save();
  if (prev && prev !== relPath) unlinkSafe(prev);
  res.json({ user: formatUser(user.toObject()) });
});

export const logoutAllDevices = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } }, { new: true }).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const token = signToken(user);
  res.json({
    ok: true,
    token,
    user: formatUser(user),
    message: 'Other devices signed out. This session stays active.',
  });
});

const deleteAccountSchema = z.object({
  password: z.string().min(1),
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const body = deleteAccountSchema.parse(req.body);
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  const ok = await bcrypt.compare(body.password, user.password);
  if (!ok) return res.status(400).json({ error: 'Password is incorrect' });

  const uid = user._id;
  const role = user.role;
  if (role === 'student') {
    const projects = await Project.find({ studentId: uid }).lean();
    const pids = projects.map((p) => p._id);
    await Rating.deleteMany({ projectId: { $in: pids } });
    await Comment.deleteMany({ $or: [{ projectId: { $in: pids } }, { userId: uid }] });
    for (const p of projects) unlinkSafe(p.fileUrl);
    await Project.deleteMany({ studentId: uid });
  } else {
    const assignments = await Assignment.find({ createdBy: uid }).lean();
    const aids = assignments.map((a) => a._id);
    const projects = await Project.find({ assignmentId: { $in: aids } }).lean();
    const pids = projects.map((p) => p._id);
    await Rating.deleteMany({ projectId: { $in: pids } });
    await Comment.deleteMany({ $or: [{ projectId: { $in: pids } }, { userId: uid }] });
    for (const p of projects) unlinkSafe(p.fileUrl);
    await Project.deleteMany({ assignmentId: { $in: aids } });
    for (const a of assignments) unlinkSafe(a.fileUrl);
    await Assignment.deleteMany({ createdBy: uid });
    await Comment.deleteMany({ userId: uid });
  }

  unlinkSafe(user.avatar);
  await User.deleteOne({ _id: uid });
  res.json({ ok: true });
});

export const listStudents = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePage(req);
  const search = (req.query.search || '').trim();
  const teacherId = new mongoose.Types.ObjectId(req.user.id);

  const myAssignments = await Assignment.find({ createdBy: teacherId }).select('_id').lean();
  const myAssignmentIds = myAssignments.map((a) => a._id);
  const totalAssignments = myAssignmentIds.length;

  const filter = { role: 'student' };
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [total, students] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).sort({ name: 1 }).skip(offset).limit(pageSize).lean(),
  ]);

  const data = await Promise.all(
    students.map(async (u) => {
      const completedIds = await Project.distinct('assignmentId', {
        studentId: u._id,
        assignmentId: { $in: myAssignmentIds },
      });
      const completed = completedIds.length;

      const projects = await Project.find({
        studentId: u._id,
        assignmentId: { $in: myAssignmentIds },
      })
        .select('_id')
        .lean();
      const pids = projects.map((p) => p._id);
      let avgScore = null;
      if (pids.length) {
        const agg = await Rating.aggregate([
          { $match: { projectId: { $in: pids }, finalScore: { $ne: null } } },
          { $group: { _id: null, avg: { $avg: '$finalScore' } } },
        ]);
        if (agg[0]?.avg != null) avgScore = Math.round(agg[0].avg);
      }

      return {
        user: formatUser(u),
        stats: {
          completedAssignments: Math.min(totalAssignments, completed),
          totalAssignments,
          avgScore,
        },
      };
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
