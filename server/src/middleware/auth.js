import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/index.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const tvRaw = payload.tv != null ? Number(payload.tv) : 0;
  const tvInToken = Number.isFinite(tvRaw) ? tvRaw : 0;

  User.findById(payload.sub)
    .select('tokenVersion')
    .lean()
    .then((user) => {
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const uTv = Number(user.tokenVersion) || 0;
      if (uTv !== tvInToken) {
        return res.status(401).json({ error: 'Session expired' });
      }
      req.user = { id: payload.sub, role: payload.role };
      next();
    })
    .catch(() => res.status(401).json({ error: 'Unauthorized' }));
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
