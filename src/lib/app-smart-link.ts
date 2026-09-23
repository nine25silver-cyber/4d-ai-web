const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.william.ai.malaysia_4d_analysis';
const webUrl = 'https://4dai88.com/';

export type DeviceType = 'android' | 'ios' | 'desktop';
export type SearchParams = Record<string, string | string[] | undefined>;

const campaignParamNames = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid'
] as const;

export function resolveDevice(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';

  const isClassicIos = /\biphone\b|\bipad\b|\bipod\b/.test(ua);
  const isModernIpadOs = ua.includes('macintosh') && ua.includes('mobile');
  if (isClassicIos || isModernIpadOs) return 'ios';

  return 'desktop';
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string' && value) return value;
  if (Array.isArray(value)) return value.find(Boolean);
  return undefined;
}

function appendSearchParams(target: URL, searchParams: SearchParams): void {
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      target.searchParams.append(key, value);
      continue;
    }

    for (const item of value ?? []) {
      target.searchParams.append(key, item);
    }
  }
}

function resolveSocialAttribution(
  searchParams: SearchParams,
  requestHeaders: Headers
): Record<string, string> {
  const campaignParams = Object.fromEntries(
    campaignParamNames.flatMap((name) => {
      const value = firstParam(searchParams[name]);
      return value ? [[name, value]] : [];
    })
  );

  if (campaignParams.utm_source) return campaignParams;

  const referer = (requestHeaders.get('referer') ?? '').toLowerCase();
  const userAgent = (requestHeaders.get('user-agent') ?? '').toLowerCase();
  const fromFacebook =
    referer.includes('facebook.com') ||
    referer.includes('fb.com') ||
    userAgent.includes('fban') ||
    userAgent.includes('fbav') ||
    userAgent.includes('fb_iab');

  if (fromFacebook) {
    return {
      ...campaignParams,
      utm_source: 'facebook',
      utm_medium: campaignParams.utm_medium ?? 'social',
      utm_campaign: campaignParams.utm_campaign ?? 'app_link'
    };
  }

  const fromInstagram = referer.includes('instagram.com') || userAgent.includes('instagram');
  if (fromInstagram) {
    return {
      ...campaignParams,
      utm_source: 'instagram',
      utm_medium: campaignParams.utm_medium ?? 'social',
      utm_campaign: campaignParams.utm_campaign ?? 'app_link'
    };
  }

  return campaignParams;
}

export function buildGooglePlayUrl(
  searchParams: SearchParams,
  requestHeaders: Headers
): string {
  const target = new URL(googlePlayUrl);
  const attribution = resolveSocialAttribution(searchParams, requestHeaders);

  if (Object.keys(attribution).length > 0) {
    target.searchParams.set('referrer', new URLSearchParams(attribution).toString());
  }

  const listing = firstParam(searchParams.listing);
  if (listing) target.searchParams.set('listing', listing);

  return target.toString();
}

export function buildWebUrl(searchParams: SearchParams): string {
  const target = new URL(webUrl);
  appendSearchParams(target, searchParams);
  return target.toString();
}
