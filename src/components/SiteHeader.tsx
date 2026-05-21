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
      <div className="container-shell relative flex min-h-16 flex-nowrap items-center justify-between gap-3 py-2">
        <div className="ml-20 flex shrink-0 items-center gap-4">
          <Link href={base} className="shrink-0 flex items-center font-black text-white">
            <span className="relative block h-14 w-[470px] overflow-hidden">
              <Image
                src="/brand/web-logo-horizontal.png"
                alt="4D AI Malaysia Results"
                fill
                sizes="470px"
                className="object-contain object-left"
                priority
              />
            </span>
          </Link>
        </div>
        <nav className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 text-base font-semibold text-white">
          {nav.map((item) => <Link key={item.href} href={item.href} className="pointer-events-auto rounded px-3 py-2 hover:bg-white/10">{item.label}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex rounded-md border border-[#d8c68d] bg-[#f8f3df] p-1 text-xs font-bold">
            {routing.locales.map((item) => (
              <Link key={item} href={localizedPath(pathname, item)} className={`rounded px-2 py-1 ${item === locale ? 'border border-[#f8e7bb] bg-[#ebc978] text-white' : 'text-[#1f2b44] hover:bg-[#efe6c8]'}`}>
                {localeLabels[item]}
              </Link>
            ))}
          </div>
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
