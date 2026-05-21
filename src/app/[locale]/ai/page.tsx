import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {AiProviderLogoGrid} from '@/components/AiProviderLogoGrid';
import {AiUnlockPanelClient} from '@/components/AiUnlockPanelClient';
import {StructuredData} from '@/components/StructuredData';
import {routing, type Locale} from '@/i18n/routing';
import {regions} from '@/lib/providers';
import {buildMetadata, siteUrl} from '@/lib/seo';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'AI'});
  return buildMetadata({locale, path: '/ai', title: t('metaTitle'), description: t('metaDescription')});
}

export default async function AiPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'AI'});
  const modes = ['nextDraw', 'hotCold', 'backtest'] as const;
  return (
    <main className="container-shell py-10">
      <StructuredData data={{'@context': 'https://schema.org', '@type': 'WebPage', name: t('title'), url: siteUrl(`/${locale}/ai`), about: ['4D AI prediction', '4D number analysis', 'Malaysia 4D']}} />
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-800">4D AI</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{t('title')}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">{t('intro')}</p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {modes.map((mode) => (
          <article key={mode} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase text-blue-800">{t(`${mode}Eyebrow`)}</div>
            <h2 className="mt-2 text-xl font-black text-slate-950">{t(`${mode}Title`)}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t(`${mode}Text`)}</p>
          </article>
        ))}
      </section>

      <AiProviderLogoGrid locale={locale} regions={regions} title={t('providerLogoGridTitle')} text={t('providerLogoGridText')} />

      <AiUnlockPanelClient
        locale={locale}
        title={t('unlockTitle')}
        text={t('unlockText')}
        goPro={t('goPro')}
        watchAd={t('watchAd')}
        unlockedTitle={locale === 'zh' ? '已解锁完整 AI 推荐' : locale === 'ms' ? 'Cadangan AI penuh telah dibuka' : 'Full AI recommendations unlocked'}
        unlockedText={locale === 'zh' ? '当前账号已是 Pro，可直接进入任意 provider 查看完整 AI 推荐与命中详情。' : locale === 'ms' ? 'Akaun semasa ialah Pro. Anda boleh terus buka mana-mana provider untuk lihat cadangan AI penuh dan butiran hit.' : 'Current account is Pro. You can open any provider directly to view full AI recommendations and hit details.'}
      />
    </main>
  );
}

