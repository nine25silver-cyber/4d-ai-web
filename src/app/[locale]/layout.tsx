import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {SiteHeader} from '@/components/SiteHeader';
import {routing, type Locale} from '@/i18n/routing';
import enMessages from '../../../messages/en.json';
import msMessages from '../../../messages/ms.json';
import zhMessages from '../../../messages/zh.json';

const messagesByLocale = {
  en: enMessages,
  ms: msMessages,
  zh: zhMessages
} satisfies Record<Locale, unknown>;

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({children, params}: {children: React.ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const typedLocale = locale as Locale;
  const messages = messagesByLocale[typedLocale];
  const betaNotice =
    locale === 'zh'
      ? '公开测试中：部分功能会持续优化。'
      : locale === 'ms'
        ? 'Beta awam: Sesetengah ciri akan terus ditambah baik.'
        : 'Public beta: Some features may continue to improve.';
  return (
    <html lang={typedLocale}>
      <head>
        <link rel="icon" href="/brand/web-logo.png" />
        <link rel="apple-touch-icon" href="/brand/web-logo.png" />
      </head>
      <body>
        <NextIntlClientProvider locale={typedLocale} messages={messages}>
          <SiteHeader locale={typedLocale} />
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
