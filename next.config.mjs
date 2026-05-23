import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_CLOUDFLARE_LATEST_BASE_URL:
      process.env.NEXT_PUBLIC_CLOUDFLARE_LATEST_BASE_URL ?? 'https://data.4dai88.com/latest/providers',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_CLOUDFLARE_HISTORY_BASE_URL:
      process.env.NEXT_PUBLIC_CLOUDFLARE_HISTORY_BASE_URL ?? 'https://data.4dai88.com/history_test'
  }
};

export default withNextIntl(nextConfig);
