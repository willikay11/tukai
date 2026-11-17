'use client';

import { useEffect, useState } from 'react';

/**
 * The app's one shell breakpoint: below 720px is the phone layout.
 *
 * `719.98px` rather than `719px`, so a fractional window width - a zoomed
 * desktop, say - cannot fall in the gap between this and `min-[720px]:`.
 */
export const PHONE_QUERY = '(max-width: 719.98px)';

/** For one-off checks inside an event handler, where a hook cannot go. */
export const isPhoneWidth = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.(PHONE_QUERY).matches === true;

/**
 * Whether the window is phone width, for what CSS cannot switch: an
 * attribute such as a placeholder, or a motion's axis.
 *
 * Layout belongs in `min-[720px]:` classes instead. This reads false on the
 * server and the first client render, so anything it drives appears in its
 * desktop form for a frame on a phone.
 */
export const useIsPhone = (): boolean => {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;

    const media = window.matchMedia(PHONE_QUERY);
    const update = () => setIsPhone(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isPhone;
};
