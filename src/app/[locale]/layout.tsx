import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {SiteHeader} from '@/components/SiteHeader';
import {routing, type Locale} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: {children: React.ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const betaNotice =
    locale === 'zh'
      ? 'Beta 测试中：当前网站为公开测试版，功能会持续优化与调整。'
      : locale === 'ms'
        ? 'Beta sedang diuji: laman ini ialah versi ujian awam dan ciri akan terus ditambah baik.'
        : 'Beta testing: this public web version is still being refined and features may change.';
  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/brand/web-logo.png" />
        <link rel="apple-touch-icon" href="/brand/web-logo.png" />
      </head>
      <body>
        <NextIntlClientProvider>
          <SiteHeader locale={locale as Locale} />
          <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
            <div className="container-shell py-2 text-center text-sm font-medium">
              {betaNotice}
            </div>
          </div>
          {children}
          <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-sm text-slate-500">
            <div className="container-shell flex flex-wrap items-center justify-between gap-3">
              <p>© 4D AI. Public result pages are provided for information only.</p>
              <p>Responsible gaming notice applies.</p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
