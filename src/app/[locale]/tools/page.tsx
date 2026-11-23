import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const pagePath = 'tools';

type FeaturedTool = 'ai' | 'packageRanking' | 'ai3d' | 'packageRanking3d';
type FeaturedCategory = 'ai' | 'box';
type StandardTool = 'thousandHits' | 'numberSearch' | 'digitMap' | 'hotCold' | 'cold4d' | 'luckyNumber' | 'favorites' | 'history' | 'account';

const featuredCategories: FeaturedCategory[] = ['ai', 'box'];
const standardTools: StandardTool[] = ['thousandHits', 'numberSearch', 'digitMap', 'hotCold', 'cold4d', 'luckyNumber', 'favorites', 'history', 'account'];

const featuredDimensions: Record<FeaturedTool, '4D' | '3D'> = {
  ai: '4D',
  packageRanking: '4D',
  ai3d: '3D',
  packageRanking3d: '3D'
};

const standardIcons: Record<StandardTool, string> = {
  thousandHits: '3D',
  numberSearch: '4D',
  digitMap: 'MAP',
  hotCold: 'HOT',
  cold4d: 'COLD',
  luckyNumber: 'LUCK',
  favorites: 'FAV',
  history: 'HIS',
  account: 'ID'
};

const standardIconStyles: Record<StandardTool, string> = {
  thousandHits: 'bg-amber-50 text-amber-700',
  numberSearch: 'bg-yellow-50 text-yellow-700',
  digitMap: 'bg-violet-50 text-violet-700',
  hotCold: 'bg-rose-50 text-rose-700',
  cold4d: 'bg-sky-50 text-sky-700',
  luckyNumber: 'bg-lime-50 text-lime-700',
  favorites: 'bg-pink-50 text-pink-700',
  history: 'bg-slate-50 text-slate-700',
  account: 'bg-emerald-50 text-emerald-700'
};

