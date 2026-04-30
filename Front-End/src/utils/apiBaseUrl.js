/**
 * Resolves the API base used by the Vite app.
 * - Dev: VITE_API_URL unset → "/api" (Vite proxy → backend)
 * - Prod: set VITE_API_URL to your backend origin; "/api" is appended if missing
 */
export function getApiBaseUrl() {
  // In local development, always use same-origin /api through Vite proxy
  // so CSRF cookie and header flow remains consistent.
  if (import.meta.env.DEV) return '/api';

  const raw = (import.meta.env.VITE_API_URL || '/api').trim();
  if (!raw || raw === '/api') return '/api';

  const base = raw.replace(/\/+$/, '');
  if (base.startsWith('http') && !/\/api$/i.test(base)) {
    return `${base}/api`;
  }
  return base;
}
