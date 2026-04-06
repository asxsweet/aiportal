import path from 'path';
import fs from 'fs';
import { config } from '../config.js';

const UPLOAD_ROOT = () => path.resolve(config.uploadDir);

/**
 * Resolve a stored relative path (e.g. assignments/uuid-file.pdf) to an absolute path under uploadDir.
 * Rejects path traversal. Returns null if invalid.
 */
export function resolveStoredUploadPath(storedRelative) {
  if (storedRelative == null || typeof storedRelative !== 'string') return null;
  let rel = storedRelative.trim().replace(/\\/g, '/');
  rel = rel.replace(/^\/+/, '');
  if (!rel) return null;
  const parts = rel.split('/').filter(Boolean);
  if (!parts.length || parts.some((p) => p === '..')) return null;
  const abs = path.join(UPLOAD_ROOT(), ...parts);
  const root = UPLOAD_ROOT();
  const relativeToRoot = path.relative(root, abs);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) return null;
  return abs;
}

/** Returns absolute path if file exists on disk, else null. */
export function getExistingUploadFilePath(storedRelative) {
  const tryPath = (rel) => {
    const abs = resolveStoredUploadPath(rel);
    return abs && fs.existsSync(abs) ? abs : null;
  };
  let found = tryPath(storedRelative);
  if (found) return found;
  // Legacy DB values may include a redundant "uploads/" prefix
  const s = String(storedRelative || '').trim().replace(/\\/g, '/');
  const stripped = s.replace(/^uploads\//i, '').replace(/^\/+/, '');
  if (stripped && stripped !== s) {
    found = tryPath(stripped);
  }
  return found || null;
}
