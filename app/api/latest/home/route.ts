import { NextResponse } from 'next/server';

const HOME_FEED_URL = 'https://data.4dai88.com/latest/home.json';

export async function GET() {
  try {
    const upstreamResponse = await fetch(HOME_FEED_URL, { cache: 'no-store' });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: `Failed to load upstream home feed (${upstreamResponse.status} ${upstreamResponse.statusText})`,
        },
        { status: 502 },
      );
    }

    const payload = await upstreamResponse.json();
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to reach upstream home feed. Please try again shortly.' },
      { status: 502 },
    );
  }
}
