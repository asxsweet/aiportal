import { api, getErrorMessage } from './api';

/**
 * Downloads a file from the API. Supports both direct blob downloads (local files)
 * and presigned S3 URLs returned as JSON. Shows errors via alert.
 */
export async function downloadBlob(path: string, filename: string): Promise<void> {
  try {
    const res = await api.get(path, { responseType: 'blob' });
    const ct = String(res.headers['content-type'] || '').toLowerCase();

    if (ct.includes('application/json')) {
      const text = await (res.data as Blob).text();
      let parsed: { downloadUrl?: string; message?: string; error?: string } = {};
      try {
        parsed = JSON.parse(text);
      } catch { /* keep default */ }

      if (parsed.downloadUrl) {
        window.open(parsed.downloadUrl, '_blank');
        return;
      }

      let msg = 'Download failed';
      try {
        const j = parsed as { message?: string; error?: string };
        msg = j.message || j.error || msg;
      } catch { /* keep default */ }
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