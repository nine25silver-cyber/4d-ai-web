import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';
import {MembershipFlowClient} from '@/components/MembershipFlowClient';

const pageKey = 'Account';
const pagePath = 'account';
const accountCards = ['login', 'membership', 'credits', 'favorites'] as const;

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: pageKey});
  return {
    ...buildMetadata({locale, path: `/${pagePath}`, title: t('metaTitle'), description: t('metaDescription')}),
    robots: {index: false, follow: true}
  };
}

export default async function InfoPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: pageKey});
  return (
    <main className="container-shell py-10">
      <section className="border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase text-blue-800">4D AI</p>
        <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{t('title')}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">{t('intro')}</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-800">{t('statusBadge')}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{t('freeNoteText')}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {accountCards.map((card) => (
          <article key={card} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase text-blue-800">4D AI</div>
            <h2 className="mt-2 text-xl font-black text-slate-950">{t(`${card}Title`)}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t(`${card}Text`)}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-blue-800">{t('syncTitle')}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{t('syncText')}</p>
            <p className="mt-4 text-sm font-black text-slate-950">{t('freeNoteTitle')}</p>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{t('freeNoteText')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/pricing`} className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-100">{t('pricingCta')}</Link>
            <Link href={`/${locale}/tools`} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:border-blue-300 hover:bg-slate-50">{t('toolsCta')}</Link>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-800">
          {locale === 'zh' ? '账号权限总览' : locale === 'ms' ? 'Ringkasan akses akaun' : 'Account Access Overview'}
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          {locale === 'zh' ? '当前账号可使用的功能' : locale === 'ms' ? 'Fungsi yang tersedia untuk akaun semasa' : 'Features available for the current account'}
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-800">{locale === 'zh' ? '免费' : locale === 'ms' ? 'Percuma' : 'Free'}</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              {locale === 'zh'
                ? '搜索与收藏可用，结果页与历史页可公开浏览。'
                : locale === 'ms'
                  ? 'Carian dan kegemaran tersedia, halaman keputusan & sejarah boleh dilihat umum.'
                  : 'Search and favorites are available, and result/history pages are publicly viewable.'}
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-700">{locale === 'zh' ? '部分 Pro' : locale === 'ms' ? 'Sebahagian Pro' : 'Partial Pro'}</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              {locale === 'zh'
                ? 'AI 页面可进入，但核心数字、完整推荐号和100期详情需要 Pro。'
                : locale === 'ms'
                  ? 'Halaman AI boleh dibuka, tetapi digit teras, nombor penuh dan butiran 100 cabutan perlukan Pro.'
                  : 'AI pages are accessible, but core digits, full recommendations and 100-draw details require Pro.'}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-black uppercase text-amber-800">Pro</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              {locale === 'zh'
                ? '热门/冷门趋势分析与 AI 完整内容全部解锁。'
                : locale === 'ms'
                  ? 'Analisis trend panas/sejuk dan kandungan AI penuh dibuka sepenuhnya.'
                  : 'Hot/Cold trend analysis and full AI content are fully unlocked.'}
            </p>
          </div>
        </div>
      </section>

      <MembershipFlowClient
        labels={{
          panelTitle: t('demoPanelTitle'),
          panelText: t('demoPanelText'),
          statusLabel: t('demoStatusLabel'),
          loggedOut: t('demoLoggedOut'),
          loggedIn: t('demoLoggedIn'),
          freePlan: t('demoFreePlan'),
          proPlan: t('demoProPlan'),
          login: t('demoLogin'),
          logout: t('demoLogout'),
          activatePro: t('demoActivatePro'),
          switchFree: t('demoSwitchFree'),
          syncWarningPrefix: t('syncWarningPrefix'),
          syncWarningFallback: t('syncWarningFallback')
        }}
      />
    </main>
  );
}
