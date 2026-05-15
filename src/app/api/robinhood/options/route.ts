import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cursor = req.nextUrl.searchParams.get('cursor');
  const url = cursor
    ? `https://api.robinhood.com/options/orders/?cursor=${encodeURIComponent(cursor)}`
    : 'https://api.robinhood.com/options/orders/';

  try {
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

    let next_cursor: string | null = null;
    if (data.next) {
      try {
        const nextUrl = new URL(data.next);
        next_cursor = nextUrl.searchParams.get('cursor');
      } catch {
        next_cursor = null;
      }
    }

    return NextResponse.json({ results: data.results, next_cursor });
  } catch (err) {
    console.error('Options route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
