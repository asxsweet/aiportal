import { z } from 'zod';

export const assignmentToolsSchema = z.array(z.enum(['ev3', 'tinkercad'])).min(1);

export const assignmentCreateSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  deadline: z.string().min(1).refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid deadline'),
});

export const assignmentUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  deadline: z.string().min(1).refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid deadline').optional(),
  status: z.enum(['active', 'archived']).optional(),
});

