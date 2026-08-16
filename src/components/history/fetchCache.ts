/**
 * V0.3 P0-5 — shared fetch cache for client components.
 *
 * JourneyExplorer mounts Timeline + HistoryMap + PersonLifespanTimeline +
 * ContemporaryWorldPanel together; without this they would re-request the
 * same /api/* data several times per render. cachedFetchJson dedupes
 * in-flight requests and caches results for a short TTL (seed data is
 * static, so 30s is plenty).
 */
const CACHE_TTL_MS = 30_000;

interface CacheEntry {
  data: unknown;
  at: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

export function cachedFetchJson(url: string): Promise<unknown> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return Promise.resolve(hit.data);
  }
  const pending = inflight.get(url);
  if (pending) return pending;

  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`fetch ${url} → ${r.status}`);
      return r.json();
    })
    .then((data) => {
      cache.set(url, { data, at: Date.now() });
      return data;
    })
    .finally(() => {
      inflight.delete(url);
    });
  inflight.set(url, p);
  return p;
}

/** test hook: clear cached data (used by tests to isolate cases). */
export function clearFetchCache(): void {
  cache.clear();
}
