import type {Locale} from '@/i18n/routing';
import {getProviderDisplayShortName, type RegionConfig} from '@/lib/providers';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type Props = {
  locale: Locale;
  regions: RegionConfig[];
  currentProviderCode: string;
  title: string;
  variant?: 'compact' | 'sidebar';
  basePath?: string;
};

export function AiProviderSwitcher({locale, regions, currentProviderCode, title, variant = 'compact', basePath = 'ai'}: Props) {
  const providerRows = regions.flatMap((region) => region.providers.map((provider) => ({region, provider})));
  const isSidebar = variant === 'sidebar';
  const normalizedBasePath = basePath.replace(/^\/|\/$/g, '');
  return (
    <section className={`${isSidebar ? 'rounded-lg border border-slate-200 bg-white p-2 shadow-sm' : 'mt-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm'}`}>
      <div className={`${isSidebar ? 'mb-2' : 'mb-1.5'} flex items-center justify-between gap-2`}>
        <h2 className="text-sm font-black text-slate-950">{title}</h2>
      </div>
      <div className={isSidebar ? 'grid gap-1.5' : 'grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-9'}>
        {providerRows.map(({region, provider}) => {
          const active = provider.code === currentProviderCode;
          return (
            <a
              key={provider.code}
              href={`/${locale}/${normalizedBasePath}/${region.slug}/${provider.code}`}
              className={`${isSidebar ? 'flex items-center gap-2 px-2 py-1.5 text-left' : 'px-1.5 py-1 text-center'} rounded-md border transition ${
                active
                  ? 'border-[#1e3a8a] bg-[#eff6ff]'
                  : 'border-slate-200 bg-white hover:border-[#1e3a8a] hover:bg-[#eff6ff]'
              }`}
            >
              <span className={isSidebar ? 'block shrink-0' : 'mx-auto block'}>
                <ProviderLogoBadge provider={provider} sizeClassName={isSidebar ? 'size-8' : 'size-9'} active={active} />
              </span>
              <span className={`${isSidebar ? 'min-w-0 text-xs leading-4' : 'mt-0.5 block truncate text-[11px] leading-3'} font-black text-slate-900`}>
                {getProviderDisplayShortName(provider, locale)}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
