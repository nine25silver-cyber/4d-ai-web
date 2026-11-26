import test from 'node:test';
import assert from 'node:assert/strict';
import {publicCanonicalPath} from '../src/lib/seo-public-routes.ts';
import {historyDiscovery, getHistoryDiscovery} from '../src/lib/history-discovery.ts';

test('compatibility URLs resolve to the same public canonical route', () => {
  assert.equal(publicCanonicalPath('/tools/search'), '/tools/4d-search');
  assert.equal(publicCanonicalPath('/tools/4d-search'), '/tools/4d-search');
  assert.equal(publicCanonicalPath('/results/singapore'), '/results/cambodia');
  assert.equal(publicCanonicalPath('/history/cambodia'), '/history/international');
  assert.equal(publicCanonicalPath('/history/singapore'), '/history/international');
});

test('protected routes and APIs are outside the SEO header override', () => {
  for (const path of ['/tools/digit-analysis-pro', '/api/digit-analysis-pro', '/account', '/auth/callback', '/ai/east-malaysia/sabah88', '/tools/hot-cold', '/history/east-malaysia/unknown/archive']) {
    assert.equal(publicCanonicalPath(path), undefined, path);
  }
});

test('history discovery is bounded to the 30 distinct audited result dates', () => {
  assert.equal(historyDiscovery.length, 2);
  assert.deepEqual(historyDiscovery.map((entry) => entry.dates.length), [14, 16]);
  for (const entry of historyDiscovery) {
    assert.equal(new Set(entry.dates).size, entry.dates.length);
    assert.deepEqual([...entry.dates].sort().reverse(), entry.dates);
    for (const date of entry.dates) assert.match(date, /^2026-\d{2}-\d{2}$/);
  }
  assert.equal(getHistoryDiscovery('west-malaysia', 'magnum'), undefined);
  assert.equal(getHistoryDiscovery('east-malaysia', '../../api'), undefined);
});
