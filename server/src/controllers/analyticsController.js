import mongoose from 'mongoose';
import { User, Assignment, Project, Rating } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export const summary = asyncHandler(async (req, res) => {
  const teacherId = new mongoose.Types.ObjectId(req.user.id);

  const totalStudents = await User.countDocuments({ role: 'student' });
  const myAssignmentIds = await Assignment.find({ createdBy: teacherId }).distinct('_id');
  const myAssignments = myAssignmentIds.length;

  const pendingSubmissions = await Project.countDocuments({
    assignmentId: { $in: myAssignmentIds },
    status: 'submitted',
  });

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
  const avgPerformance = avgAgg[0]?.avg != null ? Math.round(avgAgg[0].avg) : null;

  const byAssignment = await Assignment.find({ createdBy: teacherId })
    .sort({ deadline: -1 })
    .limit(20)
    .select('title')
    .lean();

  const assignmentStatus = await Promise.all(
    byAssignment.map(async (a) => {
      const submissions = await Project.countDocuments({ assignmentId: a._id });
      const pending = Math.max(0, totalStudents - submissions);
      return {
        name: a.title.length > 24 ? `${a.title.slice(0, 24)}…` : a.title,
        completed: submissions,
        pending,
      };
    }),
  );

  const gradedRatings = await Rating.find({
    finalScore: { $ne: null },
  })
    .populate({
      path: 'projectId',
      select: 'assignmentId',
      populate: { path: 'assignmentId', select: 'createdBy' },
    })
    .lean();

  const buckets = { a: 0, b: 0, c: 0, d: 0 };
  for (const r of gradedRatings) {
    const createdBy = r.projectId?.assignmentId?.createdBy;
    if (!createdBy || String(createdBy) !== String(teacherId)) continue;
    const s = Number(r.finalScore);
    if (s >= 90) buckets.a += 1;
    else if (s >= 80) buckets.b += 1;
    else if (s >= 70) buckets.c += 1;
    else buckets.d += 1;
  }
  const gradeDistribution = [
    { name: 'A (90-100)', value: buckets.a, color: '#10b981' },
    { name: 'B (80-89)', value: buckets.b, color: '#3b82f6' },
    { name: 'C (70-79)', value: buckets.c, color: '#f59e0b' },
    { name: 'D (<70)', value: buckets.d, color: '#ef4444' },
  ];

  const teacherProjects = await Project.find({ assignmentId: { $in: myAssignmentIds } })
    .select('tools')
    .lean();
  let ev3Only = 0;
  let tinkOnly = 0;
  let both = 0;
  for (const p of teacherProjects) {
    const t = p.tools || [];
    const hasE = t.includes('ev3');
    const hasT = t.includes('tinkercad');
    if (hasE && hasT) both += 1;
    else if (hasE) ev3Only += 1;
    else if (hasT) tinkOnly += 1;
  }
  const toolUsage = [
    { name: 'EV3 Only', value: ev3Only, color: '#f97316' },
    { name: 'Tinkercad Only', value: tinkOnly, color: '#06b6d4' },
    { name: 'Both Tools', value: both, color: '#8b5cf6' },
  ];

  const topAgg = await Project.aggregate([
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
    {
      $group: {
        _id: '$studentId',
        avgScore: { $avg: '$r.finalScore' },
        assignments: { $sum: 1 },
      },
    },
    { $sort: { avgScore: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'u',
      },
    },
    { $unwind: '$u' },
  ]);

  const topStudents = topAgg.map((row, i) => ({
    name: row.u.name,
    avgScore: row.avgScore != null ? Math.round(row.avgScore) : 0,
    assignments: row.assignments || 0,
    rank: i + 1,
  }));

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const recentProjects = await Project.find({
    assignmentId: { $in: myAssignmentIds },
    createdAt: { $gte: eightWeeksAgo },
  })
    .populate({
      path: 'assignmentId',
      select: 'createdBy',
      match: { createdBy: teacherId },
    })
    .lean();

  const weekMap = new Map();
  for (const p of recentProjects) {
    if (!p.assignmentId) continue;
    const wk = startOfWeek(p.createdAt).getTime();
    if (!weekMap.has(wk)) weekMap.set(wk, { scores: [], submissions: 0 });
    const bucket = weekMap.get(wk);
    bucket.submissions += 1;
  }

  const ratingByProject = new Map(
    (await Rating.find({}).lean()).map((r) => [String(r.projectId), r]),
  );

  for (const p of recentProjects) {
    if (!p.assignmentId) continue;
    const r = ratingByProject.get(String(p._id));
    if (r?.finalScore != null) {
      const wk = startOfWeek(p.createdAt).getTime();
      const bucket = weekMap.get(wk);
      if (bucket) bucket.scores.push(Number(r.finalScore));
    }
  }

  const sortedWeeks = [...weekMap.keys()].sort((a, b) => a - b);
  const performanceTrend = sortedWeeks.map((wk, idx) => {
    const b = weekMap.get(wk);
    const avg =
      b.scores.length > 0 ? Math.round(b.scores.reduce((s, x) => s + x, 0) / b.scores.length) : 0;
    return {
      name: `W${idx + 1}`,
      avgScore: avg,
      submissions: b.submissions,
    };
  });

  res.json({
    stats: {
      totalStudents,
      myAssignments,
      pendingSubmissions,
      avgPerformance,
    },
    assignmentStatus,
    gradeDistribution,
    toolUsage,
    topStudents,
    performanceTrend,
  });
});
