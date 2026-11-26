import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {AiProviderLogoGrid} from '@/components/AiProviderLogoGrid';
import {getRegion, regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const directoryCopy = {
  en: {regions: {'west-malaysia': 'West Malaysia', 'east-malaysia': 'East Malaysia', cambodia: 'Cambodia', singapore: 'Singapore'}, title: '4D AI recommendations', intro: 'Choose a company in this region to open its AI page. Full recommendations remain subject to the existing access requirements.'},
  zh: {regions: {'west-malaysia': '西马', 'east-malaysia': '东马', cambodia: '柬埔寨', singapore: '新加坡'}, title: '4D AI 推荐', intro: '选择本地区的公司，进入其 AI 页面。完整推荐仍按现有权限要求开放。'},
  ms: {regions: {'west-malaysia': 'Malaysia Barat', 'east-malaysia': 'Malaysia Timur', cambodia: 'Kemboja', singapore: 'Singapura'}, title: 'Cadangan AI 4D', intro: 'Pilih syarikat di rantau ini untuk membuka halaman AI. Cadangan penuh kekal tertakluk pada syarat akses sedia ada.'}
} as const;

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) return {};
  const copy = directoryCopy[locale];
  return buildMetadata({
    locale,
    path: `/ai/${region.slug}`,
    title: `${copy.title} - ${copy.regions[region.slug]}`,
    description: `${copy.regions[region.slug]}: ${copy.intro}`
  });
}

export default async function AiRegionPage({params}: {params: Promise<{locale: Locale; region: string}>}) {
  const {locale, region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) notFound();
  const t = await getTranslations({locale, namespace: 'AI'});
  const copy = directoryCopy[locale];
  return (
    <main className="container-shell py-8">
      <section className="border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase text-blue-800">4D AI</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{copy.regions[region.slug]} · {copy.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{copy.intro}</p>
      </section>
      <nav className="mt-4 flex flex-wrap gap-3" aria-label={copy.title}>
        {regions.map((item) => <Link key={item.slug} href={`/${locale}/ai/${item.slug}`} aria-current={item.slug === region.slug ? 'page' : undefined} className="font-bold text-blue-800 hover:underline">{copy.regions[item.slug]}</Link>)}
      </nav>
      <AiProviderLogoGrid locale={locale} regions={[region]} title={t('providerLogoGridTitle')} text={t('providerLogoGridText')} />
    </main>
  );
}
