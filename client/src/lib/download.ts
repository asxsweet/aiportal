import { api, getErrorMessage } from './api';

/**
 * Downloads a binary from the API. Shows errors via alert and resolves without throwing
 * so callers are not left with uncaught promise rejections.
 */
export async function downloadBlob(path: string, filename: string): Promise<void> {
  try {
    const res = await api.get(path, { responseType: 'blob' });
    const ct = String(res.headers['content-type'] || '').toLowerCase();
    if (ct.includes('application/json')) {
      const text = await (res.data as Blob).text();
      let msg = 'Download failed';
      try {
        const j = JSON.parse(text) as { message?: string; error?: string };
        msg = j.message || j.error || msg;
      } catch {
        /* keep default */
      }
      window.alert(msg);
      return;
    }
    const blob = res.data as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    const msg = getErrorMessage(e, 'Download failed');
    window.alert(msg);
  }
}
