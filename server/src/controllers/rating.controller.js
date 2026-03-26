import mongoose from 'mongoose';
import { z } from 'zod';
import { Rating, Project } from '../models/index.js';
import { formatRating } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { computeFinalScore } from '../services/aiEvaluation.js';
import { ok, fail } from '../utils/helpers.js';

const patchSchema = z.object({
  teacherScore: z.number().int().min(0).max(100),
  teacherFeedback: z.string().min(1).max(8000),
});

export const patchRatingByProject = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
    return fail(res, 'Invalid project id', 400);
  }
  const body = patchSchema.parse(req.body);

  const rating = await Rating.findOne({ projectId: req.params.projectId }).lean();
  if (!rating) return fail(res, 'Rating not found', 404);

  const project = await Project.findById(req.params.projectId).populate({ path: 'assignmentId', select: 'createdBy' }).lean();
  if (!project) return fail(res, 'Project not found', 404);
  const ownerId = project.assignmentId?.createdBy ? String(project.assignmentId.createdBy) : null;
  if (ownerId !== req.user.id) return fail(res, 'Forbidden', 403);

  const idea = rating.aiIdea ?? rating.aiScore;
  const alg = rating.aiAlgorithm ?? rating.aiScore;
  const tech = rating.aiTechnical ?? rating.aiScore;
  const tools = rating.aiTools ?? rating.aiScore;
  const aiAvg = Math.round((idea + alg + tech + tools) / 4);
  const finalScore = computeFinalScore(aiAvg, body.teacherScore);

  const updated = await Rating.findOneAndUpdate(
    { projectId: req.params.projectId },
    {
      $set: {
        teacherScore: body.teacherScore,
        teacherFeedback: body.teacherFeedback,
        finalScore,
        gradedAt: new Date(),
      },
    },
    { new: true },
  ).lean();

  await Project.updateOne({ _id: req.params.projectId }, { $set: { status: 'graded' } });

  return ok(res, { rating: formatRating(updated) }, 'Rating updated');
});

