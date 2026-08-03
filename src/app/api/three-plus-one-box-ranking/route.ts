import {NextResponse} from 'next/server';
import {
  fetchThreePlusOneBoxRanking,
  isThreePlusOneBoxRange,
  isThreePlusOneBoxSupportedProvider,
  type ThreePlusOneBoxRange
} from '@/lib/cloudflare';

function normalizeRange(value: string): ThreePlusOneBoxRange {
  return isThreePlusOneBoxRange(value) ? value : '6m';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = String(url.searchParams.get('provider') ?? '').trim();
  const rawRange = String(url.searchParams.get('range') ?? '6m').trim();

  if (!isThreePlusOneBoxSupportedProvider(provider)) {
    return NextResponse.json(
      {error: 'three_plus_one_box_invalid_provider'},
      {status: 400, headers: {'Cache-Control': 'no-store'}}
    );
  }
  if (!isThreePlusOneBoxRange(rawRange)) {
    return NextResponse.json(
      {error: 'three_plus_one_box_invalid_range'},
      {status: 400, headers: {'Cache-Control': 'no-store'}}
    );
  }

  const range = normalizeRange(rawRange);
  const feed = await fetchThreePlusOneBoxRanking(range, provider);
  if (!feed.ok) {
    return NextResponse.json(
      {error: 'three_plus_one_box_unavailable'},
      {status: 502, headers: {'Cache-Control': 'no-store'}}
    );
  }

  return NextResponse.json(feed.payload, {headers: {'Cache-Control': 'no-store'}});
}
