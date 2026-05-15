interface CacheEntry<T> {
  data: T;
  storedAt: number;
  ttl: number;
}

export function cacheGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.storedAt + entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { data, storedAt: Date.now(), ttl: ttlMs };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    // QuotaExceededError — degrade silently, data still lives in memory
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded — cache write skipped');
    }
  }
}

export function cacheGetRaw(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function cacheSetRaw(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota errors for raw values
  }
}

export function cacheClear(prefix?: string): void {
  if (typeof window === 'undefined') return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (!prefix || k.startsWith(prefix))) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

export const TTL = {
  FIFTEEN_MIN: 15 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
} as const;
