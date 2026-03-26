/**
 * URL for API static files (avatars). Paths under `/api/` stay same-origin so Vite proxy
 * always works; avoids broken images when `VITE_API_URL` points to another host/port.
 */
export function apiStaticUrl(relativePath: string | null | undefined): string | undefined {
  if (!relativePath) return undefined;
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  if (path.startsWith('/api/')) {
    return path;
  }
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  return base ? `${base}${path}` : path;
}
