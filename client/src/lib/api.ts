import axios, { type AxiosError } from 'axios';

/** Base origin only (e.g. http://localhost:4001). Paths in code start with /api/... — trailing /api here would duplicate and 404. */
function normalizeApiBase(raw: string | undefined): string {
  if (!raw) return '';
  let s = String(raw).trim().replace(/\/+$/, '');
  if (s.endsWith('/api')) s = s.slice(0, -4).replace(/\/+$/, '') || '';
  return s;
}

const baseURL = normalizeApiBase(import.meta.env.VITE_API_URL);

/** Omit default Content-Type so `FormData` gets a proper multipart boundary (multer needs `req.file`). */
export const api = axios.create({
  baseURL,
});

const TOKEN_KEY = 'rep_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }
  return config;
});

api.interceptors.response.use((response) => {
  const body = response.data as { success?: boolean; data?: unknown };
  if (body && typeof body === 'object' && 'success' in body) {
    // Keep existing callers working by unwrapping normalized envelope.
    response.data = body.data;
  }
  return response;
});

export function getErrorMessage(err: unknown, fallback = 'Something went wrong') {
  const ax = err as AxiosError<{ error?: string; message?: string }>;
  return ax.response?.data?.message || ax.response?.data?.error || ax.message || fallback;
}
