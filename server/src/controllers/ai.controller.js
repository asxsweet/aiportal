import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assistWithAi, evaluateWithAi } from '../services/ai.service.js';
import { ok } from '../utils/helpers.js';

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
  const out = await assistWithAi(body);
  return ok(res, out);
});

export const evaluate = asyncHandler(async (req, res) => {
  const body = evaluateSchema.parse(req.body);
  const timeoutMs = 20_000;
  try {
    const out = await Promise.race([
      evaluateWithAi(body),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI_EVALUATION_TIMEOUT')), timeoutMs);
      }),
    ]);
    return ok(res, {
      aiStatus: 'active',
      aiStatusText: 'AI is active and generating response',
      result: out,
      errorMessage: null,
    });
  } catch {
    return ok(res, {
      aiStatus: 'failed',
      aiStatusText: 'AI is not responding / failed',
      result: null,
      errorMessage: 'AI evaluation failed or not available',
    });
  }
});

