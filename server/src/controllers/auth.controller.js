import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/index.js';
import { config } from '../config.js';
import { formatUser } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/helpers.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255),
  role: z.enum(['teacher', 'student']),
  institution: z.string().max(255).optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function signToken(user) {
  const tv = user.tokenVersion != null ? Number(user.tokenVersion) : 0;
  return jwt.sign({ sub: String(user._id), role: user.role, tv }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export const register = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const hash = await bcrypt.hash(body.password, 10);
  const user = await User.create({
    email: body.email.toLowerCase(),
    password: hash,
    name: body.name,
    role: body.role,
    institution: body.institution ?? '',
  });
  const u = formatUser(user);
  const token = signToken(user);
  return ok(res, { user: u, token }, 'Registered');
});

export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ email: body.email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    return fail(res, 'Invalid email or password', 401);
  }
  return ok(res, { user: formatUser(user), token: signToken(user) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return fail(res, 'User not found', 404);
  return ok(res, { user: formatUser(user) });
});

