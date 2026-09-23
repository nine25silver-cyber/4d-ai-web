import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's built-in TypeScript loader requires the explicit extension.
import {buildGooglePlayUrl, buildWebUrl, resolveDevice} from './app-smart-link.ts';

test('detects Android, including Facebook and Instagram in-app browsers', () => {
  assert.equal(resolveDevice('Mozilla/5.0 (Linux; Android 15) [FB_IAB/FB4A]'), 'android');
  assert.equal(resolveDevice('Mozilla/5.0 (Linux; Android 14) Instagram 370.0'), 'android');
});

test('detects classic iOS and modern iPadOS desktop-class user agents', () => {
  assert.equal(resolveDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'), 'ios');
  assert.equal(
    resolveDevice(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'
    ),
    'ios'
  );
  assert.equal(resolveDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6)'), 'desktop');
});

test('preserves all query parameters and repeated values on the web redirect', () => {
  const target = new URL(
    buildWebUrl({
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'launch',
      utm_content: 'video_a',
      utm_term: '4d ai',
      fbclid: 'fb-123',
      custom: ['one', 'two']
    })
  );

  assert.equal(target.origin, 'https://4dai88.com');
  assert.equal(target.pathname, '/');
  assert.deepEqual(target.searchParams.getAll('custom'), ['one', 'two']);
  assert.equal(target.searchParams.get('utm_content'), 'video_a');
  assert.equal(target.searchParams.get('utm_term'), '4d ai');
  assert.equal(target.searchParams.get('fbclid'), 'fb-123');
});

test('the web target cannot redirect back into /app', () => {
  const target = new URL(buildWebUrl({next: '/app'}));
  assert.equal(target.pathname, '/');
});

test('passes campaign fields through the Google Play referrer', () => {
  const target = new URL(
    buildGooglePlayUrl(
      {
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'launch',
        utm_content: 'story',
        utm_term: 'install',
        fbclid: 'fb-456'
      },
      new Headers()
    )
  );
  const referrer = new URLSearchParams(target.searchParams.get('referrer') ?? '');

  assert.equal(referrer.get('utm_source'), 'instagram');
  assert.equal(referrer.get('utm_medium'), 'social');
  assert.equal(referrer.get('utm_campaign'), 'launch');
  assert.equal(referrer.get('utm_content'), 'story');
  assert.equal(referrer.get('utm_term'), 'install');
  assert.equal(referrer.get('fbclid'), 'fb-456');
});

test('infers Facebook attribution inside its Android in-app browser', () => {
  const headers = new Headers({
    'user-agent': 'Mozilla/5.0 (Linux; Android 15) [FBAN/EMA;FBAV/500.0]'
  });
  const target = new URL(buildGooglePlayUrl({}, headers));
  const referrer = new URLSearchParams(target.searchParams.get('referrer') ?? '');

  assert.equal(referrer.get('utm_source'), 'facebook');
  assert.equal(referrer.get('utm_medium'), 'social');
  assert.equal(referrer.get('utm_campaign'), 'app_link');
});
