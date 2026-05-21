export const routing = {
  locales: ['en', 'zh', 'ms'],
  defaultLocale: 'en'
} as const;

export type Locale = (typeof routing.locales)[number];
