import { cacheGetRaw, cacheSetRaw } from '@/lib/storage/cache';

// Robinhood's public mobile OAuth client ID (not a secret)
export const RH_CLIENT_ID = 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS';

export interface AuthData {
  access_token: string;
  expires_at: number;
}

export function getOrCreateDeviceToken(): string {
  const existing = cacheGetRaw('rh_device_token');
  if (existing) return existing;
  const token = crypto.randomUUID();
  cacheSetRaw('rh_device_token', token);
  return token;
}

export function getStoredAuth(): AuthData | null {
  try {
    const raw = cacheGetRaw('rh_auth');
    if (!raw) return null;
    const auth: AuthData = JSON.parse(raw);
    // 5-minute buffer before expiry
    if (auth.expires_at < Date.now() + 5 * 60 * 1000) return null;
    return auth;
  } catch {
    return null;
  }
}

export function storeAuth(access_token: string, expires_in: number): void {
  const auth: AuthData = {
    access_token,
    expires_at: Date.now() + expires_in * 1000,
  };
  cacheSetRaw('rh_auth', JSON.stringify(auth));
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  // Clear all rh_ prefixed keys
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('rh_')) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
