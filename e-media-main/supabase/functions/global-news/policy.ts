export const CACHE_MS = 30 * 60 * 1000;
export function cacheIsFresh(fetchedAt: string | null, now: number) {
  return fetchedAt !== null && now - Date.parse(fetchedAt) < CACHE_MS;
}
export function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}