import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {regions} from '@/lib/providers';
import {providerPayoutPages} from '@/lib/provider-payouts';
import {siteUrl} from '@/lib/seo';
import {historyDiscovery} from '@/lib/history-discovery';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/history',
    '/ai',
    '/tools',
    '/tools/4d-search',
    '/tools/hot-cold',
    '/tools/package-ranking',
    '/tools/thousand-hits',
    '/tools/digit-map',
    '/tools/favorites',
    '/about',
    '/faq',
    '/responsible-gaming',
    '/how-4d-ai-works',
    '/data-sources',
    '/pricing'
  ];
  const resultPages = ['west-malaysia', 'east-malaysia', 'cambodia'].map((region) => `/results/${region}`);
  const historyRegionPages = ['west-malaysia', 'east-malaysia', 'international'].map((region) => `/history/${region}`);
  const historyProviderPages = regions.flatMap((region) => region.providers.map((provider) => `/history/${region.slug}/${provider.code}`));
  const aiRegionPages = regions.map((region) => `/ai/${region.slug}`);
  const aiProviderPages = regions.flatMap((region) => region.providers.map((provider) => `/ai/${region.slug}/${provider.code}`));
  const providerPayoutRoutePages = providerPayoutPages.map((page) => `/providers/${page.slug}`);
  const now = new Date();
  const pages = [...staticPages, ...resultPages, ...historyRegionPages, ...historyProviderPages, ...aiRegionPages, ...aiProviderPages, ...providerPayoutRoutePages];
  const localizedPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) => pages.map((path) => ({
    url: siteUrl(`/${locale}${path}`),
    lastModified: now,
    changeFrequency: path.startsWith('/results') || path.startsWith('/history') || path.startsWith('/ai') || path === '' ? 'hourly' : 'weekly',
    priority: path.startsWith('/results') || path.startsWith('/history') || path.startsWith('/ai') || path === '' ? 0.9 : 0.6
  })));
  const legalPages: MetadataRoute.Sitemap = ['/privacy', '/terms'].map((path) => ({
    url: siteUrl(path),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.4
  }));

  const selectedHistoryPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) => historyDiscovery.flatMap((entry) => {
    const base = `/${locale}/history/${entry.region}/${entry.provider}`;
    // No invented lastModified date: verification time is not content modification time.
    return [{url: siteUrl(`${base}/archive`)}, ...entry.dates.map((date) => ({url: siteUrl(`${base}/${date}`)}))];
  }));
  return [...localizedPages, ...legalPages, ...selectedHistoryPages];
}
