import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config, isS3Configured } from '../config.js';
import fs from 'fs';
import path from 'path';
import { getExistingUploadFilePath, resolveStoredUploadPath } from '../utils/uploadPath.js';

let s3Client = null;

function getS3() {
  if (s3Client) return s3Client;
  const s = config.s3;
  s3Client = new S3Client({
    endpoint: s.endpoint,
    region: s.region || 'auto',
    credentials: {
      accessKeyId: s.accessKeyId,
      secretAccessKey: s.secretAccessKey,
    },
    forcePathStyle: true,
  });
  return s3Client;
}

/**
 * Upload a file to S3 or save to local disk.
 * @param {Buffer} buffer - file content
 * @param {string} key - S3 object key (e.g. "assignments/uuid-file.pdf")
 * @param {string} mimeType - file MIME type
 * @param {string} localDir - local subdirectory for fallback (e.g. "assignments")
 * @param {string} localPath - absolute local path (if already written by multer disk storage)
 * @returns {Promise<{storage: 's3'|'local', key: string}>}
 */
export async function uploadFile({ buffer, key, mimeType, localPath }) {
  if (isS3Configured()) {
    const client = getS3();
    await client.send(new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType || 'application/octet-stream',
    }));
    return { storage: 's3', key };
  }
  return { storage: 'local', key: localPath ? path.relative(config.uploadDir, localPath).replace(/\\/g, '/') : key };
}

/**
 * Get a download URL or local path for a file.
 * @param {string} storedKey - stored key/path from DB
 * @returns {Promise<{type: 'url', url: string} | {type: 'local', path: string} | null>}
 */
export async function getDownloadInfo(storedKey) {
  if (!storedKey) return null;

  if (isS3Configured() && storedKey.startsWith('s3://')) {
    const client = getS3();
    const key = storedKey.replace('s3://', '');
    const url = await getSignedUrl(client, new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    }), { expiresIn: 3600 });
    return { type: 'url', url };
  }

  const localPath = getExistingUploadFilePath(storedKey);
  if (!localPath) return null;
  return { type: 'local', path: localPath };
}

/**
 * Delete a file from S3 or local disk.
 * @param {string} key - stored key/path
 */
export async function deleteFile(key) {
  if (!key) return;
  if (isS3Configured() && key.startsWith('s3://')) {
    const s3Key = key.replace('s3://', '');
    const client = getS3();
    try {
      await client.send(new DeleteObjectCommand({
        Bucket: config.s3.bucket,
        Key: s3Key,
      }));
    } catch { /* ignore */ }
    return;
  }
  const localPath = getExistingUploadFilePath(key);
  if (localPath) {
    try { fs.unlinkSync(localPath); } catch { /* ignore */ }
  }
}

/**
 * Generate an S3 key from subfolder and filename.
 */
export function makeS3Key(subfolder, filename) {
  return `${subfolder}/${filename}`;
}

/**
 * Store key with s3:// prefix to distinguish from local paths.
 */
export function s3Key(key) {
  return `s3://${key}`;
}