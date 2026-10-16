import type { MetadataRoute } from 'next';

import { APP_ORIGIN } from '@/utils/share-metadata';

// eslint-disable-next-line import/no-default-export -- Next's robots.ts file convention requires one
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Signed-in-only or personal: nothing here is the same page twice,
        // let alone worth a crawl budget
        '/auth/',
        '/control-center/',
        '/inbox/',
        '/profile/',
        '/plans/',
        // A transient receipt keyed by a one-off reference, not a page
        '/experiences/booking-success',
      ],
    },
    sitemap: `${APP_ORIGIN}/sitemap.xml`,
  };
}
