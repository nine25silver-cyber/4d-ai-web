import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';
import {MembershipFlowClient} from '@/components/MembershipFlowClient';
import {PricingSubscribeButton} from '@/components/PricingSubscribeButton';
import {PricingTrialLoginButton} from './PricingTrialLoginButton';

const pageKey = 'Pricing';
const pagePath = 'pricing';
const pricingOptions = [
  {key: 'monthly', featured: false, plan: 'pro_monthly'},
  {key: 'quarterly', featured: true, plan: 'pro_quarterly'},
  {key: 'yearly', featured: true, plan: 'pro_yearly'}
] as const;

const pageCopy = {
  zh: {
    heroTitle: '免费版与 Pro',
    heroIntro: '免费版提供最新成绩、历史记录与基础搜索功能；升级 Pro 后可享有无广告体验、完整 AI 推荐及包字排行榜。',
    featureEyebrow: '功能权限',
    featureTitle: '功能权限',
    freeLabel: '免费',
    freeItems: ['最新成绩、历史记录与基础搜索可用', '收藏号码和基础工具可用', 'AI 页面可预览，完整号码与 100 期命中详情需 Pro'],
    proLabel: 'Pro',
    proItems: ['AI 推荐号码完整可见', 'AI 最近 100 期命中详情完整可见', '热门 / 冷门长期走势与更多高级工具可用'],
    partialLabel: '免费试用',
    accessRows: [
      {feature: '搜索工具', free: '√', partial: '√', pro: '√'},
      {feature: '收藏号码', free: '√', partial: '√', pro: '√'},
      {feature: 'AI 推荐', free: '×', partial: '√', pro: '√'},
      {feature: '近 100 期命中详情', free: '×', partial: '√', pro: '√'},
      {feature: '包字排行榜', free: '看广告', partial: '√', pro: '√'}
    ],
    membershipTitle: '会员权限',
    membershipText: '查看当前账号、方案与权限状态。Pro 功能由账号权限规则控制。',
    membershipLabel: '当前方案'
  },
  en: {
    heroTitle: 'Free and Pro',
    heroIntro: 'Free includes latest results, history and basic search. Pro adds ad-free tools, full AI picks and Boxed Number Rankings.',
    featureEyebrow: 'Access',
    featureTitle: 'Feature access',
    freeLabel: 'Free',
    freeItems: ['Latest results, history and basic search are available', 'Favorites and core tools are available', 'AI pages can be previewed; full numbers and 100-draw hit details require Pro'],
    proLabel: 'Pro',
    proItems: ['Full AI recommendation numbers', 'Full AI 100-draw hit details', 'Hot / Cold long-term trends and more advanced tools'],
    partialLabel: 'Free trial',
    accessRows: [
      {feature: 'Search tools', free: '√', partial: '√', pro: '√'},
      {feature: 'Favorites', free: '√', partial: '√', pro: '√'},
      {feature: 'AI picks', free: '×', partial: '√', pro: '√'},
      {feature: '100 hits', free: '×', partial: '√', pro: '√'},
      {feature: 'Boxed ranking', free: 'Ads', partial: '√', pro: '√'}
    ],
    membershipTitle: 'Account access',
    membershipText: 'Current account, plan and access state.',
    membershipLabel: 'Current plan'
  },
  ms: {
    heroTitle: 'Percuma dan Pro',
    heroIntro: 'Percuma merangkumi keputusan terkini, sejarah dan carian asas. Pro memberi akses tanpa iklan, AI penuh dan Ranking Boxed.',
    featureEyebrow: 'Akses',
    featureTitle: 'Perbandingan fungsi',
    freeLabel: 'Percuma',
    freeItems: ['Keputusan terkini, sejarah dan carian asas tersedia', 'Kegemaran dan alat asas tersedia', 'Halaman AI boleh dipratonton; nombor penuh dan butiran 100 cabutan memerlukan Pro'],
    proLabel: 'Pro',
    proItems: ['Nombor cadangan AI penuh', 'Butiran hit 100 cabutan AI penuh', 'Trend panas / sejuk jangka panjang dan lebih banyak alat lanjutan'],
    partialLabel: 'Percubaan',
    accessRows: [
      {feature: 'Alat carian', free: '√', partial: '√', pro: '√'},
      {feature: 'Kegemaran', free: '√', partial: '√', pro: '√'},
      {feature: 'Cadangan AI', free: '×', partial: '√', pro: '√'},
      {feature: 'Hit 100', free: '×', partial: '√', pro: '√'},
      {feature: 'Ranking Boxed', free: 'Iklan', partial: '√', pro: '√'}
    ],
    membershipTitle: 'Akses ahli',
    membershipText: 'Akaun, pelan dan status akses semasa.',
    membershipLabel: 'Pelan semasa'
  }
} satisfies Record<Locale, {
  heroTitle: string;
  heroIntro: string;
  featureEyebrow: string;
  featureTitle: string;
  freeLabel: string;
  freeItems: string[];
  proLabel: string;
  proItems: string[];
  partialLabel: string;
  accessRows: Array<{feature: string; free: string; partial: string; pro: string}>;
  membershipTitle: string;
  membershipText: string;
  membershipLabel: string;
}>;

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: pageKey});
  return buildMetadata({locale, path: `/${pagePath}`, title: t('metaTitle'), description: t('metaDescription')});
}

