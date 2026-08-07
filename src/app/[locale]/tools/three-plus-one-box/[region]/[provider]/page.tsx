import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {AdAccessGateClient} from '@/components/AdAccessGateClient';
import {AiProviderSwitcher} from '@/components/AiProviderSwitcher';
import {ThreePlusOneBoxRankingClient} from '@/components/ThreePlusOneBoxRankingClient';
import {isThreePlusOneBoxSupportedProvider} from '@/lib/cloudflare';
import {getProviderDisplayName, getRegion, regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) return {};
  const providerName = getProviderDisplayName(provider, locale);
  return buildMetadata({
    locale,
    path: `/tools/three-plus-one-box/${region.slug}/${provider.code}`,
    title: `${providerName} 3D BOX ranking`,
    description: `3D BOX ranking status for ${providerName}.`
  });
}

export default async function ThreePlusOneBoxProviderPage({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}) {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider || !isThreePlusOneBoxSupportedProvider(provider.code)) notFound();

  const aiT = await getTranslations({locale, namespace: 'AI'});
  const toolsT = await getTranslations({locale, namespace: 'Tools'});
  const providerName = getProviderDisplayName(provider, locale);
  const supportedRegions = regions
    .map((item) => ({
      ...item,
      providers: item.providers.filter((providerItem) => isThreePlusOneBoxSupportedProvider(providerItem.code))
    }))
    .filter((item) => item.providers.length > 0);

  return (
    <main className="container-shell pt-2 pb-6">
      <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)] md:items-start">
        <div className="hidden md:block">
          <AiProviderSwitcher
            locale={locale}
            regions={supportedRegions}
            currentProviderCode={provider.code}
            title={aiT('providerSwitcherTitle')}
            variant="sidebar"
            basePath="tools/three-plus-one-box"
          />
        </div>
        <div className="min-w-0 space-y-3">
          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">3D BOX</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">{`${providerName} ${toolsT('threeDBoxTitle')}`}</h1>
            <p className="mt-1 text-sm font-bold text-slate-600">{toolsT('threeDBoxIntro')}</p>
          </section>

          <div className="block md:hidden">
            <AiProviderSwitcher
              locale={locale}
              regions={supportedRegions}
              currentProviderCode={provider.code}
              title={aiT('providerSwitcherTitle')}
              basePath="tools/three-plus-one-box"
            />
          </div>

          <AdAccessGateClient
            locale={locale}
            feature="ad_access_3d"
            adLabel="3D"
            lockedText={locale === 'zh' ? '3D 包字排行榜开放给 Pro 会员，或观看 3D 广告后临时解锁。' : locale === 'ms' ? 'Ranking boxed 3D untuk ahli Pro, atau buka sementara melalui iklan 3D.' : '3D BOX ranking is for Pro, or temporary 3D ad unlock.'}
          >
            <ThreePlusOneBoxRankingClient
              locale={locale}
              provider={provider}
              providerName={providerName}
              labels={{
                updatedAt: toolsT('threeDBoxUpdatedAt'),
                generatedAt: toolsT('threeDBoxGeneratedAt'),
                hotTitle: toolsT('threeDBoxHotTitle'),
                coldTitle: toolsT('threeDBoxColdTitle'),
                coldSummaryTitle: toolsT('threeDBoxColdSummaryTitle'),
                modeTitle: toolsT('threeDBoxModeTitle'),
                hotRangeTitle: toolsT('threeDBoxHotRangeTitle'),
                range6m: toolsT('threeDBoxRange6m'),
                range1y: toolsT('threeDBoxRange1y'),
                rangeAll: toolsT('threeDBoxRangeAll'),
                occurrences: toolsT('threeDBoxOccurrences'),
                occurrenceUnit: toolsT('threeDBoxOccurrenceUnit'),
                currentGap: toolsT('threeDBoxCurrentGap'),
                historicalMaxGap: toolsT('threeDBoxHistoricalMaxGap'),
                days: toolsT('threeDBoxDays'),
                draws: toolsT('threeDBoxDraws'),
                noData: toolsT('threeDBoxNoData'),
                loading: toolsT('threeDBoxLoading'),
                loadFailed: toolsT('threeDBoxLoadFailed'),
                retry: toolsT('threeDBoxRetry'),
                latestSeen: toolsT('threeDBoxLatestSeen'),
                viewDetails: toolsT('threeDBoxViewDetails'),
                hideDetails: toolsT('threeDBoxHideDetails'),
                prizeWinsTitle: toolsT('threeDBoxPrizeWinsTitle'),
                firstPrize: toolsT('threeDBoxFirstPrize'),
                secondPrize: toolsT('threeDBoxSecondPrize'),
                thirdPrize: toolsT('threeDBoxThirdPrize')
              }}
            />
          </AdAccessGateClient>
        </div>
      </div>
    </main>
  );
}
