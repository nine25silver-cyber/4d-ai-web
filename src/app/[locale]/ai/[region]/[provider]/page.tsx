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
  const [latest, hitHistory, recommendation] = await Promise.all([
    fetchProviderLatest(provider.code),
    fetchAiHitHistory(provider.code),
    fetchAiRecommendation(provider.code)
  ]);
  const sourceDebug = hitHistory.ok
    ? `source=server_cloudflare_ai_hit_history url=${hitHistory.url}`
    : `source=server_cloudflare_ai_hit_history_unavailable url=${hitHistory.url} reason=${hitHistory.reason}`;
  const signal = latest.ok ? buildSignalSnapshot(latest.payload) : null;
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
      <Link href={`/${locale}/ai/${region.slug}`} className="text-sm font-bold text-blue-800 hover:text-blue-900">{t('backToRegion')}</Link>
      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-800">{region.label}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{t('providerTitle', {provider: provider.name})}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{t('providerIntro')}</p>
      </section>
      <AiProviderSwitcher
        locale={locale}
        regions={regions}
        currentProviderCode={provider.code}
        title={locale === 'zh' ? '切换 Provider' : locale === 'ms' ? 'Tukar Provider' : 'Switch Provider'}
      />

      <section className="mt-6">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase text-blue-800">{t('signalSourceEyebrow')}</p>
              <h2 className="mt-2 text-xl font-black text-slate-950">{t('signalSourceTitle')}</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{latest.ok ? t('sourceReady') : t('sourceUnavailable')}</span>
          </div>
          {signal ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <SignalCard label={t('latestDrawDate')} value={signal.drawDate || '-'} />
              <SignalCard label={t('latestDrawNo')} value={signal.drawNo || '-'} />
              <SignalCard label={t('numbersScanned')} value={String(signal.numberCount)} />
            </div>
          ) : (
            <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">{t('sourceUnavailableText')}</p>
          )}
        </article>
      </section>
        <AiRecommendationPreviewClient
          locale={locale}
          providerCode={provider.code}
      providerName={provider.name}
      providerShortName={provider.shortName}
          coreDigits={recommendation.ok ? recommendation.payload.coreDigits : []}
          recommendationNumbers={recommendation.ok ? recommendation.payload.numbers : []}
          afterCoreSlot={hitHistoryPanel}
          labels={{
            appCoreDigitsTitle: t('appCoreDigitsTitle'),
            detailAnalysis: t('detailAnalysis'),
            coreDigitsPreviewNote: t('coreDigitsPreviewNote'),
            modeTitle: t('modeTitle'),
            aiGeneratedMode: t('aiGeneratedMode'),
            packageMode: t('packageMode'),
            coldMode: t('coldMode'),
            hotMode: t('hotMode'),
            packageTypeLabel: t('packageTypeLabel'),
            lookbackLabel: t('lookbackLabel'),
            resultCountLabel: t('resultCountLabel'),
            allHistory: t('allHistory'),
            generateLockedButton: t('generateLockedButton'),
            summaryTitle: t('summaryTitle'),
            providerLabel: t('providerLabel'),
            favoriteLabel: t('favoriteLabel'),
            basisLabel: t('basisLabel'),
            explanationLabel: t('explanationLabel'),
            basisPrefix: t('basisPrefix'),
            explanationPrefix: t('explanationPrefix'),
            locked: t('locked'),
            lockedPanelText: t('lockedPanelText'),
            previewAiHeadline: t('previewAiHeadline'),
            previewPackageHeadline: t('previewPackageHeadline'),
            previewColdHeadline: t('previewColdHeadline'),
            previewHotHeadline: t('previewHotHeadline'),
            previewBasisLocked: t('previewBasisLocked'),
            previewExplanationLocked: t('previewExplanationLocked'),
            recommendationUnavailable: locale === 'zh'
              ? '该 provider 的 AI 推荐号码尚未接入，请先完成 Cloudflare AI recommendation JSON。'
              : locale === 'ms'
                ? 'Data nombor cadangan AI sebenar untuk provider ini belum disambung. Sila sambung Cloudflare AI recommendation JSON dahulu.'
                : 'Real AI recommendation number data is not connected for this provider yet. Please connect Cloudflare AI recommendation JSON first.',
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

function SignalCard({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-black uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-black text-slate-950">{value}</div>
    </div>
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

function buildSignalSnapshot(payload: {
  draw_date?: string;
  draw_no?: string;
  first_prize?: string;
  second_prize?: string;
  third_prize?: string;
  special_numbers?: string[];
  consolation_numbers?: string[];
}) {
  const numbers = [
    payload.first_prize,
    payload.second_prize,
    payload.third_prize,
    ...(payload.special_numbers ?? []),
    ...(payload.consolation_numbers ?? [])
  ].map((item) => String(item ?? '').replace(/\D/g, '')).filter((item) => item.length === 4);
  const digitMap = new Map<string, number>(Array.from({length: 10}, (_, index) => [String(index), 0]));
  for (const number of numbers) {
    for (const digit of number) digitMap.set(digit, (digitMap.get(digit) ?? 0) + 1);
  }
  return {
    drawDate: payload.draw_date ?? '',
    drawNo: payload.draw_no ?? '',
    numberCount: numbers.length,
    digitCounts: Array.from(digitMap.entries()).map(([digit, count]) => ({digit, count}))
  };
}
