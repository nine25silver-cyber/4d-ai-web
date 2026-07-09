export const googleAdSenseClientId = 'ca-pub-2990166380936491';

const enabledValue = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED;

export const googleAdSenseConfig = {
  clientId: googleAdSenseClientId,
  enabled: enabledValue === 'true',
  isProduction: process.env.NODE_ENV === 'production',
  slots: {
    home: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_HOME_SLOT,
    history: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_HISTORY_SLOT
  }
} as const;

export type GoogleAdSensePlacement = keyof typeof googleAdSenseConfig.slots;

export function getGoogleAdSenseSlot(placement: GoogleAdSensePlacement) {
  return googleAdSenseConfig.slots[placement]?.trim() || undefined;
}

export function canRenderGoogleAdSenseSlot(slot?: string, enabled = googleAdSenseConfig.enabled) {
  return enabled && googleAdSenseConfig.isProduction && Boolean(slot);
}
