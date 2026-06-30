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
  subscribeRewardState,
  unlockFeatureForMinutes
} from '@/lib/reward-unlock';

type Props = {
  locale: string;
  coreDigits: string[];
  afterCoreSlot?: ReactNode;
  labels: {
    appCoreDigitsTitle: string;
    detailAnalysis: string;
    coreDigitsPreviewNote: string;
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

export function AiRecommendationPreviewClient({locale, coreDigits, afterCoreSlot, labels}: Props) {
  const [memberState, setMemberState] = useState<MemberState | null>(null);
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);
  const [adUnlocked, setAdUnlocked] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [unlockMinutesLeft, setUnlockMinutesLeft] = useState(0);
  const rewardCredits = 0;
  const isFormalPro = entitlement?.source === 'user_membership_entitlements' && entitlement.isPro;
  const isUnlocked = isFormalPro || adUnlocked;
  const safeCoreDigits = useMemo(() => {
    if (!isUnlocked) return ['-', '-', '-', '-', '-'];
    if (coreDigits.length >= 5) return coreDigits.slice(0, 5);
    return [...coreDigits, '-', '-', '-', '-', '-'].slice(0, 5);
  }, [coreDigits, isUnlocked]);
  const guideDigits = useMemo(() => safeCoreDigits.filter((digit) => /^\d$/.test(digit)), [safeCoreDigits]);
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
  return (
    <section className="mt-6 flex flex-col gap-6">
      <div className="grid min-w-0 gap-5">
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-950">{labels.appCoreDigitsTitle}</h2>
            <button
              type="button"
              onClick={() => setGuideOpen((current) => !current)}
              aria-expanded={guideOpen}
              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800 hover:bg-blue-100"
            >
              {labels.coreDigitsGuideAction}
            </button>
          </div>
          {guideOpen ? <CoreDigitsGuide digits={guideDigits} labels={labels} /> : null}
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
            <p className="hidden">
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

      </div>
    </section>
  );
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