export default async function InfoPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: pageKey});
  const copy = pageCopy[locale];
  const compactLocale = locale !== 'zh';
  const heroIntroClass = compactLocale
    ? 'mt-0.5 max-w-2xl text-[13px] leading-4 text-slate-600'
    : 'mt-0.5 max-w-3xl text-sm leading-5 text-slate-600';
  const cardPaddingClass = compactLocale ? 'p-1.5 shadow-sm sm:p-2' : 'p-2 shadow-sm sm:p-2.5';
  const featurePaddingClass = compactLocale ? 'p-1.5 shadow-sm sm:p-2' : 'p-2 shadow-sm sm:p-2.5';
  const listClass = compactLocale ? 'mt-1 space-y-0 text-[13px] leading-4 text-slate-700' : 'mt-1.5 space-y-0.5 text-sm leading-5 text-slate-700';
  const proPriceCardClass = compactLocale ? 'min-h-[138px] p-1' : 'min-h-[150px] p-1.5';
  const proButtonWrapClass = compactLocale
    ? 'mt-auto [&>div]:mt-1 [&_button]:min-h-[30px] [&_button]:whitespace-nowrap [&_button]:px-1 [&_button]:py-1 [&_button]:text-center [&_button]:text-[10px] [&_button]:font-semibold [&_button]:leading-none'
    : 'mt-auto [&>div]:mt-1 [&_button]:min-h-[32px] [&_button]:whitespace-normal [&_button]:px-1.5 [&_button]:py-1 [&_button]:text-center [&_button]:text-xs [&_button]:font-semibold [&_button]:leading-tight';
  const membershipClass = compactLocale
    ? 'h-full [&_section]:mt-0 [&_section]:flex [&_section]:h-full [&_section]:flex-col [&_section]:p-1.5 [&_section]:sm:p-2 [&_section>div:first-child>span]:hidden [&_section>div:first-child_p]:hidden [&_section>div:first-child]:gap-0.5 [&_section_dl]:mt-1 [&_section_dl]:gap-1 [&_section_h2]:text-base [&_section_p]:leading-4 [&_section_p]:text-xs [&_section_.rounded-md]:px-1.5 [&_section_.rounded-md]:py-1 [&_section>div:last-child]:mt-auto [&_section_button]:min-h-[30px] [&_section_button]:px-2 [&_section_button]:py-1'
    : 'h-full [&_section]:mt-0 [&_section]:flex [&_section]:h-full [&_section]:flex-col [&_section]:p-2 [&_section]:sm:p-2.5 [&_section>div:first-child>span]:hidden [&_section>div:first-child_p]:hidden [&_section>div:first-child]:gap-1 [&_section_dl]:mt-1.5 [&_section_dl]:gap-1.5 [&_section_h2]:text-base [&_section_p]:leading-5 [&_section_p]:text-xs [&_section_.rounded-md]:px-2 [&_section_.rounded-md]:py-1.5 [&_section>div:last-child]:mt-auto [&_section_button]:min-h-[32px] [&_section_button]:px-2.5 [&_section_button]:py-1.5';
  return (
    <main className={compactLocale ? 'container-shell py-3' : 'container-shell py-4'}>
      <section className={compactLocale ? 'pb-1.5' : 'pb-2'}>
        <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">{copy.heroTitle}</h1>
        <p className={heroIntroClass}>{copy.heroIntro}</p>
      </section>

      <section className="mt-1.5 grid gap-1.5 md:grid-cols-2 md:items-stretch lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.36fr)_minmax(0,0.86fr)]">
        <div className="grid h-full gap-1.5 lg:grid-rows-[auto_minmax(0,1fr)]">
          <article className={`flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white lg:h-full ${cardPaddingClass}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-950">{t('freePlan')}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                {t('freeBadge')}
              </span>
            </div>
            <ul className={listClass}>
              {[1, 2, 3, 4].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 rounded-full bg-blue-700" />
                  <span>{t(`freePoint${item}`)}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className={`flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white ${cardPaddingClass}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-black leading-5 text-blue-800">
                  <span className="block">{t('temporarySubtitleLine1')}</span>
                  <span className="block">{t('temporarySubtitleLine2')}</span>
                  <span className="block">{t('temporarySubtitleLine3')}</span>
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                {t('temporaryBadge')}
              </span>
            </div>
            <ul className={listClass}>
              {[1, 2, 3, 4].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 rounded-full bg-blue-700" />
                  <span>{t(`temporaryPoint${item}`)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-1.5">
              <PricingTrialLoginButton
                locale={locale}
                labels={{
                  login: t('trialLoginCta'),
                  loggedIn: t('trialLoggedIn'),
                  ready: t('trialReadyText')
                }}
              />
            </div>
          </article>
        </div>

        <article className={`flex h-full min-w-0 flex-col rounded-lg border border-blue-500 bg-white shadow-lg ring-2 ring-blue-100 ${compactLocale ? 'p-1.5 sm:p-2' : 'p-2 sm:p-2.5'}`}>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-black text-slate-950">{t('proPlan')}</h2>
            <span className="rounded-full bg-blue-800 px-2.5 py-1 text-xs font-black text-white">
              {t('recommended')}
            </span>
          </div>
          <div className={compactLocale ? 'mt-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1' : 'mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5'}>
            <p className="text-sm font-black leading-5 text-amber-900">{t('earlyBirdTitle')}</p>
            <p className="text-xs font-black leading-4 text-slate-800">{t('earlyBirdChoosePlan')}</p>
          </div>
          <ul className={listClass}>
            {[1, 2, 3, 4].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-blue-700" />
                <span>{t(`proPoint${item}`)}</span>
              </li>
            ))}
          </ul>
          <div className={compactLocale ? 'mt-1.5 grid items-stretch gap-1 sm:grid-cols-3' : 'mt-2 grid items-stretch gap-1.5 sm:grid-cols-3'}>
            {pricingOptions.map((option) => (
              <div key={option.key} className={`flex min-w-0 flex-col rounded-lg border ${proPriceCardClass} ${option.featured ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex min-h-4 flex-wrap items-start gap-1">
                  {option.key === 'quarterly' ? <span className="whitespace-nowrap rounded-full bg-blue-800 px-2 py-0.5 text-xs font-black text-white">{t('quarterlyBadge')}</span> : null}
                  {option.key === 'yearly' ? <span className="whitespace-nowrap rounded-full bg-amber-500 px-2 py-0.5 text-xs font-black text-white">{t('yearlyBadge')}</span> : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <h3 className="mt-0.5 text-sm font-black text-slate-950">{t(`${option.key}Title`)}</h3>
                  <div className={compactLocale ? 'mt-0.5 min-h-[48px]' : 'mt-0.5 min-h-[52px]'}>
                    {option.key === 'monthly' ? <div className="h-1.5" /> : (
                      <p className="text-xs font-bold text-slate-500 line-through">{t(`${option.key}OriginalPrice`)}</p>
                    )}
                    <p className={compactLocale ? 'text-lg font-black text-slate-950' : 'text-xl font-black text-slate-950'}>{t(`${option.key}Price`)}</p>
                    {option.key === 'monthly' ? <p className="text-xs font-bold text-slate-600">{t('monthlyUnit')}</p> : null}
                    <p className="min-h-4 text-xs font-black text-blue-800">{t(`${option.key}Save`)}</p>
                  </div>
                  <p className="text-xs font-bold leading-4 text-slate-500">{t(`${option.key}Billing`)}</p>
                </div>
                <div className={proButtonWrapClass}>
                  <PricingSubscribeButton
                    plan={option.plan}
                    labels={{
                      idle: option.key === 'monthly' ? t('monthlyCta') : t(`${option.key}Cta`),
                      loading: t('subscribeMonthlyLoading'),
                      error: t('subscribeMonthlyError')
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className={compactLocale ? 'mt-1 text-xs font-semibold leading-4 text-slate-500' : 'mt-1.5 text-xs font-semibold leading-4 text-slate-500'}>{t('earlyBirdNote')}</p>
        </article>

        <aside className="grid h-full gap-1.5 md:col-span-2 lg:col-span-1 lg:grid-rows-[auto_minmax(0,1fr)]">
          <div className={`rounded-lg border border-slate-200 bg-white ${featurePaddingClass}`}>
            <h2 className="text-base font-black text-slate-950">{copy.featureTitle}</h2>
            <div className={compactLocale ? 'mt-1 overflow-hidden rounded-lg border border-slate-200' : 'mt-1.5 overflow-hidden rounded-lg border border-slate-200'}>
              <div className={compactLocale ? 'grid grid-cols-[1.1fr_0.58fr_0.9fr_0.5fr] text-center text-[11px] font-bold leading-3' : 'grid grid-cols-[1.18fr_0.62fr_0.88fr_0.52fr] text-center text-xs font-bold leading-4'}>
                <div className="bg-slate-100 px-1 py-1 text-left text-slate-600">&nbsp;</div>
                <div className="bg-blue-50 px-1 py-1 text-blue-800">{copy.freeLabel}</div>
                <div className="bg-blue-50 px-1 py-1 text-blue-800">{copy.partialLabel}</div>
                <div className="bg-amber-50 px-1 py-1 text-amber-800">{copy.proLabel}</div>
                {copy.accessRows.map((row) => (
                  <div key={row.feature} className="contents">
                    <div className="min-w-0 break-words border-t border-slate-200 px-1 py-1 text-left font-black text-slate-800">{row.feature}</div>
                    <div className="min-w-0 break-words border-t border-slate-200 px-1 py-1 text-slate-800">{row.free}</div>
                    <div className="min-w-0 break-words border-t border-slate-200 px-1 py-1 text-slate-800">{row.partial}</div>
                    <div className="min-w-0 break-words border-t border-slate-200 px-1 py-1 text-slate-800">{row.pro}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={membershipClass}>
            <MembershipFlowClient
              variant="account"
              labels={{
                panelTitle: copy.membershipTitle,
                panelText: copy.membershipText,
                statusLabel: t('demoStatusLabel'),
                membershipLabel: copy.membershipLabel,
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
          </div>
        </aside>
      </section>
    </main>
  );
}
