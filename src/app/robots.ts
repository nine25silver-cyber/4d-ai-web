import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/en/account', '/zh/account', '/ms/account', '/en/auth/', '/zh/auth/', '/ms/auth/']
    },
    sitemap: siteUrl('/sitemap.xml')
  };
}
