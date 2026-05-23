import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';
import {RegionNav} from '@/components/RegionNav';
import {StructuredData} from '@/components/StructuredData';
import {routing, type Locale} from '@/i18n/routing';
import {regions} from '@/lib/providers';
import {buildMetadata, siteUrl} from '@/lib/seo';

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
  const t = await getTranslations({locale, namespace: 'History'});
  const historyTools = [
    {
      href: `/${locale}/tools/thousand-hits`,
      title: locale === 'zh' ? '千字中奖记录' : locale === 'ms' ? 'Rekod Menang 3D' : '3D Hit Records',
      text: locale === 'zh'
        ? '输入 3 位数字，直接查历史命中。'
        : locale === 'ms'
          ? 'Masukkan 3 digit untuk semak rekod hit sejarah.'
          : 'Enter 3 digits to check historical hit records.'
    },
    {
      href: `/${locale}/tools/search`,
      title: locale === 'zh' ? '搜索 4D 号码' : locale === 'ms' ? 'Cari nombor 4D' : 'Search 4D Numbers',
      text: locale === 'zh'
        ? '正字 / 包字 / 万字中奖记录都从这里进入。'
        : locale === 'ms'
          ? 'Carian exact / boxed / rekod menang 4D masuk dari sini.'
          : 'Use this entry for exact, boxed, and 4D winning-record searches.'
    }
  ] as const;
  return (
    <main className="container-shell py-10">
      <StructuredData data={{'@context': 'https://schema.org', '@type': 'CollectionPage', name: t('title'), url: siteUrl(`/${locale}/history`)}} />
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-800">4D AI</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{t('title')}</h1>
        <div className="mt-6"><RegionNav locale={locale} /></div>
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {regions.map((region) => (
          <Link
            key={region.slug}
            href={`/${locale}/history/${region.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300"
          >
            <h2 className="text-base font-black text-slate-950">{region.label}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {region.providers.map((provider) => (
                <ProviderLogoBadge key={provider.code} provider={provider} sizeClassName="size-9" />
              ))}
            </div>
          </Link>
        ))}
      </section>
      <section className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2 className="text-xl font-black text-slate-950">
          {locale === 'zh' ? '历史记录常用工具' : locale === 'ms' ? 'Alat sejarah kerap guna' : 'History Quick Tools'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {locale === 'zh'
            ? '同类查询放在一起，方便从历史记录直接进入。'
            : locale === 'ms'
              ? 'Alat berkaitan sejarah dihimpunkan di sini untuk akses lebih cepat.'
              : 'Related history lookups are grouped here for faster access.'}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {historyTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300">
              <h3 className="text-lg font-black text-slate-950">{tool.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tool.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
