import { Notification } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/helpers.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
  const offset = (page - 1) * pageSize;

  const [total, notifications] = await Promise.all([
    Notification.countDocuments({ userId: req.user.id }),
    Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(pageSize)
      .lean(),
  ]);

  return ok(res, {
    data: notifications,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true },
    { new: true },
  ).lean();
  if (!n) return fail(res, 'Notification not found', 404);
  return ok(res, { notification: n });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, read: false }, { $set: { read: true } });
  return ok(res, null, 'All notifications marked as read');
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user.id, read: false });
  return ok(res, { count });
});

export const createNotification = async (userId, type, title, message = '', link = '') => {
  try {
    await Notification.create({ userId, type, title, message, link });
  } catch { /* non-blocking */ }
};