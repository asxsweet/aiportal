import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assistProject, evaluateProjectShort } from '../services/aiAssistant.js';

const assistSchema = z.object({
  question: z.string().trim().min(1).max(500),
  projectText: z.string().trim().max(12000).optional().default(''),
  assignmentText: z.string().trim().max(12000).optional().default(''),
  selectedTools: z.array(z.enum(['ev3', 'tinkercad'])).optional().default([]),
  language: z.enum(['en', 'ru', 'kz']).optional().default('en'),
});

const evaluateSchema = z.object({
  projectText: z.string().trim().min(1).max(12000),
  assignmentText: z.string().trim().max(12000).optional().default(''),
  selectedTools: z.array(z.enum(['ev3', 'tinkercad'])).optional().default([]),
  language: z.enum(['en', 'ru', 'kz']).optional().default('en'),
});

export const assist = asyncHandler(async (req, res) => {
  const body = assistSchema.parse(req.body);
  const out = await assistProject(body);
  res.json(out);
});

export const evaluate = asyncHandler(async (req, res) => {
  const body = evaluateSchema.parse(req.body);
  const out = await evaluateProjectShort(body);
  res.json(out);
});
