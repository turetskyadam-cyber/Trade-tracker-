import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ids = req.nextUrl.searchParams.get('ids');
  if (!ids) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
  }

  const idList = ids.split(',').filter(Boolean);
  if (idList.length === 0) {
    return NextResponse.json({ result: {} });
  }

  try {
    // Batch lookup — Robinhood supports ?ids=uuid1,uuid2,...
    const url = `https://api.robinhood.com/instruments/?ids=${encodeURIComponent(ids)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Robinhood API error' }, { status: res.status });
    }

    const data = await res.json();
    const result: Record<string, { symbol: string; name: string }> = {};

    for (const instrument of data.results ?? []) {
      result[instrument.id] = {
        symbol: instrument.symbol,
        name: instrument.simple_name || instrument.name || instrument.symbol,
      };
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error('Instruments route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
