import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {type AiHitHistoryMatch, type AiHitHistoryRow} from '@/components/AiHitHistoryPreviewClient';
import {AiHitHistorySectionClient} from '@/components/AiHitHistorySectionClient';
import {AiRecommendationPreviewClient} from '@/components/AiRecommendationPreviewClient';
import {AiProviderSwitcher} from '@/components/AiProviderSwitcher';
import {getRegion, regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import {fetchAiHitHistoryReplay, fetchAiRecommendation, fetchProviderLatest} from '@/lib/cloudflare';
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
  const [, hitHistoryReplay, recommendation, replayHistoryRows] = await Promise.all([
    fetchProviderLatest(provider.code),
    fetchAiHitHistoryReplay(provider.code),
    fetchAiRecommendation(provider.code),
    fetchAiReplayHistoryRows(provider.code)
  ]);
  const top3HistoryPanel = (
    <AiHitHistorySectionClient
      providerCode={provider.code}
      expertTitle={locale === 'zh' ? 'Top3\u4e13\u5bb6' : locale === 'ms' ? 'Pakar Top3' : 'Top3 Expert'}
      rows={replayHistoryRows.top3Expert}
      displayCount={replayHistoryRows.top3Expert.length}
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
        consolationPrizeLabel: prizeLabels.consolation
      }}
    />
  );
  const allRoundHistoryPanel = (
    <AiHitHistorySectionClient
      providerCode={provider.code}
      expertTitle={locale === 'zh' ? '\u5168\u65b9\u4f4d\u4e13\u5bb6' : locale === 'ms' ? 'Pakar Menyeluruh' : 'All-round Expert'}
      rows={replayHistoryRows.allRound}
      displayCount={replayHistoryRows.allRound.length}
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
        consolationPrizeLabel: prizeLabels.consolation
      }}
    />
  );

  return (
    <main className="container-shell pt-2 pb-6">
      <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)] md:items-start">
        <div className="hidden md:block">
          <AiProviderSwitcher
            locale={locale}
            regions={regions}
            currentProviderCode={provider.code}
            title={locale === 'zh' ? '\u5207\u6362 Provider' : locale === 'ms' ? 'Tukar Provider' : 'Switch Provider'}
            variant="sidebar"
          />
        </div>
        <div className="min-w-0">
          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <h1 className="text-2xl font-black text-slate-950">{t('providerTitle', {provider: provider.name})}</h1>
          </section>
          <div className="block md:hidden">
            <AiProviderSwitcher
              locale={locale}
              regions={regions}
              currentProviderCode={provider.code}
              title={locale === 'zh' ? '\u5207\u6362 Provider' : locale === 'ms' ? 'Tukar Provider' : 'Switch Provider'}
            />
          </div>

          <AiRecommendationPreviewClient
            locale={locale}
            coreDigits={recommendation.ok ? recommendation.payload.coreDigits : []}
            top3ExpertDigits={recommendation.ok ? recommendation.payload.top3ExpertDigits : []}
            expertStats={hitHistoryReplay.ok ? {
              top3Expert: hitHistoryReplay.payload.top3Expert,
              allRound: hitHistoryReplay.payload.allRound
            } : null}
            top3HistorySlot={top3HistoryPanel}
            allRoundHistorySlot={allRoundHistoryPanel}
            labels={{
              appCoreDigitsTitle: t('appCoreDigitsTitle'),
              detailAnalysis: t('detailAnalysis'),
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
              proRequiredTitle: locale === 'zh' ? '\u9700\u8981 Pro \u6743\u9650' : locale === 'ms' ? 'Perlu akses Pro' : 'Pro access required',
              proRequiredDescription: locale === 'zh'
                ? '\u5b8c\u6574 AI \u63a8\u8350\u53f7\u7801\u4e0e\u6700\u8fd1100\u671f\u547d\u4e2d\u8be6\u60c5\u4ec5\u5f00\u653e\u7ed9 Pro \u4f1a\u5458\u3002'
                : locale === 'ms'
                  ? 'Nombor cadangan AI penuh dan butiran hit 100 cabutan hanya untuk ahli Pro.'
                  : 'Full AI recommendation numbers and 100-draw hit details are available for Pro members only.',
              login: locale === 'zh' ? '\u7acb\u5373\u767b\u5f55' : locale === 'ms' ? 'Log masuk' : 'Login now',
              goPro: locale === 'zh' ? '\u5347\u7ea7 Pro' : locale === 'ms' ? 'Upgrade Pro' : 'Upgrade Pro'
            }}
          />
        </div>
      </div>
    </main>
  );
}

