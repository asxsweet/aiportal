import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import projectRoutes from './routes/project.routes.js';
import commentRoutes from './routes/comment.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import userRoutes from './routes/user.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import studentRoutes from './routes/student.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://aiportal-five.vercel.app'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const avatarsDir = path.join(config.uploadDir, 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

app.use('/api/avatars-files', express.static(avatarsDir));

app.get('/api/health', (_req, res) => {
  const geminiKeyConfigured = Boolean(config.geminiApiKey);
  res.json({
    ok: true,
    ai: {
      /** 'gemini' if API key is set (submissions will try Gemini first); else local heuristic only */
      provider: geminiKeyConfigured ? 'gemini' : 'heuristic',
      geminiModel: geminiKeyConfigured ? config.geminiModel : null,
      geminiKeyConfigured,
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found', path: req.path });
});

app.use(errorHandler);

export default app;
