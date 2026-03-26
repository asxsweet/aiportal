/**
 * Example CRUD controller pattern (reference only — not mounted).
 * Real resources: see assignmentController.js, projectController.js, etc.
 */
import { asyncHandler } from '../utils/asyncHandler.js';

// import { Widget } from '../models/index.js';

export const list = asyncHandler(async (req, res) => {
  // const items = await Widget.find().lean();
  // res.json({ data: items });
  res.status(501).json({ error: 'Example only' });
});

export const getById = asyncHandler(async (req, res) => {
  // const doc = await Widget.findById(req.params.id).lean();
  // if (!doc) return res.status(404).json({ error: 'Not found' });
  // res.json({ widget: doc });
  res.status(501).json({ error: 'Example only' });
});

export const create = asyncHandler(async (req, res) => {
  // const doc = await Widget.create(req.body);
  // res.status(201).json({ widget: doc });
  res.status(501).json({ error: 'Example only' });
});

export const update = asyncHandler(async (req, res) => {
  // const doc = await Widget.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  // if (!doc) return res.status(404).json({ error: 'Not found' });
  // res.json({ widget: doc });
  res.status(501).json({ error: 'Example only' });
});

export const remove = asyncHandler(async (req, res) => {
  // const r = await Widget.deleteOne({ _id: req.params.id });
  // if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  // res.status(204).send();
  res.status(501).json({ error: 'Example only' });
});
