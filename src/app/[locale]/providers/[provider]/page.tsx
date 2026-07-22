import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {routing, type Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';
import {ProviderPayoutContent} from '@/components/ProviderPayoutContent';
import {providerPayoutPages, providerPayoutsBySlug, type ProviderPayoutSlug} from '@/lib/provider-payouts';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => providerPayoutPages.map((page) => ({locale, provider: page.slug})));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale; provider: string}>}): Promise<Metadata> {
  const {locale, provider} = await params;
  const page = providerPayoutsBySlug.get(provider as ProviderPayoutSlug);
  if (!page) return {};
  return buildMetadata({
    locale,
    path: `/providers/${page.slug}`,
    title: page.metaTitle[locale],
    description: page.metaDescription[locale]
  });
}

export default async function ProviderPayoutPage({params}: {params: Promise<{locale: Locale; provider: string}>}) {
  const {locale, provider} = await params;
  const page = providerPayoutsBySlug.get(provider as ProviderPayoutSlug);
  if (!page) notFound();

  return <ProviderPayoutContent locale={locale} page={page} />;
}