function localizedCopy(locale: Locale) {
  return {
    standard: {
      thousandHits: locale === 'zh'
        ? {title: '搜索千字中奖记录', subtitle: '历史号码开奖记录大全'}
        : locale === 'ms'
          ? {title: 'Cari Rekod 3D', subtitle: 'Arkib keputusan nombor sejarah'}
          : {title: 'Search 3D Records', subtitle: 'Historical winning number archive'},
      numberSearch: locale === 'zh'
        ? {title: '搜索万字中奖记录', subtitle: '历史号码开奖记录大全'}
        : locale === 'ms'
          ? {title: 'Cari Rekod 4D', subtitle: 'Arkib keputusan nombor sejarah'}
          : {title: 'Search 4D Records', subtitle: 'Historical winning number archive'},
      digitMap: locale === 'zh'
        ? {title: '千字/万字图搜索', subtitle: '按梦境或关键词搜索号码'}
        : locale === 'ms'
          ? {title: 'Carian Peta 3D / 4D', subtitle: 'Cari nombor ikut mimpi atau kata kunci'}
          : {title: '3D / 4D Map Search', subtitle: 'Search by dream or keyword'},
      hotCold: locale === 'zh'
        ? {title: '热门4D', subtitle: '频率最高号码'}
        : locale === 'ms'
          ? {title: '4D Panas', subtitle: 'Nombor frekuensi tertinggi'}
          : {title: 'Hot 4D', subtitle: 'Highest frequency numbers'},
      cold4d: locale === 'zh'
        ? {title: '冷门4D', subtitle: '频率最低号码'}
        : locale === 'ms'
          ? {title: '4D Sejuk', subtitle: 'Nombor frekuensi terendah'}
          : {title: 'Cold 4D', subtitle: 'Lowest frequency numbers'},
      luckyNumber: locale === 'zh'
        ? {title: '我的幸运数字', subtitle: '生成 4D、6D 与积宝幸运号码'}
        : locale === 'ms'
          ? {title: 'Nombor Bertuah Saya', subtitle: 'Jana nombor bertuah 4D, 6D dan jackpot'}
          : {title: 'My Lucky Number', subtitle: 'Generate 4D, 6D and jackpot lucky numbers'},
      favorites: locale === 'zh'
        ? {title: '我的收藏号码', subtitle: '查看已收藏的4D、6D与积宝号码'}
        : locale === 'ms'
          ? {title: 'Nombor Kegemaran', subtitle: 'Lihat nombor 4D, 6D dan jackpot tersimpan'}
          : {title: 'My Favorite Numbers', subtitle: 'View saved 4D, 6D and jackpot numbers'},
      history: locale === 'zh'
        ? {title: '历史开奖记录', subtitle: '查看各区历史开奖结果'}
        : locale === 'ms'
          ? {title: 'Sejarah Keputusan', subtitle: 'Lihat keputusan sejarah mengikut pasaran'}
          : {title: 'Result History', subtitle: 'Browse historical results by market'},
      account: locale === 'zh'
        ? {title: '账号设置', subtitle: '管理你的账户与偏好'}
        : locale === 'ms'
          ? {title: 'Tetapan Akaun', subtitle: 'Urus akaun dan pilihan anda'}
          : {title: 'Account Settings', subtitle: 'Manage your account and preferences'}
    },
    sections: locale === 'zh'
      ? {featured: '主打推荐', all: '全部工具', comingSoon: '即将推出'}
      : locale === 'ms'
        ? {featured: 'Pilihan Utama', all: 'Semua Alat', comingSoon: 'Akan Datang'}
        : {featured: 'Featured', all: 'All Tools', comingSoon: 'Coming Soon'},
    comingSoon: {
      moreAi: locale === 'zh' ? '更多 AI 功能' : locale === 'ms' ? 'Lebih banyak fungsi AI' : 'More AI features',
      more3d: locale === 'zh' ? '更多 3D 工具' : locale === 'ms' ? 'Lebih banyak alat 3D' : 'More 3D tools',
      moreAnalytics: locale === 'zh' ? '更多数据分析' : locale === 'ms' ? 'Lebih banyak analisis data' : 'More data analysis'
    },
    soonLabel: locale === 'zh' ? '即将推出' : locale === 'ms' ? 'Akan datang' : 'Coming soon',
    digitAnalysis: locale === 'zh'
      ? {title: '数字分析', subtitle: '单号 · 双号 · 三号统计分析'}
      : locale === 'ms'
        ? {title: 'Analisis Digit', subtitle: 'Statistik digit tunggal, berganda dan bertiga'}
        : {title: 'Digit Analysis', subtitle: 'Single, double and triple digit statistics'},
    proLabel: 'PRO'
  } as const;
}

function getFeaturedHref(locale: Locale, tool: FeaturedTool) {
  if (tool === 'ai') return `/${locale}/ai/west-malaysia/magnum`;
  if (tool === 'packageRanking') return `/${locale}/tools/package-ranking`;
  if (tool === 'ai3d') return `/${locale}/tools/three-plus-one-ai/west-malaysia/magnum`;
  return `/${locale}/tools/three-plus-one-box/west-malaysia/magnum`;
}

