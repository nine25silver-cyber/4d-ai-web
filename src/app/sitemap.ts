import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {regions} from '@/lib/providers';
import {siteUrl} from '@/lib/seo';

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
    '/pricing'
  ];
  const resultPages = regions.map((region) => `/results/${region.slug}`);
  const historyRegionPages = regions.map((region) => `/history/${region.slug}`);
  const historyProviderPages = regions.flatMap((region) => region.providers.map((provider) => `/history/${region.slug}/${provider.code}`));
  const aiRegionPages = regions.map((region) => `/ai/${region.slug}`);
  const aiProviderPages = regions.flatMap((region) => region.providers.map((provider) => `/ai/${region.slug}/${provider.code}`));
  const now = new Date();
  const pages = [...staticPages, ...resultPages, ...historyRegionPages, ...historyProviderPages, ...aiRegionPages, ...aiProviderPages];
  return routing.locales.flatMap((locale) => pages.map((path) => ({
    url: siteUrl(`/${locale}${path}`),
    lastModified: now,
    changeFrequency: path.startsWith('/results') || path.startsWith('/history') || path.startsWith('/ai') || path === '' ? 'hourly' : 'weekly',
    priority: path.startsWith('/results') || path.startsWith('/history') || path.startsWith('/ai') || path === '' ? 0.9 : 0.6
  })));
}
