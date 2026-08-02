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

  return (
    <main data-tools-page="true" className="bg-[#f7f4ee]">
      <style>{'main[data-tools-page="true"] + footer { margin-top: 1rem; }'}</style>
      <section className="pt-2 pb-2 sm:pt-3">
        <div className="container-shell">
          <div className="grid gap-2.5 lg:grid-cols-2">
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
                    {standardIcons[tool]}
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
