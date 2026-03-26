export function ok(res, data, message = '') {
  return res.json({ success: true, data, message });
}

export function fail(res, message, status = 400, data = null) {
  return res.status(status).json({ success: false, data, message });
}

