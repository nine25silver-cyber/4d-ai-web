'use client';

import Link from 'next/link';
import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import {canAccessAiCore, getCurrentUserEntitlement, isPaidProEntitlement, isTrialEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';
import {initMemberState, loginUser, readMemberState, subscribeMemberState, type MemberState} from '@/lib/member-state';
import {
  grantRewardedAdAccess,
  getFeatureUnlockRemainingMinutes,
  isFeatureUnlockedNow,
  REWARD_AD_ACCESS_MINUTES,
  type RewardFeature,
  subscribeRewardState,
} from '@/lib/reward-unlock';

type Props = {
  locale: Locale;
  feature: Extract<RewardFeature, 'ad_access_3d' | 'ad_access_4d'>;
  adLabel: '3D' | '4D';
  lockedText: string;
  children: ReactNode;
};

export function AdAccessGateClient({locale, feature, adLabel, lockedText, children}: Props) {
  const [memberState, setMemberState] = useState<MemberState | null>(null);
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);
  const [adUnlocked, setAdUnlocked] = useState(false);
  const [unlockMinutesLeft, setUnlockMinutesLeft] = useState(0);
  const [adNotice, setAdNotice] = useState<string | null>(null);

  const memberAccess = canAccessAiCore(entitlement);
  const canUseFeature = memberAccess || adUnlocked;
  const canShowAdAction = !entitlementLoading && !canUseFeature;
  const canSimulateRewardedAd = process.env.NODE_ENV === 'development';
  const accessBadgeText = isPaidProEntitlement(entitlement)
    ? (locale === 'zh' ? 'Pro 已激活' : locale === 'ms' ? 'Pro aktif' : 'Pro active')
    : isTrialEntitlement(entitlement)
      ? (locale === 'zh' ? 'Trial 已激活' : locale === 'ms' ? 'Trial aktif' : 'Trial active')
      : (locale === 'zh' ? '广告临时解锁' : locale === 'ms' ? 'Buka sementara melalui iklan' : 'Temporary ad unlock');

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
      setAdUnlocked(isFeatureUnlockedNow(feature));
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes(feature));
    };
    update();
    return subscribeRewardState(() => {
      setAdUnlocked(isFeatureUnlockedNow(feature));
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes(feature));
    });
  }, [feature]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAdUnlocked(isFeatureUnlockedNow(feature));
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes(feature));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [feature]);

  function unlockByRewardedAd() {
    if (!canSimulateRewardedAd) {
      setAdNotice(locale === 'zh' ? '广告功能即将开放。' : locale === 'ms' ? 'Fungsi iklan akan tersedia tidak lama lagi.' : 'Ad access is coming soon.');
      return;
    }
    grantRewardedAdAccess(feature);
    setAdUnlocked(true);
    setUnlockMinutesLeft(REWARD_AD_ACCESS_MINUTES);
    setAdNotice(locale === 'zh' ? 'Development 测试广告已模拟完成。' : locale === 'ms' ? 'Iklan ujian Development telah disimulasikan.' : 'Development test ad reward simulated.');
  }

  return (
    <section className="grid gap-3">
      <div className={`rounded-lg border px-4 py-3 shadow-sm ${canUseFeature ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm font-bold ${canUseFeature ? 'text-blue-900' : 'text-amber-900'}`}>
              {canUseFeature
                ? (locale === 'zh' ? '当前已解锁，可直接使用' : locale === 'ms' ? 'Akses sudah dibuka dan sedia digunakan' : 'Currently unlocked and ready to use')
                : entitlementLoading
                  ? (locale === 'zh' ? '正在确认会员权限。' : locale === 'ms' ? 'Sedang menyemak akses ahli.' : 'Checking membership access.')
                  : lockedText}
            </p>
            <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold ${canUseFeature ? 'text-blue-800' : 'text-amber-800'}`}>
              {canUseFeature ? <span>{accessBadgeText}</span> : null}
              {unlockMinutesLeft > 0 ? (
                <span>
                  {locale === 'zh'
                    ? `本次广告解锁剩余：约 ${unlockMinutesLeft} 分钟`
                    : locale === 'ms'
                      ? `Baki buka kunci iklan: kira-kira ${unlockMinutesLeft} minit`
                      : `Ad unlock remaining: about ${unlockMinutesLeft} minutes`}
                </span>
              ) : null}
            </div>
            {adNotice ? <p className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900">{adNotice}</p> : null}
          </div>
          {canShowAdAction ? (
            <div className="flex flex-wrap gap-2">
              {!memberState?.loggedIn ? (
                <button type="button" onClick={() => void loginUser(locale)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100">
                  {locale === 'zh' ? '立即登录' : locale === 'ms' ? 'Log masuk' : 'Login now'}
                </button>
              ) : null}
              <button type="button" onClick={unlockByRewardedAd} className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-100">
                {canSimulateRewardedAd
                  ? (locale === 'zh' ? `Development 测试 ${adLabel} 广告解锁 3 小时` : locale === 'ms' ? `Uji iklan ${adLabel} Development & buka 3 jam` : `Development test ${adLabel} ad unlock for 3 hours`)
                  : (locale === 'zh' ? '广告功能即将开放' : locale === 'ms' ? 'Fungsi iklan akan tersedia' : 'Ad access coming soon')}
              </button>
              <Link href={`/${locale}/pricing`} className="rounded-md bg-blue-800 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-900">
                {locale === 'zh' ? '升级 Pro' : locale === 'ms' ? 'Upgrade Pro' : 'Upgrade Pro'}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
      {canUseFeature ? children : null}
    </section>
  );
}
