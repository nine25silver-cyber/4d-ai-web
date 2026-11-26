import assert from 'node:assert/strict';
import {historyDiscovery} from '../src/lib/history-discovery.ts';

// Exercise a running isolated build, never submit an index request or authenticate.
const base = process.env.SEO_SMOKE_BASE ?? 'http://127.0.0.1:3106';
const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://4dai88.com';
const locales = ['en', 'zh', 'ms'];
let checks = 0;
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1].toLowerCase(), m[2]]));
const links = (html) => [...html.matchAll(/<link\b[^>]*>/g)].map((m) => attrs(m[0]));
const main = (html) => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
async function page(path, canonical = path, status = 200) {
  const response = await fetch(base + path, {redirect: 'manual', signal: AbortSignal.timeout(60000)});
  assert.equal(response.status, status, path);
  const html = await response.text();
  if (status === 200) {
    assert.deepEqual(links(html).filter((x) => x.rel === 'canonical').map((x) => x.href), [canonicalBase + canonical], path);
    assert.ok(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html), path);
    const locale = path.split('/')[1];
    assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`), path);
    const rest = canonical.replace(/^\/(en|zh|ms)/, '');
    const alternates = Object.fromEntries(links(html).filter((x) => x.hreflang).map((x) => [x.hreflang, x.href]));
    assert.deepEqual(alternates, Object.fromEntries([...locales.map((l) => [l, `${canonicalBase}/${l}${rest}`]), ['x-default', `${canonicalBase}/en${rest}`]]), path);
  }
  checks++;
  return {response, html};
}
function headerMatches(response, path) {
  const header = response.headers.get('link');
  for (const locale of locales) assert.ok(header?.includes(`<${canonicalBase}/${locale}${path}>; rel="alternate"; hreflang="${locale}"`), path);
  assert.ok(header?.includes(`<${canonicalBase}/en${path}>; rel="alternate"; hreflang="x-default"`), path);
}

const sitemapResponse = await fetch(base + '/sitemap.xml');
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length);
assert.ok(!sitemap.includes('digit-analysis-pro'));
assert.ok(!sitemap.includes('data.4dai88.com'));
for (const locale of locales) {
  for (const path of ['/tools/search', '/history/cambodia', '/history/singapore', '/results/singapore']) assert.ok(!sitemapUrls.includes(`${canonicalBase}/${locale}${path}`), path);
  for (const path of ['/tools/4d-search', '/history/international', '/results/cambodia']) assert.ok(sitemapUrls.includes(`${canonicalBase}/${locale}${path}`), path);
  const search = await page(`/${locale}/tools/4d-search`);
  headerMatches(search.response, '/tools/4d-search');
  const oldSearch = await page(`/${locale}/tools/search`, `/${locale}/tools/4d-search`);
  headerMatches(oldSearch.response, '/tools/4d-search');
  assert.equal(main(search.html), main(oldSearch.html));
  assert.ok(!/Index connection coming soon|Sambungan indeks akan datang/.test(search.html));
  const results = await page(`/${locale}/results/cambodia`);
  const compatibility = await page(`/${locale}/results/singapore`, `/${locale}/results/cambodia`);
  headerMatches(compatibility.response, '/results/cambodia');
  // Request data can change; only compare the unchanged provider set, not timestamps.
  for (const company of ['Singapore 4D', 'Grand Dragon', 'Nine Lotto']) assert.ok(main(results.html).includes(company) && main(compatibility.html).includes(company));
  await page(`/${locale}/history/international`);
  for (const old of ['cambodia', 'singapore']) {
    const alias = await page(`/${locale}/history/${old}`, '', 307);
    assert.equal(alias.response.headers.get('location'), `/${locale}/history/international`);
  }
  const regionBodies = [];
  for (const [region, expected] of [['west-malaysia', 3], ['east-malaysia', 3], ['cambodia', 2], ['singapore', 1]]) {
    const directory = await page(`/${locale}/ai/${region}`);
    headerMatches(directory.response, `/ai/${region}`);
    const content = main(directory.html);
    assert.equal([...content.matchAll(new RegExp(`href="/${locale}/ai/[^/]+/[^"/]+"`, 'g'))].length, expected);
    for (const other of ['west-malaysia', 'east-malaysia', 'cambodia', 'singapore']) assert.ok(content.includes(`href="/${locale}/ai/${other}"`));
    regionBodies.push(content);
  }
  assert.equal(new Set(regionBodies).size, 4);
  for (const entry of historyDiscovery) {
    const prefix = `/${locale}/history/${entry.region}/${entry.provider}`;
    const provider = await page(prefix);
    assert.ok(main(provider.html).includes(`href="${prefix}/archive"`));
    const latestLinks = [...main(provider.html).matchAll(new RegExp(`href="${prefix}/\\d{4}-\\d{2}-\\d{2}"`, 'g'))];
    assert.ok(latestLinks.length <= 30);
    const archive = await page(prefix + '/archive');
    const content = main(archive.html);
    assert.equal([...content.matchAll(new RegExp(`href="${prefix}/\\d{4}-\\d{2}-\\d{2}"`, 'g'))].length, entry.dates.length);
    assert.ok(!/coreDigits|access_token|tracker\.json/.test(content));
    for (const date of entry.dates) {
      assert.ok(content.includes(`href="${prefix}/${date}"`));
      assert.ok(sitemapUrls.includes(canonicalBase + prefix + '/' + date));
      const daily = await page(prefix + '/' + date);
      assert.match(main(daily.html), /\b\d{4}\b/);
      if (date === '2026-05-23' || date === '2026-04-08') {
        assert.ok(!new RegExp(`href="${prefix}/\\d{4}-\\d{2}-\\d{2}"`).test(main(daily.html)), 'old draw navigation must remain latest30-only');
      }
    }
  }
  const digit = await fetch(`${base}/${locale}/tools/digit-analysis-pro`);
  assert.equal(digit.status, 200);
  assert.match(await digit.text(), /<meta name="robots" content="noindex, nofollow"/);
}
const guest = await fetch(base + '/api/digit-analysis-pro');
assert.equal(guest.status, 401);
assert.deepEqual(await guest.json(), {error: 'unauthenticated'});
assert.match(guest.headers.get('cache-control'), /private, no-store/);
const badArchive = await fetch(base + '/en/history/west-malaysia/magnum/archive');
assert.equal(badArchive.status, 404);
console.log(JSON.stringify({result: 'PASS', checkedPages: checks, sitemapUrls: sitemapUrls.length, locales, boundedHistoryDates: 30, anonymousDigitApi: 401}));
