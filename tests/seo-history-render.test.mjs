import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {writeFileSync, unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import {historyDiscovery} from '../src/lib/history-discovery.ts';
const require = createRequire(import.meta.url);

test('public history directories render only audited links and sitemap submits final canonical URLs', async (t) => {
  const oldUrl = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = 'https://4dai88.com';
  const file = resolve(`.tmp-seo-history-${process.pid}.cjs`);
  t.after(() => {
    unlinkSync(file);
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = oldUrl;
  });
  const result = buildSync({
    stdin: {contents: "export {default as Archive, generateMetadata} from './src/app/[locale]/history/[region]/[provider]/archive/page'; export {default as sitemap} from './src/app/sitemap';", resolveDir: process.cwd(), loader: 'tsx'},
    bundle: true, packages: 'external', platform: 'node', format: 'cjs', jsx: 'automatic', write: false
  });
  writeFileSync(file, result.outputFiles[0].contents);
  const {Archive, generateMetadata, sitemap} = require(file);
  const oldFetch = globalThis.fetch;
  globalThis.fetch = () => {throw Error('The new public directory must not read any upstream or membership data');};
  t.after(() => {globalThis.fetch = oldFetch;});
  const urls = sitemap().map((item) => item.url);
  assert.equal(urls.length, 251);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(!urls.some((url) => /digit-analysis-pro|data\.4dai88\.com/.test(url)));
  for (const locale of ['en', 'zh', 'ms']) {
    for (const path of ['/tools/search', '/results/singapore', '/history/cambodia', '/history/singapore']) assert.ok(!urls.includes(`https://4dai88.com/${locale}${path}`));
    for (const path of ['/tools/4d-search', '/results/cambodia', '/history/international']) assert.ok(urls.includes(`https://4dai88.com/${locale}${path}`));
    for (const entry of historyDiscovery) {
      const params = Promise.resolve({locale, region: entry.region, provider: entry.provider});
      const html = renderToStaticMarkup(await Archive({params}));
      const prefix = `/${locale}/history/${entry.region}/${entry.provider}`;
      assert.equal([...html.matchAll(new RegExp(`href="${prefix}/\\d{4}-\\d{2}-\\d{2}"`, 'g'))].length, entry.dates.length);
      for (const date of entry.dates) {
        assert.ok(html.includes(`href="${prefix}/${date}"`));
        assert.ok(urls.includes(`https://4dai88.com${prefix}/${date}`));
      }
      const metadata = await generateMetadata({params});
      assert.equal(metadata.alternates.canonical, `https://4dai88.com${prefix}/archive`);
      assert.deepEqual(Object.keys(metadata.alternates.languages), ['en', 'zh', 'ms', 'x-default']);
      assert.ok(!/coreDigits|access_token|current_occurrences/.test(html));
    }
  }
  await assert.rejects(Archive({params: Promise.resolve({locale: 'en', region: 'west-malaysia', provider: 'magnum'})}), /NEXT_HTTP_ERROR_FALLBACK;404/);
});
