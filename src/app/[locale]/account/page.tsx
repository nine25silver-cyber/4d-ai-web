import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';
import {MembershipFlowClient} from '@/components/MembershipFlowClient';

const pageKey = 'Account';
const pagePath = 'account';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: pageKey});
  return {
    ...buildMetadata({locale, path: `/${pagePath}`, title: t('metaTitle'), description: t('metaDescription')}),
    robots: {index: false, follow: true}
  };
}

export default async function InfoPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: pageKey});

  return (
    <main className="container-shell py-6 sm:py-8">
      <section className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">{t('title')}</h1>
      </section>

      <MembershipFlowClient
        variant="account"
        pricingHref={`/${locale}/pricing`}
        labels={{
          panelTitle: t('demoPanelTitle'),
          panelText: t('demoPanelText'),
          statusLabel: t('demoStatusLabel'),
          googleLabel: locale === 'zh' ? 'Google account' : locale === 'ms' ? 'Akaun Google' : 'Google account',
          membershipLabel: t('membershipTitle'),
          loggedOut: t('demoLoggedOut'),
          loggedIn: t('demoLoggedIn'),
          freePlan: t('demoFreePlan'),
          proPlan: t('demoProPlan'),
          login: t('demoLogin'),
          logout: t('demoLogout'),
          activatePro: t('demoActivatePro'),
          switchFree: t('demoSwitchFree'),
          managePro: t('pricingCta'),
          syncWarningPrefix: t('syncWarningPrefix'),
          syncWarningFallback: t('syncWarningFallback')
        }}
      />
    </main>
  );
}
