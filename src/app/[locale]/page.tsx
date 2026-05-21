import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import type {Metadata} from 'next';
import {RegionNav} from '@/components/RegionNav';
import {StructuredData} from '@/components/StructuredData';
import {routing, type Locale} from '@/i18n/routing';
import {buildMetadata, siteUrl} from '@/lib/seo';

export async function generateStaticParams() { return routing.locales.map((locale) => ({locale})); }

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Home'});
  return buildMetadata({locale, path: '', title: t('metaTitle'), description: t('metaDescription')});
}

export default async function HomePage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Home'});
  const primaryCards = [
    {href: `/${locale}/history`, title: t('historyTitle'), text: t('historyText')},
    {href: `/${locale}/ai`, title: t('aiTitle'), text: t('aiText')},
    {href: `/${locale}/tools`, title: t('toolsTitle'), text: t('toolsText')}
  ] as const;
  const quickTitle = locale === 'zh' ? '常用快捷入口' : locale === 'ms' ? 'Pintasan kerap guna' : 'Quick Access';
  const quickText = locale === 'zh' ? '这些是最常用功能，点击可直接进入。完整功能仍保留在工具页。' : locale === 'ms' ? 'Ini fungsi paling kerap digunakan. Klik untuk masuk terus. Fungsi penuh kekal di halaman Tools.' : 'These are the most-used features. Click to jump in directly. Full features remain in Tools.';
  const quickCards = [
    {
      href: `/${locale}/tools/search`,
      title: locale === 'zh' ? '搜索 4D 号码' : locale === 'ms' ? 'Cari nombor 4D' : 'Search 4D Numbers',
      text: locale === 'zh' ? '支持正字 / 包字，快速查命中记录。' : locale === 'ms' ? 'Sokong carian exact / boxed untuk semakan pantas.' : 'Run exact / boxed search for fast hit lookup.'
    },
    {
      href: `/${locale}/tools/thousand-hits`,
      title: locale === 'zh' ? '千字中奖记录' : locale === 'ms' ? 'Rekod menang 3D' : '3D Hit Records',
      text: locale === 'zh' ? '输入 3 位数，查看历史中奖记录。' : locale === 'ms' ? 'Masukkan 3 digit untuk semak rekod menang sejarah.' : 'Enter 3 digits to check historical winning hits.'
    },
    {
      href: `/${locale}/tools/digit-map`,
      title: locale === 'zh' ? '千字 / 万字图搜索' : locale === 'ms' ? 'Carian peta 3D / 4D' : '3D / 4D Map Search',
      text: locale === 'zh' ? '输入号码或文字，快速展开对应图。' : locale === 'ms' ? 'Masukkan nombor atau teks untuk jana peta dengan cepat.' : 'Enter numbers or text to expand mapped sets quickly.'
    }
  ] as const;
  return (
    <main>
      <StructuredData data={{'@context': 'https://schema.org', '@type': 'WebSite', name: '4D AI', url: siteUrl(`/${locale}`)}} />
      <section className="border-b border-slate-200 bg-white py-10">
        <div className="container-shell">
          <h1 className="text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
            {locale === 'zh' ? '今日4D成绩' : locale === 'ms' ? 'Keputusan 4D Hari Ini' : 'Today 4D Results'}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {locale === 'zh'
              ? '选择地区后直接进入开彩成绩页面。'
              : locale === 'ms'
                ? 'Pilih kawasan untuk terus masuk ke halaman keputusan.'
                : 'Choose a region to go directly to the live result page.'}
          </p>
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <RegionNav locale={locale} />
          </div>
        </div>
      </section>
      <section className="container-shell py-10">
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-lg font-black text-slate-950">{quickTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{quickText}</p>
        </div>
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {quickCards.map((card) => (
            <Link key={card.href} href={card.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300">
              <h3 className="text-base font-black text-slate-950">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
            </Link>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {primaryCards.map((card) => (
            <Link key={card.href} href={card.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300">
              <h2 className="text-lg font-black text-slate-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