function getStandardHref(locale: Locale, tool: StandardTool) {
  if (tool === 'thousandHits') return `/${locale}/tools/thousand-hits`;
  if (tool === 'numberSearch') return `/${locale}/tools/4d-search`;
  if (tool === 'digitMap') return `/${locale}/tools/digit-map`;
  if (tool === 'hotCold') return `/${locale}/tools/hot-cold?mode=hot`;
  if (tool === 'cold4d') return `/${locale}/tools/hot-cold?mode=cold`;
  if (tool === 'luckyNumber') return `/${locale}/tools/lucky-number`;
  if (tool === 'favorites') return `/${locale}/tools/favorites`;
  if (tool === 'history') return `/${locale}/history`;
  return `/${locale}/account`;
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
  const t = await getTranslations({locale, namespace: 'Tools'});
  const copy = localizedCopy(locale);
  const categoryCards: Record<FeaturedCategory, {title: string; description: string; showPro: boolean}> = {
    ai: {
      title: t('toolboxAiCategoryTitle'),
      description: t('toolboxAiCategoryDescription'),
      showPro: true
    },
    box: {
      title: t('toolboxBoxCategoryTitle'),
      description: t('toolboxBoxCategoryDescription'),
      showPro: true
    }
  };
  const featuredTitleParts: Record<FeaturedTool, {prefix: string; accent: string; suffix: string}> = {
    ai: {prefix: t('toolboxAiEntryTitlePrefix'), accent: t('toolboxAiEntryTitleAccent'), suffix: t('toolboxAiEntryTitleSuffix')},
    ai3d: {prefix: t('toolboxAiEntryTitlePrefix'), accent: t('toolboxAiEntryTitleAccent'), suffix: t('toolboxAiEntryTitleSuffix')},
    packageRanking: {prefix: '', accent: '', suffix: t('toolboxBoxEntryTitle')},
    packageRanking3d: {prefix: '', accent: '', suffix: t('toolboxBoxEntryTitle')}
  };

  const appOrder = ['ai', 'packageRanking', 'ai3d', 'packageRanking3d'] as const;
  return (
    <main data-tools-page="true" className="bg-[#f7f4ee]">
      <style>{'main[data-tools-page="true"] + footer { margin-top: 1rem; }'}</style>
      <section className="pt-2 pb-2 sm:pt-3">
        <div className="container-shell">
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            {appOrder.map((tool, index) => {
              const {prefix, accent, suffix} = featuredTitleParts[tool];
              return <Link key={tool} href={getFeaturedHref(locale, tool)}
                className={`flex min-w-0 flex-col rounded-[23px] border border-[#4d6176] bg-gradient-to-br from-[#3b526a] to-[#2c4058] px-3 py-3 text-[#f9fcff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf8623] ${index<2?'min-h-[143px] shadow-[0_8px_18px_#23394e40]':'min-h-24 justify-center'}`}>
                <span className="flex items-center justify-between gap-1">
                  <span className="text-[30px] leading-none font-black text-[#e7b95c]">{featuredDimensions[tool]}</span>
                  {index===0&&<span className="rounded bg-[#e8ba60] px-1.5 py-1 text-xs font-black leading-none text-[#263b50]">{copy.proLabel}</span>}
                </span>
                <span className="mt-1 text-base leading-tight font-black">{prefix}{prefix&&' '}{accent&&<span className="text-[#e7b95c]">{accent}{' '}</span>}{suffix}</span>
                {index<2&&<span className="mt-1 text-sm leading-snug font-bold text-[#c6d3df]">{categoryCards[index===0?'ai':'box'].description}</span>}
              </Link>;
            })}
          </div>
          <div className="hidden gap-2.5 sm:grid lg:grid-cols-2">
            {featuredCategories.map((category) => {
              const item = categoryCards[category];
              const tools = category === 'ai' ? (['ai', 'ai3d'] as const) : (['packageRanking', 'packageRanking3d'] as const);
              return (
                <article
                  key={category}
                  className="relative rounded-[24px] border border-white/[0.07] bg-[#2e4a6b] p-3 text-white shadow-[0_6px_14px_rgba(15,23,42,0.1)] sm:p-3.5"
                >
                  {item.showPro ? (
                    <span className="absolute right-5 top-3 rounded-full bg-[#f0c95a] px-2 py-0.5 text-[11px] font-black text-slate-900 shadow-sm">
                      {copy.proLabel}
                    </span>
                  ) : null}
                  <div className={item.showPro ? 'pr-10' : undefined}>
                    <h3 className="text-base font-black leading-tight sm:text-lg">
                      {category === 'ai' ? (
                        <>
                          {featuredTitleParts.ai.prefix ? (
                            <span>{featuredTitleParts.ai.prefix}</span>
                          ) : null}
                          {featuredTitleParts.ai.prefix && featuredTitleParts.ai.accent ? ' ' : ''}
                          <span className="text-[#f0c95a]">{featuredTitleParts.ai.accent}</span>
                          {(featuredTitleParts.ai.prefix || featuredTitleParts.ai.accent) && featuredTitleParts.ai.suffix ? ' ' : ''}
                          {featuredTitleParts.ai.suffix ? (
                            <span>{featuredTitleParts.ai.suffix}</span>
                          ) : null}
                        </>
                      ) : (
                        item.title
                      )}
                    </h3>
                    <p className="mt-0.5 text-sm font-bold leading-tight text-[#d8e6f6]">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    {tools.map((tool) => {
                      const title = featuredTitleParts[tool];
                      return (
                        <Link
                          key={tool}
                          href={getFeaturedHref(locale, tool)}
                          className="group relative min-h-[88px] overflow-hidden rounded-[20px] bg-[#243f5f] p-2.5 text-white shadow-[0_9px_20px_rgba(15,23,42,0.2)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_11px_24px_rgba(15,23,42,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0c95a] sm:min-h-[94px] sm:p-3"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.16),transparent_30%),linear-gradient(145deg,rgba(42,67,98,0.95),rgba(20,35,56,1))]" />
                          <div className="relative flex h-full flex-col justify-center gap-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-3xl font-black leading-none text-[#f0c95a] drop-shadow-sm">
                                {featuredDimensions[tool]}
                              </span>
                            </div>
                            <h4 className="text-sm font-black leading-tight text-white sm:text-base">
                              {title.prefix ? (
                                <span>{title.prefix}</span>
                              ) : null}
                              {title.prefix && title.accent ? ' ' : ''}
                              {title.accent ? (
                                <span className="text-[#f0c95a]">{title.accent}</span>
                              ) : null}
                              {(title.prefix || title.accent) && title.suffix ? ' ' : ''}
                              {title.suffix ? (
                                <span>{title.suffix}</span>
                              ) : null}
                            </h4>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
          <Link href={`/${locale}/tools/digit-analysis-pro`}
            className="mt-3 flex min-h-[86px] items-center gap-3 rounded-[23px] border border-[#4d6176] bg-gradient-to-br from-[#3b526a] to-[#2c4058] px-3 py-3 text-[#f9fcff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf8623] sm:min-h-[76px] sm:px-4">
            <span className="grid size-[47px] shrink-0 place-items-center rounded-[15px] border border-white/20 bg-white/10 text-[#dff1fc]">
              <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m2 17 5-6 3 3 4-5m4-1 3-5m-4 14 4 4"/><circle cx="14.5" cy="14.5" r="3.5"/></svg>
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2 text-lg leading-tight font-black sm:text-xl">{copy.digitAnalysis.title}<span className="rounded bg-[#e8ba60] px-1.5 py-1 text-xs font-black leading-none text-[#263b50]">{copy.proLabel}</span></span>
              <span className="mt-0.5 block text-xs font-bold text-[#c9d6e1] sm:text-sm">{copy.digitAnalysis.subtitle}</span>
            </span>
          </Link>
        </div>
      </section>

      <section className="pb-2">
        <div className="container-shell">
          <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {standardTools.map((tool) => {
              const item = copy.standard[tool];
              return (
                <Link
                  key={tool}
                  href={getStandardHref(locale, tool)}
                  className={`${tool === 'hotCold' || tool === 'cold4d' ? 'min-[520px]:min-h-24' : ''} group flex min-h-20 items-center gap-2.5 rounded-[20px] border border-stone-200 bg-white/90 p-2.5 shadow-sm shadow-stone-200 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-stone-200 text-[11px] font-black shadow-sm ${standardIconStyles[tool]}`}>
                    {tool === 'thousandHits' || tool === 'numberSearch' || tool === 'digitMap' ? <>
                      <span className="hidden sm:inline">{standardIcons[tool]}</span>
                      {tool==='digitMap'
                        ? <svg aria-hidden="true" className="size-6 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5m-15 3 4-5 3 3 2-2 3 4m2-9 3 3"/><circle cx="16" cy="6" r="4"/></svg>
                        : <svg aria-hidden="true" className="size-6 sm:hidden" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h10v2h4v3a5 5 0 0 1-5 5h-.2a6 6 0 0 1-2.8 2.2V20h4v2H7v-2h4v-4.8A6 6 0 0 1 8.2 13H8a5 5 0 0 1-5-5V5h4zm10 4v3.8A3 3 0 0 0 19 8V7zM5 7v1a3 3 0 0 0 2 2.8V7z"/></svg>}
                    </> : standardIcons[tool]}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black leading-tight text-slate-950 sm:text-base">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs font-bold leading-tight text-slate-500 sm:text-sm">
                      {item.subtitle}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
