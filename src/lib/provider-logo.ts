import type {ProviderConfig} from '@/lib/providers';

const providerLogoPathByCode: Record<string, string> = {
  magnum: '/provider-logos/magnum.jpg',
  da_ma_cai: '/provider-logos/da_ma_cai.png',
  sports_toto: '/provider-logos/sports_toto.png',
  nine_lotto: '/provider-logos/nine_lotto.png',
  grand_dragon: '/provider-logos/grand_dragon.jpg',
  singapore: '/provider-logos/singapore.jpg',
  sandakan: '/provider-logos/sandakan.jpg',
  sabah88: '/provider-logos/sabah88.jpg',
  sarawak: '/provider-logos/sarawak.jpg'
};

export function providerLogoPath(providerCode: string): string | null {
  return providerLogoPathByCode[providerCode] ?? null;
}

export function providerLogoFallback(provider: ProviderConfig): string {
  if (provider.code === 'sports_toto') return 'TOTO';
  if (provider.code === 'da_ma_cai') return 'DMC';
  if (provider.code === 'grand_dragon') return 'GD';
  if (provider.code === 'nine_lotto') return 'NL';
  if (provider.code === 'sabah88') return 'S88';
  return provider.shortName.slice(0, 4).toUpperCase();
}
