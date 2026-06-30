import type {Locale} from '@/i18n/routing';
import type {RegionConfig} from '@/lib/providers';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type Props = {
  locale: Locale;
  regions: RegionConfig[];
  currentProviderCode: string;
  title: string;
};

export function AiProviderSwitcher({locale, regions, currentProviderCode, title}: Props) {
  const providerRows = regions.flatMap((region) => region.providers.map((provider) => ({region, provider})));
  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-9">
        {providerRows.map(({region, provider}) => {
          const active = provider.code === currentProviderCode;
          return (
            <a
              key={provider.code}
              href={`/${locale}/ai/${region.slug}/${provider.code}`}
              className={`rounded-lg border px-2 py-2 text-center transition ${
                active
                  ? 'border-[#1e3a8a] bg-[#eff6ff]'
                  : 'border-slate-200 bg-white hover:border-[#1e3a8a] hover:bg-[#eff6ff]'
              }`}
            >
              <span className="mx-auto block">
                <ProviderLogoBadge provider={provider} sizeClassName="size-9" active={active} />
              </span>
              <span className="mt-1.5 block truncate text-xs font-black text-slate-900">{provider.shortName}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
