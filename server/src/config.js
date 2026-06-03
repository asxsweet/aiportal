import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultUploadDir = path.join(__dirname, '../../uploads');
function resolveUploadDir() {
  const raw = process.env.UPLOAD_DIR;
  if (!raw || !String(raw).trim()) return path.resolve(defaultUploadDir);
  const s = String(raw).trim();
  return path.isAbsolute(s) ? path.resolve(s) : path.resolve(process.cwd(), s);
}

export const config = {
  port: Number(process.env.PORT) || 4001,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  uploadDir: resolveUploadDir(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  /** Google AI Studio: https://aistudio.google.com/apikey */
  geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
  /** e.g. gemini-2.5-flash (see https://ai.google.dev/gemini-api/docs/models ) */
  geminiModel: (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim(),
  /** S3-compatible storage (Cloudflare R2 / AWS S3). If S3_BUCKET is set, files go to cloud instead of local disk. */
  s3: {
    endpoint: (process.env.S3_ENDPOINT || '').trim(),
    region: (process.env.S3_REGION || 'auto').trim(),
    bucket: (process.env.S3_BUCKET || '').trim(),
    accessKeyId: (process.env.S3_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: (process.env.S3_SECRET_ACCESS_KEY || '').trim(),
    publicUrl: (process.env.S3_PUBLIC_URL || '').trim(),
  },
};

export function isS3Configured() {
  const s = config.s3;
  return Boolean(s.bucket && s.accessKeyId && s.secretAccessKey && s.endpoint);
}
