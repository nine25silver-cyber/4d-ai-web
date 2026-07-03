export type RegionSlug = 'west-malaysia' | 'east-malaysia' | 'cambodia' | 'singapore';

export type ProviderConfig = {
  code: string;
  name: string;
  shortName: string;
};

type ProviderDisplayLocale = 'en' | 'zh' | 'ms';

export type RegionConfig = {
  slug: RegionSlug;
  label: string;
  seoLabel: string;
  providers: ProviderConfig[];
};

export const regions: RegionConfig[] = [
  {
    slug: 'west-malaysia',
    label: 'West Malaysia',
    seoLabel: 'West Malaysia 4D Results Today',
    providers: [
      {code: 'magnum', name: 'Magnum 4D', shortName: 'Magnum'},
      {code: 'sports_toto', name: 'Sports Toto', shortName: 'Toto'},
      {code: 'da_ma_cai', name: 'Da Ma Cai', shortName: 'DMC'}
    ]
  },
  {
    slug: 'east-malaysia',
    label: 'East Malaysia',
    seoLabel: 'East Malaysia 4D Results Today',
    providers: [
      {code: 'sabah88', name: 'Sabah 88', shortName: 'Sabah 88'},
      {code: 'sarawak', name: 'Sarawak 4D', shortName: 'Sarawak'},
      {code: 'sandakan', name: 'Sandakan 4D', shortName: 'Sandakan'}
    ]
  },
  {
    slug: 'cambodia',
    label: 'Cambodia',
    seoLabel: 'Cambodia 4D Results Today',
    providers: [
      {code: 'grand_dragon', name: 'Grand Dragon Lotto', shortName: 'Grand Dragon'},
      {code: 'nine_lotto', name: 'Nine Lotto', shortName: 'Nine Lotto'}
    ]
  },
  {
    slug: 'singapore',
    label: 'Singapore',
    seoLabel: 'Singapore 4D Results Today',
    providers: [{code: 'singapore', name: 'Singapore 4D', shortName: 'Singapore'}]
  }
];

export function getRegion(slug: string): RegionConfig | undefined {
  return regions.find((region) => region.slug === slug);
}

const providerDisplayNames: Record<string, Partial<Record<ProviderDisplayLocale, {name: string; shortName: string}>>> = {
  magnum: {
    zh: {name: '万能', shortName: '万能'}
  },
  sports_toto: {
    zh: {name: '多多', shortName: '多多'}
  },
  da_ma_cai: {
    zh: {name: '大马彩', shortName: '大马彩'}
  },
  sabah88: {
    zh: {name: '沙巴88', shortName: '沙巴88'}
  },
  sarawak: {
    zh: {name: '砂拉越', shortName: '砂拉越'}
  },
  sandakan: {
    zh: {name: '山打根', shortName: '山打根'}
  },
  grand_dragon: {
    zh: {name: '豪龙', shortName: '豪龙'}
  },
  singapore: {
    zh: {name: '新加坡', shortName: '新加坡'}
  },
  nine_lotto: {
    zh: {name: 'Nine Lotto', shortName: 'Nine Lotto'}
  }
};

export function getProviderDisplayName(provider: ProviderConfig, locale: string): string {
  const translated = providerDisplayNames[provider.code]?.[toProviderDisplayLocale(locale)]?.name;
  return translated ?? provider.name;
}

export function getProviderDisplayShortName(provider: ProviderConfig, locale: string): string {
  const translated = providerDisplayNames[provider.code]?.[toProviderDisplayLocale(locale)]?.shortName;
  return translated ?? provider.shortName;
}

function toProviderDisplayLocale(locale: string): ProviderDisplayLocale {
  if (locale === 'zh' || locale === 'ms') return locale;
  return 'en';
}
