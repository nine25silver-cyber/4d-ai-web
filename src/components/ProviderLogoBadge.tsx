import Image from 'next/image';
import type {ProviderConfig} from '@/lib/providers';
import {providerLogoFallback, providerLogoPath} from '@/lib/provider-logo';

type Props = {
  provider: ProviderConfig;
  sizeClassName?: string;
  active?: boolean;
};

export function ProviderLogoBadge({provider, sizeClassName = 'size-10', active = false}: Props) {
  const logoPath = providerLogoPath(provider.code);
  if (!logoPath) {
    return (
      <span className={`grid ${sizeClassName} place-items-center rounded-md text-sm font-black ${active ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-700'}`}>
        {providerLogoFallback(provider)}
      </span>
    );
  }

  return (
    <span className={`relative block overflow-hidden rounded-md border ${active ? 'border-[#1e3a8a]' : 'border-slate-200'} ${sizeClassName}`}>
      <Image src={logoPath} alt={provider.name} fill sizes="48px" className="object-cover" />
    </span>
  );
}

