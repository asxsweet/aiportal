import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT) || 4001,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  /** Google AI Studio: https://aistudio.google.com/apikey */
  geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
  /** e.g. gemini-2.5-flash (see https://ai.google.dev/gemini-api/docs/models ) */
  geminiModel: (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim(),
};
