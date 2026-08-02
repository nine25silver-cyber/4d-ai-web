import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {AiProviderSwitcher} from '@/components/AiProviderSwitcher';
import {getProviderDisplayName, getRegion, regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) return {};
  const providerName = getProviderDisplayName(provider, locale);
  return buildMetadata({
    locale,
    path: `/tools/three-plus-one-box/${region.slug}/${provider.code}`,
    title: `${providerName} 3D BOX ranking`,
    description: `3D BOX ranking status for ${providerName}.`
  });
}

export default async function ThreePlusOneBoxProviderPage({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}) {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) notFound();

  const aiT = await getTranslations({locale, namespace: 'AI'});
  const toolsT = await getTranslations({locale, namespace: 'Tools'});
  const providerName = getProviderDisplayName(provider, locale);

  return (
    <main className="container-shell pt-2 pb-6">
      <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)] md:items-start">
        <div className="hidden md:block">
          <AiProviderSwitcher
            locale={locale}
            regions={regions}
            currentProviderCode={provider.code}
            title={aiT('providerSwitcherTitle')}
            variant="sidebar"
            basePath="tools/three-plus-one-box"
          />
        </div>
        <div className="min-w-0 space-y-3">
          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">3D BOX</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">{`${providerName} ${toolsT('threeDBoxTitle')}`}</h1>
            <p className="mt-1 text-sm font-bold text-slate-600">{toolsT('threeDBoxIntro')}</p>
          </section>

          <div className="block md:hidden">
            <AiProviderSwitcher
              locale={locale}
              regions={regions}
              currentProviderCode={provider.code}
              title={aiT('providerSwitcherTitle')}
              basePath="tools/three-plus-one-box"
            />
          </div>

          <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
              <p className="text-sm font-black text-slate-950">{toolsT('threeDBoxUnavailableTitle')}</p>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-600">{toolsT('threeDBoxUnavailableText')}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
