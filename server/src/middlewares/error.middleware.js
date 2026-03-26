import multer from 'multer';
import mongoose from 'mongoose';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message || 'File upload error' });
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: err.message,
      details: Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message])),
    });
  }
  if (err instanceof mongoose.Error.CastError) return res.status(400).json({ error: 'Invalid id' });
  if (err?.code === 11000) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    return res.status(409).json({ error: 'Duplicate key', field });
  }
  if (err?.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  if (status >= 500) console.error(err);
  return res.status(status).json({ error: message });
}

