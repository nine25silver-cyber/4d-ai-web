import {NextResponse} from 'next/server';
import {fetchRegionLatest} from '@/lib/cloudflare';
import {getRegion} from '@/lib/providers';

export async function GET(_request: Request, {params}: {params: Promise<{region: string}>}) {
  const {region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) {
    return NextResponse.json({error: 'region_not_found'}, {status: 404});
  }

  const results = await fetchRegionLatest(region.providers.map((provider) => provider.code), {cache: 'no-store'});
  return NextResponse.json(
    {region: region.slug, updatedAt: new Date().toISOString(), results},
    {headers: {'Cache-Control': 'no-store'}}
  );
}
