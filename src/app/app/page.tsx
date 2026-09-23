import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {buildGooglePlayUrl, buildWebUrl, resolveDevice} from '@/lib/app-smart-link';

export const metadata: Metadata = {
  title: 'Download 4D AI',
  description: 'Download the 4D AI Android app from Google Play or continue using the 4D AI web version.'
};

export const dynamic = 'force-dynamic';

export default async function AppDownloadPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  const params = await searchParams;
  const device = resolveDevice(requestHeaders.get('user-agent') ?? '');

  if (device === 'android') {
    redirect(buildGooglePlayUrl(params, requestHeaders));
  }

  redirect(buildWebUrl(params));
}
