import Image from 'next/image';
import Link from 'next/link';
import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';

const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.william.ai.malaysia_4d_analysis';

export const metadata: Metadata = {
  title: 'Download 4D AI',
  description: 'Download the 4D AI Android app from Google Play or continue using the 4D AI web version.'
};

export const dynamic = 'force-dynamic';

type DeviceType = 'android' | 'ios' | 'desktop';
type Locale = 'en' | 'zh' | 'ms';

const copy = {
  en: {
    eyebrow: '4D AI App',
    title: 'Download 4D AI',
    subtitle: 'Get 4D AI on Android from Google Play, or continue using the web version.',
    iosComingSoon: 'iOS version coming soon',
    googlePlay: 'Google Play Download',
    continueWeb: 'Continue using web version',
    androidNote: 'Android users are redirected automatically.'
  },
  zh: {
    eyebrow: '4D AI App',
    title: '下载 4D AI',
    subtitle: 'Android 用户可前往 Google Play 下载，也可以继续使用网页版。',
    iosComingSoon: 'iOS 版本即将推出',
    googlePlay: 'Google Play 下载',
    continueWeb: '继续使用网页版',
    androidNote: 'Android 用户会自动跳转。'
  },
  ms: {
    eyebrow: 'Aplikasi 4D AI',
    title: 'Muat Turun 4D AI',
    subtitle: 'Dapatkan 4D AI untuk Android di Google Play, atau terus gunakan versi web.',
    iosComingSoon: 'Versi iOS akan datang',
    googlePlay: 'Muat turun Google Play',
    continueWeb: 'Terus guna versi web',
    androidNote: 'Pengguna Android akan dialihkan secara automatik.'
  }
} satisfies Record<Locale, Record<string, string>>;

function resolveDevice(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';
  if (/\biphone\b|\bipad\b|\bipod\b/.test(ua)) return 'ios';
  return 'desktop';
}

function resolveLocale(acceptLanguage: string): Locale {
  const normalized = acceptLanguage.toLowerCase();
  if (normalized.includes('zh')) return 'zh';
  if (normalized.includes('ms') || normalized.includes('malay') || normalized.includes('id')) return 'ms';
  return 'en';
}

function buildGooglePlayUrl(searchParams: Record<string, string | string[] | undefined>): string {
  const target = new URL(googlePlayUrl);
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string' && value) target.searchParams.set(key, value);
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) target.searchParams.append(key, item);
      }
    }
  }
  return target.toString();
}

export default async function AppDownloadPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  const params = await searchParams;
  const device = resolveDevice(requestHeaders.get('user-agent') ?? '');
  const locale = resolveLocale(requestHeaders.get('accept-language') ?? '');
  const labels = copy[locale];
  const playHref = buildGooglePlayUrl(params);

  if (device === 'android') redirect(playHref);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md flex-col justify-center">
        <div className="rounded border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="flex items-center gap-4">
            <Image src="/brand/app-logo.png" alt="4D AI" width={72} height={72} className="rounded" priority />
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-normal text-slate-700">{labels.eyebrow}</p>
              <h1 className="mt-1 text-3xl font-black leading-tight text-slate-950">{labels.title}</h1>
            </div>
          </div>

          <p className="mt-6 text-base leading-7 text-slate-700">{labels.subtitle}</p>

          <div className="mt-7 rounded border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-800">
            {labels.iosComingSoon}
          </div>

          <div className="mt-7 grid gap-3">
            <a
              href={playHref}
              className="flex min-h-12 items-center justify-center rounded border border-sky-200 bg-sky-100 px-4 py-3 text-center text-base font-bold text-slate-950 hover:bg-sky-200"
            >
              {labels.googlePlay}
            </a>
            <Link
              href={`/${locale}`}
              className="flex min-h-12 items-center justify-center rounded border border-slate-300 bg-white px-4 py-3 text-center text-base font-bold text-slate-900 hover:border-slate-400 hover:bg-slate-50"
            >
              {labels.continueWeb}
            </Link>
          </div>

          {device === 'desktop' ? <p className="mt-5 text-sm text-slate-400">{labels.androidNote}</p> : null}
        </div>
      </section>
    </main>
  );
}
