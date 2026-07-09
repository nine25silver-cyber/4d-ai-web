'use client';

import {useEffect, useRef} from 'react';
import {
  canRenderGoogleAdSenseSlot,
  getGoogleAdSenseSlot,
  googleAdSenseConfig,
  type GoogleAdSensePlacement
} from '@/lib/adsense';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdPlaceholderProps = {
  className?: string;
  label?: string;
};

type AdSenseSlotProps = {
  className?: string;
  enabled?: boolean;
  format?: string;
  label?: string;
  placement: GoogleAdSensePlacement;
  responsive?: boolean;
  slot?: string;
};

export function AdPlaceholder({className = '', label = 'Google AdSense placeholder - pending review'}: AdPlaceholderProps) {
  return (
    <div
      className={`flex min-h-[90px] w-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-500 ${className}`}
      aria-label="Google AdSense placeholder"
    >
      {label}
    </div>
  );
}

export function AdSenseSlot({
  className = '',
  enabled = googleAdSenseConfig.enabled,
  format = 'auto',
  label,
  placement,
  responsive = true,
  slot
}: AdSenseSlotProps) {
  const pushedRef = useRef(false);
  const resolvedSlot = slot?.trim() || getGoogleAdSenseSlot(placement);
  const shouldRenderAd = canRenderGoogleAdSenseSlot(resolvedSlot, enabled);

  useEffect(() => {
    if (!shouldRenderAd || pushedRef.current) return;
    if (typeof window === 'undefined') return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      pushedRef.current = true;
    }
  }, [shouldRenderAd]);

  if (!shouldRenderAd || !resolvedSlot) {
    return <AdPlaceholder className={className} label={label} />;
  }

  return (
    <ins
      className={`adsbygoogle block min-h-[90px] w-full ${className}`}
      data-ad-client={googleAdSenseConfig.clientId}
      data-ad-format={format}
      data-ad-slot={resolvedSlot}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}

type GoogleAdBannerProps = Omit<AdSenseSlotProps, 'placement'> & {
  placement?: GoogleAdSensePlacement;
};

export function GoogleAdBanner({placement = 'home', ...props}: GoogleAdBannerProps) {
  return (
    <section className="my-4" aria-label="Google AdSense advertisement">
      <AdSenseSlot placement={placement} {...props} />
    </section>
  );
}
