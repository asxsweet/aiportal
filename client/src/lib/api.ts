import axios, { type AxiosError, isAxiosError } from 'axios';

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
  if (body instanceof Blob || body instanceof ArrayBuffer) {
    return response;
  }
  if (body && typeof body === 'object' && 'success' in body) {
    // Keep existing callers working by unwrapping normalized envelope.
    response.data = body.data;
  }
  return response;
});

/** When `responseType: 'blob'`, error bodies are JSON as Blob — parse so getErrorMessage works. */
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (!isAxiosError(error) || !error.response) return Promise.reject(error);
    const { response, config } = error;
    const data = response.data;
    if (data instanceof Blob && config?.responseType === 'blob') {
      const ct = String(response.headers['content-type'] || '').toLowerCase();
      const small = typeof data.size === 'number' ? data.size < 65536 : true;
      if (ct.includes('application/json') || small) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text) as unknown;
          response.data = parsed;
        } catch {
          /* leave as Blob */
        }
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(err: unknown, fallback = 'Something went wrong') {
  const ax = err as AxiosError<{ error?: string; message?: string }>;
  const d = ax.response?.data;
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    const o = d as { message?: string; error?: string };
    if (typeof o.message === 'string') return o.message;
    if (typeof o.error === 'string') return o.error;
  }
  return ax.message || fallback;
}
