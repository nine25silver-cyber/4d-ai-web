import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const pageKey = 'Tools';
const pagePath = 'tools';
const toolCards = ['numberSearch', 'thousandHits', 'digitMap', 'hotCold', 'packageRanking', 'favorites'] as const;

function extraCardCopy(locale: Locale) {
  return {
    packageRanking: locale === 'zh'
      ? {eyebrow: '包字分析', title: '包字排行榜', text: '按 provider 与时间范围统计高频包字，方便快速筛选。', status: '已接入', cta: '打开包字排行榜'}
      : locale === 'ms'
        ? {eyebrow: 'Analisis Boxed', title: 'Ranking Boxed', text: 'Kira boxed paling kerap mengikut provider dan julat masa.', status: 'Disambung', cta: 'Buka ranking boxed'}
        : {eyebrow: 'Boxed Analysis', title: 'Boxed Ranking', text: 'Rank the most frequent boxed patterns by provider and date range.', status: 'Connected', cta: 'Open boxed ranking'},
    thousandHits: locale === 'zh'
      ? {eyebrow: '千字搜索', title: '千字中奖记录', text: '输入 3 位数字，查询对应千字在历史开奖中的命中记录。', status: '已接入', cta: '打开千字记录'}
      : locale === 'ms'
        ? {eyebrow: 'Carian 3D', title: 'Rekod Menang 3D', text: 'Masukkan 3 digit untuk cari rekod menang sejarah.', status: 'Disambung', cta: 'Buka rekod 3D'}
        : {eyebrow: '3D Search', title: '3D Winning Records', text: 'Search historical winning records by 3-digit target.', status: 'Connected', cta: 'Open 3D records'},
    digitMap: locale === 'zh'
      ? {eyebrow: '号码图', title: '千字 / 万字图搜索', text: '输入 4 位号码，自动生成千字图与万字图，方便快速对照。', status: '已接入', cta: '打开号码图'}
      : locale === 'ms'
        ? {eyebrow: 'Peta Nombor', title: 'Carian Peta 3D / 4D', text: 'Masukkan 4 digit untuk jana peta 3D dan 4D serta semak cepat.', status: 'Disambung', cta: 'Buka peta nombor'}
        : {eyebrow: 'Number Maps', title: '3D / 4D Map Search', text: 'Enter 4 digits to generate 3D and 4D map sets for quick lookup.', status: 'Connected', cta: 'Open number maps'}
  } as const;
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  return buildMetadata({
    locale,
    path: `/${pagePath}`,
    title: '4D AI tools',
    description: 'Search 4D numbers, 3D winning records, number maps, hot and cold signals, boxed rankings and saved numbers.'
  });
}

export default async function InfoPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: pageKey});
  const extra = extraCardCopy(locale);
  return (
    <main>
      <section className="bg-white py-16 sm:py-20">
        <div className="container-shell">
          <p className="text-sm font-bold uppercase text-blue-700">4D AI</p>
          <div className="mt-2 max-w-3xl">
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{t('title')}</h1>
            <p className="mt-4 text-slate-600">{t('intro')}</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="container-shell grid gap-4 lg:grid-cols-2">
        {toolCards.map((tool) => {
          const href = tool === 'favorites'
              ? `/${locale}/tools/favorites`
              : tool === 'numberSearch'
                ? `/${locale}/tools/search`
                : tool === 'hotCold'
                  ? `/${locale}/tools/hot-cold`
                  : tool === 'packageRanking'
                    ? `/${locale}/tools/package-ranking`
                    : tool === 'thousandHits'
                      ? `/${locale}/tools/thousand-hits`
                      : `/${locale}/tools/digit-map`;
          const isExtra = tool === 'packageRanking' || tool === 'thousandHits' || tool === 'digitMap';
          const accessLabel = tool === 'hotCold'
            ? (locale === 'zh' ? 'Pro' : locale === 'ms' ? 'Pro' : 'Pro')
            : (tool as string) === 'ai'
              ? (locale === 'zh' ? '部分 Pro' : locale === 'ms' ? 'Sebahagian Pro' : 'Partial Pro')
              : (locale === 'zh' ? '免费' : locale === 'ms' ? 'Percuma' : 'Free');
          const accessClass = tool === 'hotCold'
            ? 'bg-amber-100 text-amber-800'
            : (tool as string) === 'ai'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-blue-100 text-blue-800';
          return (
            <article key={tool} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase text-blue-700">
                    {isExtra ? extra[tool].eyebrow : t(`${tool}Eyebrow`)}
                  </div>
                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    {isExtra ? extra[tool].title : t(`${tool}Title`)}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {isExtra ? extra[tool].status : t(`${tool}Status`)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${accessClass}`}>{accessLabel}</span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isExtra ? extra[tool].text : t(`${tool}Text`)}
              </p>
              <Link href={href} className="mt-5 inline-flex rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-100">
                {isExtra ? extra[tool].cta : t(`${tool}Cta`)}
              </Link>
            </article>
          );
        })}
        </div>
      </section>
    </main>
  );
}
