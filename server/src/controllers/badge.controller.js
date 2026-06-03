import mongoose from 'mongoose';
import { Badge, Project, Rating } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/helpers.js';

export const getMyBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find({ userId: req.user.id }).sort({ earnedAt: -1 }).lean();
  return ok(res, { badges });
});

export const checkAndAwardBadges = async (userId) => {
  const earned = new Set((await Badge.find({ userId }).select('type').lean()).map((b) => b.type));
  const toAward = [];

  const projectCount = await Project.countDocuments({ studentId: userId });
  if (!earned.has('first_project') && projectCount >= 1) toAward.push('first_project');
  if (!earned.has('three_projects') && projectCount >= 3) toAward.push('three_projects');
  if (!earned.has('five_projects') && projectCount >= 5) toAward.push('five_projects');
  if (!earned.has('ten_projects') && projectCount >= 10) toAward.push('ten_projects');

  const ratings = await Rating.find({}).lean();
  const projectIds = ratings.map((r) => r.projectId);
  const gradedProjects = await Project.find({ _id: { $in: projectIds }, studentId: userId }).lean();
  const userRatings = ratings.filter((r) => gradedProjects.some((p) => String(p._id) === String(r.projectId)));

  if (userRatings.length > 0) {
    const avgFinal = userRatings.filter((r) => r.finalScore != null);
    if (!earned.has('high_score') && avgFinal.some((r) => r.finalScore >= 80)) toAward.push('high_score');
    if (!earned.has('excellent_score') && avgFinal.some((r) => r.finalScore >= 90)) toAward.push('excellent_score');
    if (!earned.has('perfect_score') && avgFinal.some((r) => r.finalScore >= 100)) toAward.push('perfect_score');

    const anyRating = userRatings[0];
    if (!earned.has('algorithm_master') && anyRating.aiAlgorithm >= 90) toAward.push('algorithm_master');
    if (!earned.has('presentation_pro') && anyRating.aiPresentation != null && anyRating.aiPresentation >= 90) toAward.push('presentation_pro');
    if (!earned.has('problem_solver') && anyRating.aiProblemSolving != null && anyRating.aiProblemSolving >= 90) toAward.push('problem_solver');
    if (!earned.has('innovation_star') && anyRating.aiInnovation != null && anyRating.aiInnovation >= 90) toAward.push('innovation_star');
    if (!earned.has('safety_first') && anyRating.aiSafety != null && anyRating.aiSafety >= 90) toAward.push('safety_first');
  }

  if (toAward.length > 0) {
    await Badge.insertMany(toAward.map((type) => ({ userId, type })));
  }

  return toAward;
};

export const getAllBadgeTypes = asyncHandler(async (req, res) => {
  const types = [
    { type: 'first_project', category: 'projects' },
    { type: 'three_projects', category: 'projects' },
    { type: 'five_projects', category: 'projects' },
    { type: 'ten_projects', category: 'projects' },
    { type: 'high_score', category: 'scores' },
    { type: 'excellent_score', category: 'scores' },
    { type: 'perfect_score', category: 'scores' },
    { type: 'algorithm_master', category: 'criteria' },
    { type: 'presentation_pro', category: 'criteria' },
    { type: 'problem_solver', category: 'criteria' },
    { type: 'innovation_star', category: 'criteria' },
    { type: 'safety_first', category: 'criteria' },
    { type: 'early_bird', category: 'special' },
    { type: 'streak_three', category: 'special' },
  ];
  return ok(res, { types });
});