import path from 'path';

function countCyrillicChars(s) {
  return (String(s).match(/[А-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ]/g) || []).length;
}

/**
 * Fixes common mojibake when UTF-8 filename bytes are decoded as latin1.
 * Keeps already-correct names unchanged.
 */
export function decodeOriginalFileName(name) {
  const raw = String(name || '');
  if (!raw) return '';

  // Typical mojibake markers for Cyrillic/Kazakh names.
  const likelyMojibake = /[ÐÑÒ]/.test(raw);
  if (!likelyMojibake) return raw;

  try {
    const decoded = Buffer.from(raw, 'latin1').toString('utf8');
    return countCyrillicChars(decoded) >= countCyrillicChars(raw) ? decoded : raw;
  } catch {
    return raw;
  }
}

export function safeBaseNameFromUpload(name) {
  return path.basename(decodeOriginalFileName(name));
}

