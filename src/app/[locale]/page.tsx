import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {routing, type Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';

export async function generateStaticParams() { return routing.locales.map((locale) => ({locale})); }

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  return buildMetadata({
    locale,
    path: '/results/west-malaysia',
    title: 'Latest 4D Results',
    description: 'View latest 4D results for West Malaysia, East Malaysia, Cambodia and Singapore.'
  });
}

export default async function HomePage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  redirect(`/${locale}/results/west-malaysia`);
}
