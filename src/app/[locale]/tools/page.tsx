import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const pageKey = 'Tools';
const pagePath = 'tools';
const toolCards = ['numberSearch', 'thousandHits', 'digitMap', 'hotCold', 'packageRanking', 'favorites'] as const;
const workflowCards = ['cloudflare', 'membership', 'ads'] as const;

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
  const languageTitle =
    locale === 'zh' ? '语言设置' : locale === 'ms' ? 'Tetapan bahasa' : 'Language';
  const languageHint =
    locale === 'zh'
      ? '默认会跟随设备语言，你也可以在这里手动切换。'
      : locale === 'ms'
        ? 'Secara lalai ikut bahasa peranti. Anda juga boleh tukar di sini.'
        : 'By default it follows device language. You can also switch here.';
  return (
    <main className="container-shell py-10">
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-blue-700">4D AI</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">{languageTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">{languageHint}</p>
          </div>
          <div className="flex rounded-md border border-[#d8c68d] bg-[#f8f3df] p-1 text-sm font-semibold">
            <Link href="/en/tools" className={`rounded px-3 py-1.5 ${locale === 'en' ? 'bg-[#ebc978] text-white' : 'text-[#1f2b44] hover:bg-[#efe6c8]'}`}>EN</Link>
            <Link href="/zh/tools" className={`rounded px-3 py-1.5 ${locale === 'zh' ? 'bg-[#ebc978] text-white' : 'text-[#1f2b44] hover:bg-[#efe6c8]'}`}>中</Link>
            <Link href="/ms/tools" className={`rounded px-3 py-1.5 ${locale === 'ms' ? 'bg-[#ebc978] text-white' : 'text-[#1f2b44] hover:bg-[#efe6c8]'}`}>MY</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase text-blue-700">4D AI</p>
        <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{t('title')}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">{t('intro')}</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-700">{t('statusEyebrow')}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{t('statusText')}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
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
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-blue-700">{t('workflowEyebrow')}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{t('workflowTitle')}</h2>
          </div>
          <Link href={`/${locale}/pricing`} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:border-blue-300">
            {t('pricingCta')}
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {workflowCards.map((item) => (
            <div key={item} className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-black text-slate-950">{t(`${item}Title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t(`${item}Text`)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
