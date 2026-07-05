'use client';

import Link from 'next/link';
import type {ReactNode} from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {canAccessAiCore, getCurrentUserEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';
import {initMemberState, loginUser, readMemberState, subscribeMemberState, type MemberState} from '@/lib/member-state';
import {
  addRewardCredit,
  consumeRewardCredit,
  getFeatureUnlockRemainingMinutes,
  isFeatureUnlockedNow,
  subscribeRewardState,
  unlockFeatureForMinutes
} from '@/lib/reward-unlock';

type Props = {
  locale: string;
  coreDigits: string[];
  top3ExpertDigits: string[];
  expertStats?: {
    top3Expert: ExpertHitStats;
    allRound: ExpertHitStats;
  } | null;
  top3HistorySlot?: ReactNode;
  allRoundHistorySlot?: ReactNode;
  labels: {
    appCoreDigitsTitle: string;
    detailAnalysis: string;
    coreDigitsGuideAction: string;
    coreDigitsGuideTitle: string;
    coreDigitsGuideBody: string;
    coreDigitsGuideNotReady: string;
    coreDigitsGuideExampleLabel: string;
    coreDigitsGuideCombinationNote: string;
    coreDigitsGuideSampleTitle: string;
    coreDigitsGuideSampleUsing2: string;
    coreDigitsGuideSampleUsing3: string;
    coreDigitsGuideSampleUsing4: string;
    coreDigitsGuideNumberPrefix: string;
    coreDigitsGuideImportantTitle: string;
    coreDigitsGuideImportantBody: string;
    proRequiredTitle: string;
    proRequiredDescription: string;
    login: string;
    goPro: string;
  };
};

type ExpertMode = 'top3_expert' | 'all_round';

type ExpertHitStats = {
  top3Hits: number | null;
  specialHits: number | null;
  consoHits: number | null;
  totalHits: number | null;
};

type ExpertCardCopy = {
  sectionTitle: string;
  top3ExpertTitle: string;
  allRoundTitle: string;
  recordWindow: string;
  top3Match: string;
  specialMatch: string;
  consoMatch: string;
  coreDigits: string;
  totalMatch: string;
  timesUnit: string;
  viewRecords: string;
};

export function AiRecommendationPreviewClient({locale, coreDigits, top3ExpertDigits, expertStats, top3HistorySlot, allRoundHistorySlot, labels}: Props) {
  const [memberState, setMemberState] = useState<MemberState | null>(null);
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);
  const [adUnlocked, setAdUnlocked] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedExpertMode, setSelectedExpertMode] = useState<ExpertMode>('all_round');
  const [unlockMinutesLeft, setUnlockMinutesLeft] = useState(0);
  const recordsRef = useRef<HTMLDivElement | null>(null);
  const hasAiAccess = canAccessAiCore(entitlement);
  const canUseAllRoundExpert = hasAiAccess || adUnlocked;
  const canUseTop3Expert = hasAiAccess;
  const allRoundDigits = useMemo(() => toFiveDigits(coreDigits), [coreDigits]);
  const top3Digits = useMemo(() => toFiveDigits(top3ExpertDigits), [top3ExpertDigits]);
  const guideDigits = useMemo(() => allRoundDigits.filter((digit) => /^\d$/.test(digit)), [allRoundDigits]);
  const expertCopy = useMemo(() => getExpertCardCopy(locale), [locale]);
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
  void lockedAccessText;
  useEffect(() => {
    const update = () => {
      const active = isFeatureUnlockedNow('ai_full');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('ai_full'));
    };
    update();
    return subscribeRewardState(() => {
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
  function showRecords(mode: ExpertMode) {
    if (mode === 'top3_expert' && !canUseTop3Expert) return;
    if (mode === 'all_round' && !canUseAllRoundExpert) return;
    setSelectedExpertMode(mode);
    window.setTimeout(() => {
      recordsRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 0);
  }
  return (
    <section className="mt-2 flex flex-col gap-3">
      <div className="grid min-w-0 gap-3">
        <section className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-black text-slate-950">{expertCopy.sectionTitle}</h2>
            <button
              type="button"
              onClick={() => setGuideOpen((current) => !current)}
              aria-expanded={guideOpen}
              className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-800 hover:bg-blue-100"
            >
              {labels.coreDigitsGuideAction}
            </button>
          </div>
          {guideOpen ? <CoreDigitsGuide digits={guideDigits} labels={labels} /> : null}
          <div className="mt-2 grid gap-2.5 lg:grid-cols-2">
            <ExpertRecommendationCard
              title={expertCopy.top3ExpertTitle}
              digits={top3Digits}
              stats={expertStats?.top3Expert ?? null}
              copy={expertCopy}
              canAccess={canUseTop3Expert}
              lockedText={locale === 'zh' ? 'Top3 专家仅限 Trial / Pro 使用。' : locale === 'ms' ? 'Pakar Top3 hanya untuk Trial / Pro.' : 'Top3 Expert is available for Trial / Pro only.'}
              onViewRecords={() => showRecords('top3_expert')}
            />
            <ExpertRecommendationCard
              title={expertCopy.allRoundTitle}
              digits={allRoundDigits}
              stats={expertStats?.allRound ?? null}
              copy={expertCopy}
              canAccess={canUseAllRoundExpert}
              lockedText={locale === 'zh' ? '观看广告后可临时使用全方位专家。' : locale === 'ms' ? 'Tonton iklan untuk membuka Pakar Menyeluruh sementara.' : 'Watch an ad to unlock All-round Expert temporarily.'}
              onViewRecords={() => showRecords('all_round')}
            />
          </div>
        </section>
        <div id="ai-hit-history-details" ref={recordsRef}>
          {selectedExpertMode === 'top3_expert'
            ? (canUseTop3Expert ? top3HistorySlot : (
              <LockedExpertPanel
                locale={locale}
                memberLoggedIn={memberState?.loggedIn === true}
                labels={labels}
                onLogin={() => void loginUser(locale)}
                onUnlockByAd={unlockByRewardedAd}
                unlockMinutesLeft={unlockMinutesLeft}
                top3Only
              />
            ))
            : (canUseAllRoundExpert ? allRoundHistorySlot : (
              <LockedExpertPanel
                locale={locale}
                memberLoggedIn={memberState?.loggedIn === true}
                labels={labels}
                onLogin={() => void loginUser(locale)}
                onUnlockByAd={unlockByRewardedAd}
                unlockMinutesLeft={unlockMinutesLeft}
              />
            ))}
        </div>

      </div>
    </section>
  );
}

function ExpertRecommendationCard({title, digits, stats, copy, canAccess, lockedText, onViewRecords}: {title: string; digits: string[]; stats: ExpertHitStats | null; copy: ExpertCardCopy; canAccess: boolean; lockedText: string; onViewRecords: () => void}) {
  const metricRows = [
    {label: copy.top3Match, value: canAccess ? stats?.top3Hits ?? null : null},
    {label: copy.specialMatch, value: canAccess ? stats?.specialHits ?? null : null},
    {label: copy.consoMatch, value: canAccess ? stats?.consoHits ?? null : null}
  ];
  const totalText = formatExpertCount(canAccess ? stats?.totalHits ?? null : null);
  const displayDigits = canAccess ? digits : ['-', '-', '-', '-', '-'];
  return (
    <article className={`rounded-lg border bg-white p-2.5 shadow-sm ${canAccess ? 'border-slate-200' : 'border-amber-200'}`}>
      <div className="flex flex-wrap items-start justify-between gap-1.5">
        <div>
          <h3 className="text-base font-black text-slate-950">{title}</h3>
          <p className="text-[11px] font-black leading-4 text-blue-800">{copy.recordWindow}</p>
        </div>
        <button type="button" onClick={onViewRecords} disabled={!canAccess} className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-black leading-4 text-blue-800 hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400">
          {copy.viewRecords}
        </button>
      </div>
      {!canAccess ? <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold leading-4 text-amber-900">{lockedText}</p> : null}
      <div className="mt-2 grid gap-1.5">
        {metricRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1">
            <span className="text-xs font-black text-slate-700">{row.label}</span>
            <span className="text-lg font-black leading-6 text-slate-950">{formatExpertCount(row.value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-md border border-blue-100 bg-blue-50 p-2">
        <p className="text-xs font-black text-slate-700">{copy.coreDigits}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {displayDigits.map((digit, index) => (
            <span key={`${digit}-${index}`} className="grid size-7 place-items-center rounded-full border border-blue-300 bg-white text-sm font-black text-blue-950">
              {digit}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2 rounded-md bg-slate-950 px-2.5 py-1.5 text-center text-xs font-black leading-5 text-white">
        {copy.totalMatch} {totalText}{totalText === '--' ? '' : ` ${copy.timesUnit}`}
      </p>
    </article>
  );
}

function LockedExpertPanel({locale, memberLoggedIn, labels, onLogin, onUnlockByAd, unlockMinutesLeft, top3Only = false}: {locale: string; memberLoggedIn: boolean; labels: Props['labels']; onLogin: () => void; onUnlockByAd: () => void; unlockMinutesLeft: number; top3Only?: boolean}) {
  const title = top3Only
    ? (locale === 'zh' ? 'Top3 专家需要 Trial / Pro 权限' : locale === 'ms' ? 'Pakar Top3 memerlukan akses Trial / Pro' : 'Top3 Expert requires Trial / Pro access')
    : labels.proRequiredTitle;
  const description = top3Only
    ? (locale === 'zh' ? '观看广告只会解锁全方位专家，不能解锁 Top3 专家。' : locale === 'ms' ? 'Iklan hanya membuka Pakar Menyeluruh, bukan Pakar Top3.' : 'Ad unlock only opens All-round Expert, not Top3 Expert.')
    : labels.proRequiredDescription;
  return (
    <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{description}</p>
      {unlockMinutesLeft > 0 ? (
        <p className="mt-1 text-xs font-bold text-blue-800">
          {locale === 'zh'
            ? `本次广告解锁剩余：约 ${unlockMinutesLeft} 分钟`
            : locale === 'ms'
              ? `Baki buka kunci iklan: kira-kira ${unlockMinutesLeft} minit`
              : `Ad unlock remaining: about ${unlockMinutesLeft} minutes`}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {!memberLoggedIn ? (
          <button type="button" onClick={onLogin} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
            {labels.login}
          </button>
        ) : null}
        {!top3Only ? (
          <button type="button" onClick={onUnlockByAd} className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-black text-amber-900 hover:bg-amber-100">
            {locale === 'zh' ? '观看广告并解锁30分钟' : locale === 'ms' ? 'Tonton iklan & buka 30 minit' : 'Watch ad and unlock for 30 minutes'}
          </button>
        ) : null}
        <Link href={`/${locale}/pricing`} className="rounded-md bg-blue-800 px-4 py-2 text-sm font-black text-white hover:bg-blue-900">
          {labels.goPro}
        </Link>
      </div>
    </section>
  );
}

function toFiveDigits(digits: string[]) {
  const normalized = digits
    .map((digit) => String(digit ?? '').replace(/\D/g, '').slice(0, 1))
    .filter(Boolean);
  return [...normalized, '-', '-', '-', '-', '-'].slice(0, 5);
}

function formatExpertCount(value: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value}` : '--';
}

function getExpertCardCopy(locale: string): ExpertCardCopy {
  if (locale === 'zh') {
    return {
      sectionTitle: 'AI专家推荐',
      top3ExpertTitle: 'Top3专家',
      allRoundTitle: '全方位专家',
      recordWindow: '100期分析记录',
      top3Match: 'Top3匹配',
      specialMatch: '特别奖匹配',
      consoMatch: '安慰奖匹配',
      coreDigits: '4+1核心数字',
      totalMatch: '最近100期匹配',
      timesUnit: '次',
      viewRecords: '查看完整结果记录'
    };
  }
  if (locale === 'ms') {
    return {
      sectionTitle: 'Cadangan Pakar AI',
      top3ExpertTitle: 'Pakar Top3',
      allRoundTitle: 'Pakar Menyeluruh',
      recordWindow: 'Analisis 100 cabutan',
      top3Match: 'Padanan Top3',
      specialMatch: 'Padanan Khas',
      consoMatch: 'Padanan Saguhati',
      coreDigits: 'Digit teras 4+1',
      totalMatch: 'Jumlah padanan 100 cabutan',
      timesUnit: 'kali',
      viewRecords: 'Lihat rekod penuh'
    };
  }
  return {
    sectionTitle: 'AI Expert Recommendations',
    top3ExpertTitle: 'Top3 Expert',
    allRoundTitle: 'All-round Expert',
    recordWindow: '100-draw analysis record',
    top3Match: 'Top3 matches',
    specialMatch: 'Special matches',
    consoMatch: 'Consolation matches',
    coreDigits: '4+1 core digits',
    totalMatch: 'Recent 100-draw total',
    timesUnit: 'times',
    viewRecords: 'View full result history'
  };
}

function CoreDigitsGuide({digits, labels}: {digits: string[]; labels: Props['labels']}) {
  return (
    <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-bold leading-6 text-slate-700">
      <h3 className="text-base font-black text-slate-950">{labels.coreDigitsGuideTitle}</h3>
      <p className="mt-2 whitespace-pre-line">{labels.coreDigitsGuideBody}</p>
      {digits.length === 0 ? (
        <p className="mt-3 text-slate-600">{labels.coreDigitsGuideNotReady}</p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-slate-600">{labels.coreDigitsGuideExampleLabel}</span>
            {digits.map((digit) => (
              <span key={digit} className="rounded-full border border-blue-200 bg-white px-3 py-1 text-blue-900">{digit}</span>
            ))}
          </div>
          <p className="mt-3 whitespace-pre-line">{labels.coreDigitsGuideCombinationNote}</p>
          <div className="mt-3">
            <p className="font-black text-slate-950">{labels.coreDigitsGuideSampleTitle}</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-md border border-blue-100 bg-white p-3 font-sans text-xs leading-5 text-slate-700">{coreDigitSampleNumbers(digits, labels)}</pre>
          </div>
          <div className="mt-3">
            <p className="font-black text-slate-950">{labels.coreDigitsGuideImportantTitle}</p>
            <p className="mt-1 whitespace-pre-line">{labels.coreDigitsGuideImportantBody}</p>
          </div>
        </>
      )}
    </div>
  );
}

function coreDigitExamples(digits: string[], digitCount: number) {
  if (digits.length === 0) return [];
  const pool = Array.from({length: digitCount}, (_, index) => digits[index % digits.length]);
  const [a, b = a, c = a, d = a] = pool;
  if (digitCount === 2) return [`${a}${a}${b}${b}`, `${b}${b}${a}${a}`, `${a}${b}${a}${b}`];
  if (digitCount === 3) return [`${a}${a}${b}${c}`, `${b}${b}${c}${a}`, `${c}${a}${b}${c}`];
  if (digitCount === 4) return [`${a}${b}${c}${d}`, `${b}${c}${d}${a}`, `${c}${d}${a}${b}`];
  return [];
}

function coreDigitExampleLines(digits: string[], digitCount: number, numberPrefix: string) {
  return coreDigitExamples(digits, digitCount).map((number) => `${numberPrefix} ${number}`).join('\n');
}

function coreDigitSampleNumbers(digits: string[], labels: Props['labels']) {
  return [
    `${labels.coreDigitsGuideSampleUsing2}\n\n${coreDigitExampleLines(digits, 2, labels.coreDigitsGuideNumberPrefix)}`,
    `${labels.coreDigitsGuideSampleUsing3}\n\n${coreDigitExampleLines(digits, 3, labels.coreDigitsGuideNumberPrefix)}`,
    `${labels.coreDigitsGuideSampleUsing4}\n\n${coreDigitExampleLines(digits, 4, labels.coreDigitsGuideNumberPrefix)}`
  ].join('\n\n');
}
