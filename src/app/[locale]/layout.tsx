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
  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/brand/web-logo.png" />
        <link rel="apple-touch-icon" href="/brand/web-logo.png" />
      </head>
      <body>
        <NextIntlClientProvider>
          <SiteHeader locale={locale as Locale} />
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
