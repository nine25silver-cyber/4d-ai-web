'use client';

import Link from 'next/link';

type Props = {
  locale: string;
  locked: boolean;
  credits: number;
  minutesLeft: number;
  onLogin?: () => void;
  onUnlock: () => void;
  showLogin: boolean;
  proHref: string;
  lockedText: string;
};

export function FeatureAccessStatusBar({
  locale,
  locked,
  credits,
  minutesLeft,
  onLogin,
  onUnlock,
  showLogin,
  proHref,
  lockedText
}: Props) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${locked ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
      <p className={`text-sm font-bold ${locked ? 'text-amber-900' : 'text-blue-900'}`}>
        {locked
          ? lockedText
          : (locale === 'zh' ? '当前已解锁，可直接使用。' : locale === 'ms' ? 'Kini sudah dibuka, boleh digunakan terus.' : 'Currently unlocked and ready to use.')}
      </p>
      <p className={`mt-1 text-xs font-bold ${locked ? 'text-amber-800' : 'text-blue-800'}`}>
        {locale === 'zh'
          ? `可用广告解锁次数：${credits}`
          : locale === 'ms'
            ? `Kredit buka iklan tersedia: ${credits}`
            : `Available rewarded unlock credits: ${credits}`}
      </p>
      {minutesLeft > 0 ? (
        <p className="mt-1 text-xs font-bold text-blue-800">
          {locale === 'zh'
            ? `本次广告解锁剩余：约 ${minutesLeft} 分钟`
            : locale === 'ms'
              ? `Baki buka kunci iklan: kira-kira ${minutesLeft} minit`
              : `Ad unlock remaining: about ${minutesLeft} minutes`}
        </p>
      ) : null}
      {locked ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {showLogin && onLogin ? (
            <button type="button" onClick={onLogin} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
              {locale === 'zh' ? '立即登录' : locale === 'ms' ? 'Log masuk' : 'Login now'}
            </button>
          ) : null}
          <button type="button" onClick={onUnlock} className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-black text-amber-900 hover:bg-amber-100">
            {locale === 'zh' ? '观看广告并解锁30分钟' : locale === 'ms' ? 'Tonton iklan & buka 30 minit' : 'Watch ad and unlock for 30 minutes'}
          </button>
          <Link href={proHref} className="rounded-md bg-blue-800 px-4 py-2 text-sm font-black text-white hover:bg-blue-900">
            {locale === 'zh' ? '升级 Pro' : locale === 'ms' ? 'Upgrade Pro' : 'Upgrade Pro'}
          </Link>
        </div>
      ) : (
        <div className="mt-3 inline-flex rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-black text-blue-800">
          {locale === 'zh' ? 'Pro 已激活' : locale === 'ms' ? 'Pro aktif' : 'Pro active'}
        </div>
      )}
    </div>
  );
}
