import mongoose from 'mongoose';
import { Assignment, Project, Rating } from '../models/index.js';
import { formatAssignment } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/helpers.js';

function parsePage(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export const getStudentDashboard = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePage(req);
  const studentOid = new mongoose.Types.ObjectId(req.user.id);
  const total = await Assignment.countDocuments({ status: { $ne: 'archived' } });
  const rows = await Assignment.find({ status: { $ne: 'archived' } })
    .sort({ deadline: 1, createdAt: -1 })
    .skip(offset)
    .limit(pageSize)
    .populate('createdBy', 'name')
    .lean();

  const data = await Promise.all(
    rows.map(async (a) => {
      const project = await Project.findOne({ assignmentId: a._id, studentId: studentOid }).lean();
      const rating = project ? await Rating.findOne({ projectId: project._id }).lean() : null;
      const deadline = new Date(a.deadline);
      const now = new Date();
      let status = 'pending';
      if (project) status = rating?.teacherScore != null || project.status === 'graded' ? 'graded' : 'submitted';
      else if (deadline < now) status = 'overdue';
      const assignmentStatus = a.status === 'archived' ? 'archived' : (deadline < now ? 'expired' : 'active');
      const idea = rating?.aiIdea ?? rating?.aiScore;
      const alg = rating?.aiAlgorithm ?? rating?.aiScore;
      const tech = rating?.aiTechnical ?? rating?.aiScore;
      const tools = rating?.aiTools ?? rating?.aiScore;
      const aiOverall = idea != null ? Math.round((idea + alg + tech + tools) / 4) : null;
      return {
        assignment: formatAssignment({ ...a, status: assignmentStatus }, a.createdBy?.name),
        projectId: project ? String(project._id) : null,
        status,
        finalScore: rating?.finalScore != null ? Number(rating.finalScore) : null,
        teacherScore: rating?.teacherScore,
        aiScore: aiOverall,
      };
    }),
  );

  return ok(res, { data, page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 });
});

