import {NextResponse} from 'next/server';
import {fetchHistoryDaily} from '@/lib/cloudflare';
import {regions} from '@/lib/providers';

const validProviderCodes = new Set(regions.flatMap((region) => region.providers.map((provider) => provider.code)));

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const provider = String(searchParams.get('provider') ?? '').trim();
  const date = String(searchParams.get('date') ?? '').trim();

  if (!provider) {
    return NextResponse.json({ok: false, providerCode: provider, url: '', reason: 'missing_provider', requestedDate: date}, {status: 400});
  }
  if (!validProviderCodes.has(provider)) {
    return NextResponse.json({ok: false, providerCode: provider, url: '', reason: 'invalid_provider', requestedDate: date}, {status: 400});
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ok: false, providerCode: provider, url: '', reason: 'invalid_date', requestedDate: date}, {status: 400});
  }

  const result = await fetchHistoryDaily(provider, date);
  return NextResponse.json(result, {status: result.ok ? 200 : 502});
}
