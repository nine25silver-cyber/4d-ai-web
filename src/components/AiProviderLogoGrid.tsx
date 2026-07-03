import Link from 'next/link';
import type {Locale} from '@/i18n/routing';
import {getProviderDisplayName, type RegionConfig} from '@/lib/providers';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type Props = {
  locale: Locale;
  regions: RegionConfig[];
  title: string;
  text: string;
};

export function AiProviderLogoGrid({locale, regions, title, text}: Props) {
  const providerRows = regions.flatMap((region) => region.providers.map((provider) => ({region, provider})));
  return (
    <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          {text ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{text}</p> : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {providerRows.map(({region, provider}) => (
          <Link key={provider.code} href={`/${locale}/ai/${region.slug}/${provider.code}`} className="min-h-[120px] rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1e3a8a] hover:bg-[#eff6ff]">
            <ProviderLogoBadge provider={provider} sizeClassName="size-12" />
            <span className="mt-3 block text-sm font-black leading-5 text-slate-950">{getProviderDisplayName(provider, locale)}</span>
            <span className="mt-1 block text-xs font-bold text-slate-500">{region.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
