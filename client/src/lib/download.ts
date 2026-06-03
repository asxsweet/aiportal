import { api, getErrorMessage } from './api';

/**
 * Downloads a file from the API. Supports three cases:
 * 1. S3/cloud storage: server returns JSON { success: true, data: { downloadUrl } }
 * 2. Local file: server streams the file directly as a blob
 * 3. Error: server returns JSON error with a message
 */
export async function downloadBlob(path: string, filename: string): Promise<void> {
  try {
    const res = await api.get<Blob>(path, { responseType: 'blob' });
    const ct = String(res.headers['content-type'] || '').toLowerCase();

    // Server returned JSON — could be a presigned URL or an error
    if (ct.includes('application/json')) {
      const text = await (res.data as Blob).text();
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        console.error('[download] Failed to parse JSON response:', text.slice(0, 200));
        window.alert('Download failed: unexpected response from server');
        return;
      }

      console.log('[download] Server response:', JSON.stringify(parsed));

      // Unwrap { success: true, data: { downloadUrl } } envelope
      const data = (parsed.data && typeof parsed.data === 'object') ? parsed.data : parsed;
      const downloadUrl = (data as Record<string, unknown>).downloadUrl as string | undefined;

      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
        return;
      }

      // It's an error response
      const message = (parsed.message as string) || (data as Record<string, unknown>).message as string || 'Download failed: file not found on server';
      console.error('[download] Error from server:', message);
      window.alert(message);
      return;
    }

    // Server returned a binary file — trigger browser download
    const blob = res.data as Blob;

    // Validate blob size (empty blob = missing file)
    if (blob.size === 0) {
      console.error('[download] Empty file received from', path);
      window.alert('Download failed: file is empty or missing on server');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e: unknown) {
    console.error('[download] Network or server error:', e);

    // Try to extract a useful error message from axios error
    let msg = 'Download failed: could not connect to server';
    if (e && typeof e === 'object' && 'response' in e) {
      const axiosErr = e as { response?: { status?: number; data?: unknown }; message?: string };
      if (axiosErr.response) {
        const status = axiosErr.response.status;
        const data = axiosErr.response.data;

        // If response data is a Blob (because we requested blob), try to parse it
        if (data instanceof Blob) {
          try {
            const text = await data.text();
            const parsed = JSON.parse(text);
            msg = parsed.message || parsed.error || `Server error (${status})`;
          } catch {
            msg = `Server error (${status})`;
          }
        } else if (data && typeof data === 'object') {
          const d = data as Record<string, unknown>;
          msg = (d.message as string) || (d.error as string) || `Server error (${status})`;
        } else {
          msg = `Server error (${status})`;
        }
      } else if (axiosErr.message) {
        msg = axiosErr.message;
      }
    }

    window.alert(msg);
  }
}