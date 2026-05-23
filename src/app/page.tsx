import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {routing, type Locale} from '@/i18n/routing';

function resolveLocaleFromAcceptLanguage(raw: string | null): Locale {
  if (!raw) return routing.defaultLocale;
  const normalized = raw.toLowerCase();
  if (normalized.includes('zh')) return 'zh';
  if (normalized.includes('ms') || normalized.includes('malay') || normalized.includes('id')) return 'ms';
  return routing.defaultLocale;
}

export default async function RootPage() {
  const locale = resolveLocaleFromAcceptLanguage((await headers()).get('accept-language'));
  redirect(`/${locale}`);
}
