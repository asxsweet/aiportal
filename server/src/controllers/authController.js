import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/index.js';
import { config } from '../config.js';
import { formatUser } from '../utils/dto.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
  res.status(201).json({ user: u, token });
});

export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ email: body.email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ user: formatUser(user), token: signToken(user) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: formatUser(user) });
});
