import { useEffect, useState } from 'react';

import { qrDataUrl } from './qr';

/** Renders a link as a scannable code, once per link. */
export const useQrDataUrl = (link: string): string | undefined => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setSrc(undefined);

    qrDataUrl(link).then((url) => {
      if (!cancelled) setSrc(url);
    });

    return () => {
      cancelled = true;
    };
  }, [link]);

  return src;
};