function getAiHitPrizeLabels(locale: Locale) {
  if (locale === 'zh') {
    return {
      first: '\u5934\u5956',
      second: '\u4e8c\u5956',
      third: '\u4e09\u5956',
      special: '\u7279\u522b\u5956',
      consolation: '\u5b89\u6170\u5956'
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

async function fetchAiReplayHistoryRows(providerCode: string): Promise<{top3Expert: AiHitHistoryRow[]; allRound: AiHitHistoryRow[]}> {
  const baseUrl = (process.env.CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL && process.env.CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL.trim().length > 0
    ? process.env.CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL
    : process.env.NEXT_PUBLIC_CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL) ?? 'https://data.4dai88.com/ai_hit_history_replay';
  const url = `${baseUrl.replace(/\/$/, '')}/${providerCode}.json`;
  try {
    const response = await fetch(url, {cache: 'no-store', headers: {accept: 'application/json'}});
    if (!response.ok) return {top3Expert: [], allRound: []};
    const json = await response.json() as Record<string, unknown>;
    const records = Array.isArray(json.records) ? json.records : [];
    return {
      top3Expert: records.map((record, index) => toReplayRow(record, index, 'top3_expert')).slice(0, 100),
      allRound: records.map((record, index) => toReplayRow(record, index, 'all_round')).slice(0, 100)
    };
  } catch {
    return {top3Expert: [], allRound: []};
  }
}

function toReplayRow(raw: unknown, index: number, mode: 'top3_expert' | 'all_round'): AiHitHistoryRow {
  const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const drawDate = String(record.draw_date ?? record.drawDate ?? record.target_draw_date ?? record.targetDrawDate ?? '').trim() || '----';
  const digits = normalizeReplayDigits(mode === 'top3_expert'
    ? (record.top3_expert_digits ?? record.top3ExpertDigits)
    : (record.all_round_digits ?? record.allRoundDigits ?? record.dynamic_ai_top_digits ?? record.dynamicAiTopDigits ?? record.ai_top_digits ?? record.aiTopDigits));
  const hitSource = mode === 'top3_expert'
    ? (record.top3_expert_hits ?? record.top3ExpertHits)
    : (record.all_round_hits ?? record.allRoundHits ?? record.hit_matches ?? record.hitMatches);
  const hitMatches = normalizeReplayMatches(hitSource, digits);
  return {
    id: `${mode}|${String(record.id ?? drawDate)}|${index}`,
    uniqueKey: `${mode}|${drawDate}|${index}`,
    date: drawDate,
    aiDigits: [...digits, '--', '--', '--', '--', '--'].slice(0, 5),
    hitMatches
  };
}

function normalizeReplayDigits(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,\s]+/)
      : [];
  const digits: string[] = [];
  for (const item of raw) {
    for (const digit of String(item ?? '').replace(/\D/g, '').split('')) {
      if (/^\d$/.test(digit) && !digits.includes(digit)) digits.push(digit);
      if (digits.length >= 5) return digits;
    }
  }
  return digits;
}

function normalizeReplayMatches(value: unknown, digits: string[]): AiHitHistoryMatch[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry))
    .map((entry) => {
      const activeDigits = Array.isArray(entry.active_digits ?? entry.activeDigits)
        ? (entry.active_digits ?? entry.activeDigits) as unknown[]
        : [];
      return {
        number: String(entry.number ?? '').replace(/\D/g, '').slice(0, 4) || '----',
        prizeLabel: String(entry.prize_label ?? entry.prizeLabel ?? '').trim(),
        activeIndexes: activeDigits
          .map((digit) => digits.indexOf(String(digit ?? '').replace(/\D/g, '').slice(0, 1)))
          .filter((value, index, list) => value >= 0 && list.indexOf(value) === index)
      };
    });
}
