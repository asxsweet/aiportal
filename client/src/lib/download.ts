import { api, getErrorMessage } from './api';

export async function downloadBlob(path: string, filename: string) {
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
      throw new Error(msg);
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
    throw e;
  }
}
