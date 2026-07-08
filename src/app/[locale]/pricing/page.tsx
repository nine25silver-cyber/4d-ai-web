import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';
import {MembershipFlowClient} from '@/components/MembershipFlowClient';
import {PricingSubscribeButton} from '@/components/PricingSubscribeButton';
import {PricingTrialLoginButton} from './PricingTrialLoginButton';

const pageKey = 'Pricing';
const pagePath = 'pricing';
const plans = [
  {key: 'free'},
  {key: 'pro'},
  {key: 'temporary'}
] as const;
const pricingOptions = [
  {key: 'monthly', featured: false, plan: 'pro_monthly'},
  {key: 'quarterly', featured: true, plan: 'pro_quarterly'},
  {key: 'yearly', featured: true, plan: 'pro_yearly'}
] as const;

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: pageKey});
  return buildMetadata({locale, path: `/${pagePath}`, title: t('metaTitle'), description: t('metaDescription')});
}

export default async function InfoPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: pageKey});
  return (
    <main className="container-shell py-10">
      <section className="border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase text-blue-800">4D AI</p>
        <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{t('title')}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">{t('intro')}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-black uppercase text-amber-800">{t('comingSoon')}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{t('paymentNoteText')}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.9fr)] lg:items-start">
        {plans.map((plan) => {
          const isProPlan = plan.key === 'pro';
          return (
          <article key={plan.key} className={`rounded-lg border bg-white p-5 shadow-sm ${isProPlan ? 'border-blue-500 shadow-lg ring-2 ring-blue-100 lg:-mt-2 lg:p-6' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">{t(`${plan.key}Plan`)}</h2>
                {isProPlan ? null : plan.key === 'temporary' ? (
                  <p className="mt-2 text-lg font-black leading-7 text-blue-800">
                    <span className="block">{t('temporarySubtitleLine1')}</span>
                    <span className="block">{t('temporarySubtitleLine2')}</span>
                    <span className="block">{t('temporarySubtitleLine3')}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-2xl font-black text-blue-800">{t(`${plan.key}Price`)}</p>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${isProPlan ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {isProPlan ? t('recommended') : t(`${plan.key}Badge`)}
              </span>
            </div>
            {isProPlan ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-black text-amber-900">{t('earlyBirdTitle')}</p>
                <p className="mt-2 text-sm font-bold text-amber-800 line-through">{t('regularMonthlyPrice')}</p>
                <p className="mt-1 text-sm font-black text-slate-800">{t('earlyBirdChoosePlan')}</p>
              </div>
            ) : null}
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
              {[1, 2, 3, 4].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-blue-700" />
                  <span>{t(`${plan.key}Point${item}`)}</span>
                </li>
              ))}
            </ul>
            {isProPlan ? (
              <>
                <div className="mt-6 grid items-stretch gap-3 md:grid-cols-3">
                  {pricingOptions.map((option) => (
                    <div key={option.key} className={`flex min-h-[268px] min-w-0 flex-col rounded-lg border p-4 ${option.featured ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                      <div className="flex min-h-7 flex-wrap items-start gap-1">
                        {option.key === 'quarterly' ? <span className="whitespace-nowrap rounded-full bg-blue-800 px-2.5 py-1 text-xs font-black text-white">{t('quarterlyBadge')}</span> : null}
                        {option.key === 'yearly' ? <span className="whitespace-nowrap rounded-full bg-amber-500 px-2.5 py-1 text-xs font-black text-white">{t('yearlyBadge')}</span> : null}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="mt-2 text-base font-black text-slate-950">{t(`${option.key}Title`)}</h3>
                        <div className="mt-4 min-h-[96px]">
                          {option.key === 'monthly' ? <div className="h-6" /> : (
                            <p className="text-sm font-bold text-slate-500 line-through">{t(`${option.key}OriginalPrice`)}</p>
                          )}
                          <p className="mt-1 text-3xl font-black text-slate-950">{t(`${option.key}Price`)}</p>
                          {option.key === 'monthly' ? <p className="mt-1 text-sm font-bold text-slate-600">{t('monthlyUnit')}</p> : null}
                          <p className="mt-2 min-h-5 text-xs font-black text-blue-800">{t(`${option.key}Save`)}</p>
                        </div>
                        <p className="mt-2 text-xs font-bold text-slate-500">{t(`${option.key}Billing`)}</p>
                      </div>
                      <div className="mt-auto [&_button]:min-h-[48px] [&_button]:whitespace-normal [&_button]:px-4 [&_button]:text-center [&_button]:font-semibold [&_button]:leading-tight">
                        {option.key === 'monthly' ? (
                          <PricingSubscribeButton
                            plan={option.plan}
                            labels={{
                              idle: t('monthlyCta'),
                              loading: t('subscribeMonthlyLoading'),
                              error: t('subscribeMonthlyError')
                            }}
                          />
                        ) : (
                          <PricingSubscribeButton
                            plan={option.plan}
                            labels={{
                              idle: t(`${option.key}Cta`),
                              loading: t('subscribeMonthlyLoading'),
                              error: t('subscribeMonthlyError')
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs font-semibold leading-5 text-slate-500">{t('earlyBirdNote')}</p>
              </>
            ) : plan.key === 'temporary' ? (
              <div className="mt-5">
                <PricingTrialLoginButton
                  locale={locale}
                  labels={{
                    login: t('trialLoginCta'),
                    loggedIn: t('trialLoggedIn'),
                    ready: t('trialReadyText')
                  }}
                />
              </div>
            ) : null}
          </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-blue-800">{t('paymentNoteTitle')}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{t('paymentNoteText')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/account`} className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-100">{t('accountCta')}</Link>
            <Link href={`/${locale}/tools`} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:border-blue-300 hover:bg-slate-50">{t('toolsCta')}</Link>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-800">
          {locale === 'zh' ? '功能权限对照' : locale === 'ms' ? 'Perbandingan akses fungsi' : 'Feature Access Matrix'}
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          {locale === 'zh' ? '免费、部分 Pro 与 Pro 的区别' : locale === 'ms' ? 'Perbezaan Percuma, Sebahagian Pro dan Pro' : 'Free vs Partial Pro vs Pro'}
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-800">{locale === 'zh' ? '免费' : locale === 'ms' ? 'Percuma' : 'Free'}</div>
            <ul className="mt-2 space-y-1 text-sm font-semibold text-slate-700">
              <li>{locale === 'zh' ? '搜索工具：可用' : locale === 'ms' ? 'Carian nombor: tersedia' : 'Number search: available'}</li>
              <li>{locale === 'zh' ? '收藏号码：可用' : locale === 'ms' ? 'Kegemaran: tersedia' : 'Favorites: available'}</li>
              <li>{locale === 'zh' ? 'AI：仅预览（号码与100期详情锁定）' : locale === 'ms' ? 'AI: pratonton sahaja (nombor & 100 rekod dikunci)' : 'AI: preview only (numbers & 100-draw details locked)'}</li>
            </ul>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-black uppercase text-amber-800">Pro</div>
            <ul className="mt-2 space-y-1 text-sm font-semibold text-slate-700">
              <li>{locale === 'zh' ? '热门/冷门：可用' : locale === 'ms' ? 'Panas/Sejuk: tersedia' : 'Hot/Cold trends: available'}</li>
              <li>{locale === 'zh' ? 'AI 推荐号码：完整可见' : locale === 'ms' ? 'Nombor AI: penuh' : 'AI recommendation numbers: full access'}</li>
              <li>{locale === 'zh' ? 'AI 最近100期命中详情：完整可见' : locale === 'ms' ? 'Butiran hit 100 cabutan AI: penuh' : 'AI 100-draw hit details: full access'}</li>
            </ul>
          </div>
        </div>
      </section>

      <MembershipFlowClient
        labels={{
          panelTitle: t('demoPanelTitle'),
          panelText: t('demoPanelText'),
          statusLabel: t('demoStatusLabel'),
          loggedOut: t('demoLoggedOut'),
          loggedIn: t('demoLoggedInStatus'),
          freePlan: t('freePlan'),
          proPlan: t('proPlan'),
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
