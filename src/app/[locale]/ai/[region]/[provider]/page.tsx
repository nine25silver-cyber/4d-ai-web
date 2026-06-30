import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {type AiHitHistoryRow} from '@/components/AiHitHistoryPreviewClient';
import {AiHitHistorySectionClient} from '@/components/AiHitHistorySectionClient';
import {AiRecommendationPreviewClient} from '@/components/AiRecommendationPreviewClient';
import {AiProviderSwitcher} from '@/components/AiProviderSwitcher';
import {getRegion, regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import {fetchAiHitHistory, fetchAiRecommendation, fetchProviderLatest} from '@/lib/cloudflare';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) return {};
  return buildMetadata({
    locale,
    path: `/ai/${region.slug}/${provider.code}`,
    title: `${provider.name} 4D AI recommendations`,
    description: `View ${provider.name} 4D AI recommendation numbers and recent hit history.`
  });
}

export default async function AiProviderPage({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}) {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) notFound();
  const t = await getTranslations({locale, namespace: 'AI'});
  const prizeLabels = getAiHitPrizeLabels(locale);
  const [, hitHistory, recommendation] = await Promise.all([
    fetchProviderLatest(provider.code),
    fetchAiHitHistory(provider.code),
    fetchAiRecommendation(provider.code)
  ]);
  const sourceDebug = hitHistory.ok
    ? `source=server_cloudflare_ai_hit_history url=${hitHistory.url}`
    : `source=server_cloudflare_ai_hit_history_unavailable url=${hitHistory.url} reason=${hitHistory.reason}`;
  const hitHistoryRows: AiHitHistoryRow[] = hitHistory.ok ? hitHistory.payload.records.map((record) => ({
    id: record.id,
    date: record.drawDate,
    sortKey: record.drawDate || '----',
    debugMeta: `draw_date=${record.drawDate || '----'} | checked_at=${record.drawDate || '----'} | source=server_cloudflare`,
    aiDigits: record.aiDigits,
    hitMatches: record.hitMatches
  })) : [];
  const hitHistoryPanel = (
    <AiHitHistorySectionClient
      providerCode={provider.code}
      initialHitCount={hitHistory.ok ? hitHistory.payload.hitCount : null}
      rows={hitHistoryRows}
      displayCount={hitHistoryRows.length}
      sourceDebug={sourceDebug}
      labels={{
        locked: t('locked'),
        hitCountPendingValue: t('hitCountPendingValue'),
        hitRowCountLabel: t('hitRowCountLabel', {count: '{count}'}),
        hitRecommendedLabel: t('hitRecommendedLabel'),
        hitResultLabel: t('hitResultLabel'),
        hitPrizePlaceholder: t('hitPrizePlaceholder'),
        hitExpandLabel: t('hitExpandLabel'),
        hitCollapseLabel: t('hitCollapseLabel'),
        firstPrizeLabel: prizeLabels.first,
        secondPrizeLabel: prizeLabels.second,
        thirdPrizeLabel: prizeLabels.third,
        specialPrizeLabel: prizeLabels.special,
        consolationPrizeLabel: prizeLabels.consolation,
        hitHistoryEyebrow: t('hitHistoryEyebrow'),
        hitHistoryTitle: t('hitHistoryTitle'),
        hitCountInlineLabel: t('hitCountInlineLabel'),
        viewDetails: locale === 'zh' ? '查看100期详情' : locale === 'ms' ? 'Lihat 100 rekod' : 'View 100 records',
        hideDetails: locale === 'zh' ? '收起详情' : locale === 'ms' ? 'Sembunyikan butiran' : 'Hide details'
      }}
    />
  );

  return (
    <main className="container-shell py-8">
      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-800">{region.label}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{t('providerTitle', {provider: provider.name})}</h1>
      </section>
      <AiProviderSwitcher
        locale={locale}
        regions={regions}
        currentProviderCode={provider.code}
        title={locale === 'zh' ? '切换 Provider' : locale === 'ms' ? 'Tukar Provider' : 'Switch Provider'}
      />

      <AiRecommendationPreviewClient
        locale={locale}
        coreDigits={recommendation.ok ? recommendation.payload.coreDigits : []}
          afterCoreSlot={hitHistoryPanel}
          labels={{
            appCoreDigitsTitle: t('appCoreDigitsTitle'),
            detailAnalysis: t('detailAnalysis'),
            coreDigitsPreviewNote: t('coreDigitsPreviewNote'),
            coreDigitsGuideAction: t('coreDigitsGuideAction'),
            coreDigitsGuideTitle: t('coreDigitsGuideTitle'),
            coreDigitsGuideBody: t('coreDigitsGuideBody'),
            coreDigitsGuideNotReady: t('coreDigitsGuideNotReady'),
            coreDigitsGuideExampleLabel: t('coreDigitsGuideExampleLabel'),
            coreDigitsGuideCombinationNote: t('coreDigitsGuideCombinationNote'),
            coreDigitsGuideSampleTitle: t('coreDigitsGuideSampleTitle'),
            coreDigitsGuideSampleUsing2: t('coreDigitsGuideSampleUsing2'),
            coreDigitsGuideSampleUsing3: t('coreDigitsGuideSampleUsing3'),
            coreDigitsGuideSampleUsing4: t('coreDigitsGuideSampleUsing4'),
            coreDigitsGuideNumberPrefix: t('coreDigitsGuideNumberPrefix'),
            coreDigitsGuideImportantTitle: t('coreDigitsGuideImportantTitle'),
            coreDigitsGuideImportantBody: t('coreDigitsGuideImportantBody'),
            proRequiredTitle: locale === 'zh' ? '需要 Pro 权限' : locale === 'ms' ? 'Perlu akses Pro' : 'Pro access required',
            proRequiredDescription: locale === 'zh'
              ? '完整 AI 推荐号码与最近100期命中详情仅开放给 Pro 会员。'
              : locale === 'ms'
                ? 'Nombor cadangan AI penuh dan butiran hit 100 cabutan hanya untuk ahli Pro.'
                : 'Full AI recommendation numbers and 100-draw hit details are available for Pro members only.',
            login: locale === 'zh' ? '立即登录' : locale === 'ms' ? 'Log masuk' : 'Login now',
            goPro: locale === 'zh' ? '升级 Pro' : locale === 'ms' ? 'Upgrade Pro' : 'Upgrade Pro'
          }}
        />

      <section className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2 className="text-lg font-black text-slate-950">{t('howItWorksTitle')}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{t('howItWorksText')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/pricing`} className="rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-100">{t('goPro')}</Link>
          <span className="rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-bold text-blue-800">{t('watchAd')}</span>
        </div>
      </section>
    </main>
  );
}

function getAiHitPrizeLabels(locale: Locale) {
  if (locale === 'zh') {
    return {
      first: '头奖',
      second: '二奖',
      third: '三奖',
      special: '特别奖',
      consolation: '安慰奖'
    };
  }
  if (locale === 'ms') {
    return {
      first: 'Hadiah Pertama',
      second: 'Hadiah Kedua',
      third: 'Hadiah Ketiga',
      special: 'Hadiah Khas',
      consolation: 'Hadiah Saguhati'
    };
  }
  return {
    first: 'First Prize',
    second: 'Second Prize',
    third: 'Third Prize',
    special: 'Special',
    consolation: 'Consolation'
  };
}
