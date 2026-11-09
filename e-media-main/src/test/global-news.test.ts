import { describe, expect, it } from 'vitest';
import { cacheIsFresh, safeUrl } from '../../supabase/functions/global-news/policy';

describe('Global news protection', () => {
  it('shares cached results for thirty minutes to bound provider usage', () => {
    const now = Date.parse('2026-10-17T21:00:00Z');
    expect(cacheIsFresh('2026-10-17T20:31:00Z', now)).toBe(true);
    expect(cacheIsFresh('2026-10-17T20:30:00Z', now)).toBe(false);
    expect(cacheIsFresh(null, now)).toBe(false);
  });
  it('rejects executable or insecure publisher links', () => {
    expect(safeUrl('javascript:alert(1)')).toBe(null);
    expect(safeUrl('http://example.com')).toBe(null);
    expect(safeUrl('https://example.com/story')).toBe('https://example.com/story');
  });
});