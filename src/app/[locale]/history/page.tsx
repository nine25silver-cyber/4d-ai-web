import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {routing, type Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'History'});
  return buildMetadata({locale, path: '/history', title: t('metaTitle'), description: t('metaDescription')});
}

export default async function HistoryPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  redirect(`/${locale}/history/west-malaysia`);
}
