'use client';

import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {routing, type Locale} from '@/i18n/routing';
import {HeaderAccountActions} from '@/components/HeaderAccountActions';

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  zh: '中',
  ms: 'MY'
};

function localizedPath(pathname: string, locale: Locale) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && routing.locales.includes(segments[0] as Locale)) {
    segments[0] = locale;
    return `/${segments.join('/')}`;
  }
  return `/${locale}${pathname === '/' ? '' : pathname}`;
}

export function SiteHeader({locale}: {locale: Locale}) {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const base = `/${locale}`;
  const nav = [
    {href: `${base}/results/west-malaysia`, label: t('results')},
    {href: `${base}/history`, label: t('history')},
    {href: `${base}/ai`, label: t('ai')},
    {href: `${base}/tools`, label: t('tools')},
    {href: `${base}/pricing`, label: t('pricing')}
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-[#2b2b2b] bg-black/95 backdrop-blur">
      <div className="container-shell grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-2 md:grid-cols-[auto_1fr_auto]">
        <div className="flex min-w-0 shrink-0 items-center">
          <Link href={`${base}/account`} className="flex min-w-0 shrink-0 items-center font-black text-white">
            <span className="relative block h-14 w-[150px] overflow-hidden sm:w-[220px] lg:w-[280px]">
              <Image
                src="/brand/web-logo-horizontal.png"
                alt="4D AI Malaysia Results"
                fill
                sizes="(min-width: 1024px) 280px, (min-width: 640px) 220px, 150px"
                className="object-contain object-left"
                priority
              />
            </span>
          </Link>
        </div>
        <nav className="relative z-10 col-span-2 flex min-w-0 items-center justify-start gap-1 overflow-x-auto text-sm font-semibold text-white md:col-span-1 md:justify-center md:text-base">
          {nav.map((item) => <Link key={item.href} href={item.href} className="relative z-10 shrink-0 rounded px-3 py-2 hover:bg-white/10">{item.label}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center justify-self-end">
          <HeaderAccountActions
            locale={locale}
            labels={{
              login: t('login'),
              logout: t('logout'),
              goPro: t('goPro'),
              account: t('account'),
              proBadge: t('proBadge')
            }}
          />
        </div>
      </div>
    </header>
  );
}
