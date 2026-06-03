import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { LearningMaterial } from '../models/index.js';
import { config, isS3Configured } from '../config.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/helpers.js';
import { safeBaseNameFromUpload } from '../utils/filename.js';
import { getExistingUploadFilePath } from '../utils/uploadPath.js';
import { uploadFile, getDownloadInfo, deleteFile, makeS3Key, s3Key } from '../services/storage.js';

export const listMaterials = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  const materials = await LearningMaterial.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name')
    .lean();
  return ok(res, { materials });
});

export const getMaterialsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const materials = await LearningMaterial.find({ category })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name')
    .lean();
  return ok(res, { materials });
});

export const createMaterial = asyncHandler(async (req, res) => {
  const { category, title, description } = req.body;
  if (!category || !title) {
    return fail(res, 'Category and title are required', 400);
  }
  let fileUrl = '';
  let originalName = '';
  if (req.file) {
    originalName = safeBaseNameFromUpload(req.file.originalname);
    if (isS3Configured() && req.file.buffer) {
      const key = makeS3Key('materials', `${Date.now()}-${originalName}`);
      const result = await uploadFile({ buffer: req.file.buffer, key, mimeType: req.file.mimetype });
      fileUrl = s3Key(key);
    } else {
      fileUrl = path.relative(config.uploadDir, req.file.path).replace(/\\/g, '/');
    }
  }
  try {
    const doc = await LearningMaterial.create({
      category,
      title,
      description: description || '',
      fileUrl,
      originalName,
      createdBy: req.user.id,
    });
    const populated = await LearningMaterial.findById(doc._id).populate('createdBy', 'name').lean();
    return ok(res, { material: populated }, 'Material created');
  } catch (e) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw e;
  }
});

export const deleteMaterial = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return fail(res, 'Invalid id', 400);
  const m = await LearningMaterial.findOne({ _id: req.params.id, createdBy: req.user.id }).lean();
  if (!m) return fail(res, 'Material not found', 404);
  if (m.fileUrl) await deleteFile(m.fileUrl);
  await LearningMaterial.deleteOne({ _id: m._id });
  return ok(res, null, 'Material deleted');
});

export const downloadMaterial = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return fail(res, 'Invalid id', 400);
  const m = await LearningMaterial.findById(req.params.id).lean();
  if (!m?.fileUrl) return fail(res, 'File not found', 404);
  const info = await getDownloadInfo(m.fileUrl);
  if (!info) return fail(res, 'File missing', 404);
  if (info.type === 'url') return ok(res, { downloadUrl: info.url });
  res.download(info.path, m.originalName || 'material');
});