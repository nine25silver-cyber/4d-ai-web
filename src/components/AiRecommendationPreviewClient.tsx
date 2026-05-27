'use client';

import Link from 'next/link';
import type {ReactNode} from 'react';
import {useEffect, useMemo, useState} from 'react';
import {getCurrentUserEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';
import {initMemberState, loginUser, readMemberState, subscribeMemberState, type MemberState} from '@/lib/member-state';
import {
  addRewardCredit,
  consumeRewardCredit,
  getFeatureUnlockRemainingMinutes,
  isFeatureUnlockedNow,
  readRewardState,
  subscribeRewardState,
  unlockFeatureForMinutes
} from '@/lib/reward-unlock';
import {FeatureAccessStatusBar} from '@/components/FeatureAccessStatusBar';

type Mode = 'aiGenerated' | 'package' | 'cold' | 'hot';
type PackageType = '24包' | '12包' | '6包' | '4包';

type Props = {
  locale: string;
  providerCode: string;
  providerName: string;
  providerShortName: string;
  coreDigits: string[];
  recommendationNumbers?: string[];
  afterCoreSlot?: ReactNode;
  labels: {
    appCoreDigitsTitle: string;
    detailAnalysis: string;
    coreDigitsPreviewNote: string;
    modeTitle: string;
    aiGeneratedMode: string;
    packageMode: string;
    coldMode: string;
    hotMode: string;
    packageTypeLabel: string;
    lookbackLabel: string;
    resultCountLabel: string;
    allHistory: string;
    generateLockedButton: string;
    summaryTitle: string;
    providerLabel: string;
    favoriteLabel: string;
    basisLabel: string;
    explanationLabel: string;
    basisPrefix: string;
    explanationPrefix: string;
    locked: string;
    lockedPanelText: string;
    previewAiHeadline: string;
    previewPackageHeadline: string;
    previewColdHeadline: string;
    previewHotHeadline: string;
    previewBasisLocked: string;
    previewExplanationLocked: string;
    recommendationUnavailable: string;
    proRequiredTitle: string;
    proRequiredDescription: string;
    login: string;
    goPro: string;
  };
};

const modes: Mode[] = ['aiGenerated', 'package', 'cold', 'hot'];
const packageTypes: PackageType[] = ['24包', '12包', '6包', '4包'];
const lookbackOptions = ['10', '20', '30', '60', 'all'];
const countOptions = ['3', '5', '8', '10'];

export function AiRecommendationPreviewClient({locale, providerName, providerShortName, coreDigits, recommendationNumbers, afterCoreSlot, labels}: Props) {
  const [memberState, setMemberState] = useState<MemberState | null>(null);
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);
  const [rewardCredits, setRewardCredits] = useState(0);
  const [adUnlocked, setAdUnlocked] = useState(false);
  const [unlockMinutesLeft, setUnlockMinutesLeft] = useState(0);
  const [mode, setMode] = useState<Mode>('aiGenerated');
  const [packageType, setPackageType] = useState<PackageType>('24包');
  const [lookback, setLookback] = useState('30');
  const [resultCount, setResultCount] = useState('5');
  const liveRecommendations = useMemo(() => {
    return (recommendationNumbers ?? []).slice(0, 5);
  }, [recommendationNumbers]);
  const isFormalPro = entitlement?.source === 'user_membership_entitlements' && entitlement.isPro;
  const isUnlocked = isFormalPro || adUnlocked;
  const safeCoreDigits = useMemo(() => {
    if (!isUnlocked) return ['-', '-', '-', '-', '-'];
    if (coreDigits.length >= 5) return coreDigits.slice(0, 5);
    return [...coreDigits, '-', '-', '-', '-', '-'].slice(0, 5);
  }, [coreDigits, isUnlocked]);
  const modeLabel = mode === 'aiGenerated' ? labels.aiGeneratedMode : mode === 'package' ? labels.packageMode : mode === 'cold' ? labels.coldMode : labels.hotMode;
  const generateButtonLabel = isUnlocked
    ? (locale === 'zh' ? '生成推荐' : locale === 'ms' ? 'Jana cadangan' : 'Generate recommendation')
    : labels.generateLockedButton;
  const lockedAccessText = entitlementLoading
    ? (locale === 'zh' ? '正在确认会员权限；也可通过广告临时解锁。' : locale === 'ms' ? 'Sedang menyemak akses ahli; iklan masih boleh membuka akses sementara.' : 'Checking membership access; ad unlock remains available.')
    : (locale === 'zh' ? 'AI 完整推荐仅开放给 Pro 会员，或观看广告后临时解锁。' : locale === 'ms' ? 'Cadangan AI penuh hanya untuk Pro atau buka sementara melalui iklan.' : 'Full AI recommendations are for Pro or temporary ad unlock.');
  useEffect(() => {
    let active = true;
    const refreshEntitlement = async () => {
      setEntitlementLoading(true);
      const next = await getCurrentUserEntitlement();
      if (!active) return;
      setEntitlement(next);
      setEntitlementLoading(false);
    };
    initMemberState();
    setMemberState(readMemberState());
    void refreshEntitlement();
    const unsubscribe = subscribeMemberState((next) => {
      setMemberState(next);
      void refreshEntitlement();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    const update = () => {
      setRewardCredits(readRewardState().ai_full ?? 0);
      const active = isFeatureUnlockedNow('ai_full');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('ai_full'));
    };
    update();
    return subscribeRewardState((state) => {
      setRewardCredits(state.ai_full ?? 0);
      const active = isFeatureUnlockedNow('ai_full');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('ai_full'));
    });
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const active = isFeatureUnlockedNow('ai_full');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('ai_full'));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function unlockByRewardedAd() {
    // MVP: simulate a rewarded ad completion, consume one credit, unlock for 30 minutes.
    addRewardCredit('ai_full', 1);
    if (consumeRewardCredit('ai_full', 1)) {
      unlockFeatureForMinutes('ai_full', 30);
      setAdUnlocked(true);
      setUnlockMinutesLeft(30);
    }
  }
  const previewCards = useMemo(() => {
    const headline =
      mode === 'aiGenerated'
        ? labels.previewAiHeadline
        : mode === 'package'
          ? labels.previewPackageHeadline.replace('{type}', packageType)
          : mode === 'cold'
            ? labels.previewColdHeadline
            : labels.previewHotHeadline;
    const modeTag = mode === 'package' ? packageType : modeLabel;
    if (liveRecommendations.length > 0) {
      const numbersForDisplay = isUnlocked ? liveRecommendations : liveRecommendations.map(() => '----');
      return liveRecommendations.map((number, index) => ({
        headline: `${headline} ${index + 1}`,
        displayValue: numbersForDisplay[index] ?? number,
        tags: isUnlocked ? [modeTag, providerShortName] : [labels.locked, modeTag, providerShortName],
        basis: labels.basisPrefix,
        explanation: labels.explanationPrefix
      }));
    }
    return [
      {
        headline,
        displayValue: '----',
        tags: [labels.locked, modeTag, providerShortName],
        basis: labels.previewBasisLocked,
        explanation: labels.previewExplanationLocked
      }
    ];
  }, [isUnlocked, labels, liveRecommendations, mode, modeLabel, packageType, providerShortName]);

  return (
    <section className="mt-6 flex flex-col gap-6">
      <div className="grid min-w-0 gap-5">
        <FeatureAccessStatusBar
          locale={locale}
          locked={!isUnlocked}
          credits={rewardCredits}
          minutesLeft={unlockMinutesLeft}
          showLogin={!memberState?.loggedIn}
          onLogin={() => void loginUser(locale)}
          onUnlock={unlockByRewardedAd}
          proHref={`/${locale}/pricing`}
          lockedText={lockedAccessText}
        />
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-950">{labels.appCoreDigitsTitle}</h2>
            <span className="text-xs font-black text-blue-700">{labels.detailAnalysis}</span>
          </div>
          <div className="relative mx-auto mt-5 grid aspect-square w-full max-w-[260px] grid-cols-3 grid-rows-3 place-items-center">
            <span aria-hidden="true" className="absolute left-1/2 top-[22%] h-[56%] w-px -translate-x-1/2 bg-blue-200" />
            <span aria-hidden="true" className="absolute left-[22%] top-1/2 h-px w-[56%] -translate-y-1/2 bg-blue-200" />
            {safeCoreDigits.map((digit, index) => {
              const positionClass = [
                'col-start-2 row-start-1',
                'col-start-1 row-start-2',
                'col-start-3 row-start-2',
                'col-start-2 row-start-3',
                'col-start-2 row-start-2'
              ][index];
              const isCenter = index === 4;
              const sizeClass = isCenter
                ? 'size-12 text-2xl sm:size-14 sm:text-3xl'
                : 'size-16 text-3xl sm:size-20 sm:text-4xl';
              return (
                <div
                  key={`${digit}-${index}`}
                  className={`relative z-10 grid place-items-center rounded-full border-2 font-black text-slate-950 shadow-sm ${sizeClass} ${
                    isCenter
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-blue-400 bg-white'
                  } ${positionClass}`}
                >
                  {digit}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs font-bold leading-5 text-slate-500">{labels.coreDigitsPreviewNote}</p>
        </section>
        {isUnlocked ? afterCoreSlot : (
          <section className="rounded-[22px] border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">{labels.proRequiredTitle}</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{labels.proRequiredDescription}</p>
            <p className="mt-2 text-xs font-bold text-amber-800">
              {locale === 'zh'
                ? `可用广告解锁次数：${rewardCredits}`
                : locale === 'ms'
                  ? `Kredit buka iklan tersedia: ${rewardCredits}`
                  : `Available rewarded unlock credits: ${rewardCredits}`}
            </p>
            {adUnlocked ? (
              <p className="mt-1 text-xs font-bold text-blue-800">
                {locale === 'zh'
                  ? `本次广告解锁剩余：约 ${unlockMinutesLeft} 分钟`
                  : locale === 'ms'
                    ? `Baki buka kunci iklan: kira-kira ${unlockMinutesLeft} minit`
                    : `Ad unlock remaining: about ${unlockMinutesLeft} minutes`}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {!memberState?.loggedIn ? (
                <button type="button" onClick={() => void loginUser(locale)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
                  {labels.login}
                </button>
              ) : null}
              <button type="button" onClick={unlockByRewardedAd} className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-black text-amber-900 hover:bg-amber-100">
                {locale === 'zh' ? '观看广告并解锁30分钟' : locale === 'ms' ? 'Tonton iklan & buka 30 minit' : 'Watch ad and unlock for 30 minutes'}
              </button>
              <Link href={`/${locale}/pricing`} className="rounded-md bg-blue-800 px-4 py-2 text-sm font-black text-white hover:bg-blue-900">
                {labels.goPro}
              </Link>
            </div>
          </section>
        )}

        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">{labels.modeTitle}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {modes.map((item) => {
              const selected = mode === item;
              const label = item === 'aiGenerated' ? labels.aiGeneratedMode : item === 'package' ? labels.packageMode : item === 'cold' ? labels.coldMode : labels.hotMode;
              return (
                <button key={item} type="button" onClick={() => setMode(item)} aria-pressed={selected} className={`rounded-2xl border px-3 py-4 text-center text-sm font-black ${selected ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>
                  {label}
                </button>
              );
            })}
          </div>

          {mode === 'package' ? (
            <div className="mt-4">
              <div className="text-xs font-black uppercase text-slate-500">{labels.packageTypeLabel}</div>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {packageTypes.map((type) => (
                  <button key={type} type="button" onClick={() => setPackageType(type)} className={`rounded-md border px-2 py-2 text-sm font-black ${packageType === type ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <SelectField label={labels.lookbackLabel} value={lookback} onChange={setLookback} options={lookbackOptions} allHistoryLabel={labels.allHistory} />
            <SelectField label={labels.resultCountLabel} value={resultCount} onChange={setResultCount} options={countOptions} allHistoryLabel={labels.allHistory} />
          </div>
          <button
            type="button"
            disabled={!isUnlocked}
            className={`mt-5 flex min-h-[58px] w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black text-white ${isUnlocked ? 'bg-blue-800 hover:bg-blue-900' : 'bg-slate-900 opacity-80'}`}
          >
            {generateButtonLabel}
          </button>
        </section>
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">{labels.summaryTitle}</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <SummaryLine label={labels.providerLabel} value={providerName} />
            <SummaryLine label={labels.modeTitle} value={modeLabel} />
            {mode === 'package' ? <SummaryLine label={labels.packageTypeLabel} value={packageType} /> : null}
            <SummaryLine label={labels.lookbackLabel} value={lookback === 'all' ? labels.allHistory : lookback} />
            <SummaryLine label={labels.resultCountLabel} value={resultCount} />
          </div>
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">
            {isUnlocked ? (liveRecommendations.length > 0 ? labels.previewExplanationLocked : labels.recommendationUnavailable) : labels.proRequiredDescription}
          </p>
        </section>

        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-black text-slate-800">
            {locale === 'zh' ? '推荐概览' : locale === 'ms' ? 'Ringkasan cadangan' : 'Recommendation overview'}
          </h3>
          <div className="mt-3 grid gap-3">
            {previewCards.map((card) => (
              <RecommendationPreviewCard key={`${card.headline}-${mode}-${packageType}`} card={card} labels={labels} compact />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function SelectField({label, value, onChange, options, allHistoryLabel}: {label: string; value: string; onChange: (value: string) => void; options: string[]; allHistoryLabel: string}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500">
        {options.map((item) => (
          <option key={item} value={item}>{item === 'all' ? allHistoryLabel : item}</option>
        ))}
      </select>
    </label>
  );
}

function SummaryLine({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="font-black text-slate-950">{value}</span>
    </div>
  );
}

function RecommendationPreviewCard({card, labels, compact = false}: {card: {headline: string; displayValue: string; tags: string[]; basis: string; explanation: string}; labels: Props['labels']; compact?: boolean}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-slate-500">{card.headline}</p>
          <div className={`mt-2 font-black tracking-[0.08em] text-slate-900 ${compact ? 'text-2xl' : 'text-3xl'}`}>{card.displayValue}</div>
        </div>
        <button type="button" disabled className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">{labels.favoriteLabel}</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {card.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{tag}</span>)}
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
        <div className="text-xs font-black text-slate-500">{labels.basisLabel} / {labels.explanationLabel}</div>
        <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{labels.basisPrefix}: {card.basis}{'\n'}{labels.explanationPrefix}: {card.explanation}</p>
      </div>
    </article>
  );
}
