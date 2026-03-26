import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

app.use(
  cors({
    origin: config.clientOrigin,
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
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.use(errorHandler);

export default app;
