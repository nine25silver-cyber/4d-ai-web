import type {Metadata} from 'next';
import {routing, type Locale} from '@/i18n/routing';

export const siteName = '4D AI';

export function siteUrl(path = ''): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function localizedAlternates(pathWithoutLocale: string) {
  const normalizedPath = pathWithoutLocale.startsWith('/') ? pathWithoutLocale : `/${pathWithoutLocale}`;
  return Object.fromEntries(routing.locales.map((locale) => [locale, siteUrl(`/${locale}${normalizedPath}`)]));
}

export function buildMetadata({locale, path, title, description}: {locale: Locale; path: string; title: string; description: string}): Metadata {
  return {
    title,
    description,
    metadataBase: new URL(siteUrl()),
    alternates: {
      canonical: siteUrl(`/${locale}${path}`),
      languages: localizedAlternates(path)
    },
    openGraph: {title, description, siteName, locale, type: 'website', url: siteUrl(`/${locale}${path}`)},
    twitter: {card: 'summary_large_image', title, description}
  };
}
