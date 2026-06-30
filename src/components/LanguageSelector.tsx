'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {routing, type Locale} from '@/i18n/routing';

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

export function LanguageSelector({locale, className = ''}: {locale: Locale; className?: string}) {
  const pathname = usePathname();

  return (
    <div className={`flex h-8 items-center rounded-md border border-[#e4d9b7] bg-white p-0.5 text-xs font-medium ${className}`}>
      {routing.locales.map((item) => (
        <Link
          key={item}
          href={localizedPath(pathname, item)}
          className={`flex h-7 items-center rounded px-2 ${locale === item ? 'bg-[#f0dc9a] text-[#4c3b0b]' : 'bg-transparent text-slate-500 hover:bg-white hover:text-slate-800'}`}
          aria-current={locale === item ? 'page' : undefined}
        >
          {localeLabels[item]}
        </Link>
      ))}
    </div>
  );
}
