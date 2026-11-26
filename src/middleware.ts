import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import type {NextRequest} from 'next/server';
import {localizedAlternates} from './lib/seo';
import {publicCanonicalPath} from './lib/seo-public-routes';

const handleLocale = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = handleLocale(request);
  const localized = request.nextUrl.pathname.match(/^\/(en|zh|ms)(\/.*)$/);
  const canonical = localized && publicCanonicalPath(localized[2]);
  if (canonical) {
    response.headers.set('Link', Object.entries(localizedAlternates(canonical))
      .map(([language, url]) => `<${url}>; rel="alternate"; hreflang="${language}"`).join(', '));
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|app(?:/|$)|privacy(?:/|$)|terms(?:/|$)|.*\\..*).*)']
};
