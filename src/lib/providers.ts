export type RegionSlug = 'west-malaysia' | 'east-malaysia' | 'cambodia' | 'singapore';

export type ProviderConfig = {
  code: string;
  name: string;
  shortName: string;
};

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
