import { NextResponse } from 'next/server';
import { PROVIDERS } from '@/lib/providers';

const SUPPORTED_PROVIDERS = new Set<string>(PROVIDERS);
const BASE_PROVIDER_URL = 'https://data.4dai88.com/latest/providers';

export async function GET(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;

  if (!SUPPORTED_PROVIDERS.has(provider)) {
    return NextResponse.json(
      {
        error: `Unsupported provider '${provider}'. Supported providers: ${PROVIDERS.join(', ')}`,
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(`${BASE_PROVIDER_URL}/${provider}.json`, { cache: 'no-store' });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: `Failed to load upstream ${provider} feed (${upstreamResponse.status} ${upstreamResponse.statusText})`,
        },
        { status: 502 },
      );
    }

    const payload = await upstreamResponse.json();
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: `Failed to reach upstream ${provider} feed. Please try again shortly.` },
      { status: 502 },
    );
  }
}
