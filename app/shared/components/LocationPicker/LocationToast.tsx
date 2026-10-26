'use client';

import { useLocation } from '@/context/LocationContext';

/**
 * The one-line confirmation after a location or city change - "Location on.
 * Closest first, around Westlands.", say. Mounted once, globally: the chip
 * that triggers it lives in two places at once (mobile and desktop headers),
 * and the toast itself must outlast either one closing its popover.
 */
export const LocationToast = () => {
  const { locationToast } = useLocation();

  if (!locationToast) return null;

  return (
    <div
      role="status"
      className="fixed bottom-[26px] left-1/2 z-[98] w-max max-w-[min(560px,calc(100vw-32px))] -translate-x-1/2 rounded-full bg-brand-ink px-[22px] py-3.5 text-center text-sm leading-snug text-white shadow-[0_14px_34px_rgba(1,51,52,.3)] max-[719.98px]:bottom-[calc(84px+env(safe-area-inset-bottom))]"
    >
      {locationToast}
    </div>
  );
};
