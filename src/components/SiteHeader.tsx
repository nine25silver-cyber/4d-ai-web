'use client';

import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {useEffect, useRef, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import {HeaderAccountActions} from '@/components/HeaderAccountActions';
import {LanguageSelector} from '@/components/LanguageSelector';
import {providerPayoutPages} from '@/lib/provider-payouts';

export function SiteHeader({locale}: {locale: Locale}) {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const base = `/${locale}`;
  const moreMenuId = 'more-navigation-menu';
  const nav = [
    {href: `${base}/results/west-malaysia`, label: t('results')},
    {href: `${base}/history`, label: t('history')},
    {href: `${base}/ai/west-malaysia/magnum`, label: t('ai')},
    {href: `${base}/tools`, label: t('tools')},
    {href: `${base}/pricing`, label: t('pricing')}
  ];
  const moreLinks = [
    {href: `${base}/about`, label: t('about')},
    {href: `${base}/faq`, label: t('faq')},
    ...providerPayoutPages.map((page) => ({href: `${base}/providers/${page.slug}`, label: page.menuLabel[locale]}))
  ];
  const moreActive = pathname === `${base}/about` || pathname === `${base}/faq` || pathname?.startsWith(`${base}/providers/`);

  useEffect(() => {
    if (!moreOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMoreOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

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
        <nav className="relative z-10 col-span-2 flex min-w-0 flex-wrap items-center justify-start gap-1 overflow-visible text-sm font-semibold text-white md:col-span-1 md:justify-center md:text-base">
          {nav.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return <Link key={item.href} href={item.href} className={`relative z-10 shrink-0 rounded px-3 py-2 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 ${active ? 'bg-white/15 text-white' : ''}`}>{item.label}</Link>;
          })}
          <div ref={moreRef} className="relative z-20 shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              aria-controls={moreMenuId}
              onClick={() => setMoreOpen((open) => !open)}
              className={`rounded px-3 py-2 font-semibold text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 ${moreActive ? 'bg-white/15' : ''}`}
            >
              {t('more')}
            </button>
            {moreOpen ? (
              <div id={moreMenuId} className="fixed left-4 right-4 top-[74px] z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm shadow-xl md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:min-w-[300px] md:max-w-[calc(100vw-2rem)]">
                <Link href={`${base}/about`} onClick={() => setMoreOpen(false)} className="block rounded-md px-3 py-2 font-bold text-white outline-none hover:bg-white/10 focus-visible:bg-white/10">
                  {t('about')}
                </Link>
                <Link href={`${base}/faq`} onClick={() => setMoreOpen(false)} className={`block rounded-md px-3 py-2 font-bold outline-none hover:bg-white/10 focus-visible:bg-white/10 ${pathname === `${base}/faq` ? 'bg-white/15 text-white' : 'text-white'}`}>
                  {t('faq')}
                </Link>
                <div className="my-2 border-t border-slate-700 pt-2">
                  <p className="px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-400">{t('providerPayoutStructure')}</p>
                  <div className="mt-1">
                    {moreLinks.slice(2).map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className={`block w-full rounded-md px-3 py-2 font-bold leading-5 outline-none hover:bg-white/10 focus-visible:bg-white/10 ${pathname === item.href ? 'bg-white/15 text-white' : 'text-slate-100'}`}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <LanguageSelector locale={locale} className="ml-auto shrink-0 md:hidden" />
        </nav>
        <div className="flex shrink-0 items-center gap-2 justify-self-end">
          <LanguageSelector locale={locale} className="hidden md:flex" />
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
