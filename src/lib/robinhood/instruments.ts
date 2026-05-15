import { cacheGet, cacheSet, TTL } from '@/lib/storage/cache';

type InstrumentMap = Record<string, { symbol: string; name: string }>;

function extractInstrumentId(url: string): string {
  // https://api.robinhood.com/instruments/450dfc6d-5510-4d40-abfb-f633b7d9be3e/
  return url.split('/').filter(Boolean).pop() ?? url;
}

export async function resolveInstruments(
  instrumentUrls: string[],
  token: string
): Promise<InstrumentMap> {
  const cached: InstrumentMap = cacheGet<InstrumentMap>('rh_instruments') ?? {};
  const result: InstrumentMap = { ...cached };

  const ids = [...new Set(instrumentUrls.map(extractInstrumentId))].filter(
    (id) => !result[id]
  );

  if (ids.length === 0) return result;

  // Fetch in batches of 50
  const BATCH = 50;
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    try {
      const res = await fetch(`/api/robinhood/instruments?ids=${batch.join(',')}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) continue;
      const data = await res.json();
      Object.assign(result, data.result ?? {});
    } catch {
      // non-fatal — symbol will show as unknown
    }
  }

  cacheSet('rh_instruments', result, TTL.ONE_DAY);
  return result;
}

export { extractInstrumentId };
