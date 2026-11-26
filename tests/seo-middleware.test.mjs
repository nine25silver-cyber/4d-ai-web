import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {writeFileSync, unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {NextRequest} from 'next/server.js';
const require = createRequire(import.meta.url);
const locales = ['en', 'zh', 'ms'];

test('real locale middleware emits canonical alternate headers only for audited public routes', async (t) => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = 'https://4dai88.com';
  const file = resolve(`.tmp-seo-middleware-${process.pid}.cjs`);
  t.after(() => {
    unlinkSync(file);
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  });
  const result = buildSync({
    stdin: {contents: "export {default} from './src/middleware'; import createMiddleware from 'next-intl/middleware'; import {routing} from './src/i18n/routing'; export const baseline = createMiddleware(routing);", resolveDir: process.cwd(), loader: 'ts'},
    bundle: true, platform: 'node', format: 'cjs', write: false,
    alias: {'next/server': 'next/server.js'}, external: ['next/server.js']
  });
  writeFileSync(file, result.outputFiles[0].contents);
  const {default: middleware, baseline} = require(file);
  for (const locale of locales) {
    for (const [path, canonical] of [
      ['/tools/search', '/tools/4d-search'], ['/tools/4d-search', '/tools/4d-search'],
      ['/results/singapore', '/results/cambodia'], ['/history/cambodia', '/history/international'],
      ['/history/international', '/history/international'], ['/ai/singapore', '/ai/singapore'],
      ['/history/east-malaysia/sabah88/archive', '/history/east-malaysia/sabah88/archive']
    ]) {
      const req = new NextRequest(`https://www.4dai88.com/${locale}${path}?preserve=1`);
      const response = middleware(req);
      const expected = [...locales.map((language) => `<https://4dai88.com/${language}${canonical}>; rel="alternate"; hreflang="${language}"`), `<https://4dai88.com/en${canonical}>; rel="alternate"; hreflang="x-default"`].join(', ');
      assert.equal(response.headers.get('link'), expected);
      assert.equal(response.status, baseline(req).status, 'SEO fix must not introduce a redirect');
    }
    for (const path of ['/tools/digit-analysis-pro', '/account', '/auth/callback', '/ai/east-malaysia/sabah88', '/tools/hot-cold']) {
      const req = new NextRequest(`https://www.4dai88.com/${locale}${path}`);
      assert.deepEqual([...middleware(req).headers], [...baseline(req).headers], `protected route unchanged: ${path}`);
    }
  }
  const req = new NextRequest('https://4dai88.com/tools/4d-search?preserve=1');
  assert.deepEqual([...middleware(req).headers], [...baseline(req).headers], 'existing locale redirect unchanged');
});
