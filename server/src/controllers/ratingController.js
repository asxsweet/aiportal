import mongoose from 'mongoose';
import { z } from 'zod';
import { Rating, Project } from '../models/index.js';
import { formatRating } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { computeFinalScore } from '../services/aiEvaluation.js';

const patchSchema = z.object({
  teacherScore: z.number().int().min(0).max(100),
  teacherFeedback: z.string().min(1).max(8000),
});

export const patchByProject = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
    return res.status(400).json({ error: 'Invalid project id' });
  }
  const body = patchSchema.parse(req.body);

  const rating = await Rating.findOne({ projectId: req.params.projectId }).lean();
  if (!rating) return res.status(404).json({ error: 'Rating not found' });

  const project = await Project.findById(req.params.projectId).populate({ path: 'assignmentId', select: 'createdBy' }).lean();
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const ownerId = project.assignmentId?.createdBy ? String(project.assignmentId.createdBy) : null;
  if (ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

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

  res.json({ rating: formatRating(updated) });
});
