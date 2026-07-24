import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {routing, type Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';
import {providerPayoutPages} from '@/lib/provider-payouts';

type AboutSection = {
  title: string;
  body: string;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'About'});
  return buildMetadata({locale, path: '/about', title: t('metaTitle'), description: t('metaDescription')});
}

export default async function AboutPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'About'});
  const sections = t.raw('sections') as AboutSection[];

  return (
    <main className="container-shell py-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-800">{t('eyebrow')}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{t('title')}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{t('intro')}</p>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>

        <aside className="h-fit space-y-5">
          <section className="rounded-lg border border-blue-100 bg-blue-50 p-5">
            <h2 className="text-lg font-black text-blue-950">{t('responsibleGamingTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-blue-950">{t('responsibleGamingIntro')}</p>
            <Link href={`/${locale}/responsible-gaming`} className="mt-4 inline-flex rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-800 hover:border-blue-300 hover:text-blue-950">
              {t('responsibleGamingLink')}
            </Link>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">{t('providerLinksTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t('providerLinksIntro')}</p>
            <div className="mt-4 space-y-2">
              {providerPayoutPages.map((page) => (
                <Link key={page.slug} href={`/${locale}/providers/${page.slug}`} className="block rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-900">
                  {page.menuLabel[locale]}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
