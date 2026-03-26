import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { config } from '../config.js';

const allowedExt = new Set(['.pdf', '.doc', '.docx']);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(subfolder) {
  const dest = path.join(config.uploadDir, subfolder);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExt.has(ext)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF, DOC, and DOCX are allowed'));
  }
  cb(null, true);
}

export const assignmentUpload = multer({
  storage: makeStorage('assignments'),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const projectUpload = multer({
  storage: makeStorage('projects'),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

const imageExts = new Set(['.jpg', '.jpeg', '.jfif', '.png', '.webp', '.gif']);

function imageFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
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
