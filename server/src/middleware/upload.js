import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'node:crypto';
import { config } from '../config.js';
import { safeBaseNameFromUpload } from '../utils/filename.js';

const docExts = new Set(['.pdf', '.doc', '.docx']);
const projectVideoMimeTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const projectVideoExts = new Set(['.mp4', '.webm', '.mov']);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(subfolder) {
  const dest = path.join(config.uploadDir, subfolder);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const base = safeBaseNameFromUpload(file.originalname);
      cb(null, `${randomUUID()}-${base}`);
    },
  });
}

function assignmentFileFilter(_req, file, cb) {
  const ext = path.extname(safeBaseNameFromUpload(file.originalname)).toLowerCase();
  if (!docExts.has(ext)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF, DOC, and DOCX are allowed'));
  }
  cb(null, true);
}

function projectFileFilter(_req, file, cb) {
  const ext = path.extname(safeBaseNameFromUpload(file.originalname)).toLowerCase();
  const isDoc = docExts.has(ext);
  const isVideo = projectVideoExts.has(ext) && projectVideoMimeTypes.has(String(file.mimetype || '').toLowerCase());
  if (!isDoc && !isVideo) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF, DOC, DOCX, MP4, WEBM, or MOV are allowed'));
  }
  cb(null, true);
}

export const assignmentUpload = multer({
  storage: makeStorage('assignments'),
  fileFilter: assignmentFileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const projectUpload = multer({
  storage: makeStorage('projects'),
  fileFilter: projectFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const imageExts = new Set(['.jpg', '.jpeg', '.jfif', '.png', '.webp', '.gif']);

function imageFilter(_req, file, cb) {
  const ext = path.extname(safeBaseNameFromUpload(file.originalname)).toLowerCase();
  if (!imageExts.has(ext)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only JPG, PNG, WebP, or GIF images'));
  }
  cb(null, true);
}

export const avatarUpload = multer({
  storage: makeStorage('avatars'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
