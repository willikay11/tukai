import type { Metadata } from 'next';

/**
 * The origin links and Open Graph images are resolved against.
 *
 * A crawler fetches a shared link from its own servers, so every URL it reads
 * has to be absolute. `NEXT_PUBLIC_APP_URL` is localhost in development, where
 * no crawler can reach it — that is a property of localhost, not a
 * misconfiguration, and previews can only be checked against a tunnel or a
 * deployed URL.
 */
export const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://tukai.co';

/** For `metadataBase`, which Next uses to make relative metadata URLs absolute. */
export const metadataBase = new URL(APP_ORIGIN);

/** What is being shared. Reads in the share sheet and in the link preview. */
export type ShareKind = 'experience' | 'place' | 'community' | 'bucket list' | 'itinerary';

/**
 * The Open Graph and Twitter block a shared link needs to preview well.
 *
 * The experience page grew one of these first; this is the same shape, so
 * every detail page previews alike rather than each growing its own subset.
 * Built with Next's Metadata API, so the tags are rendered server-side and are
 * there for crawlers that never run our JavaScript.
 */
export const buildShareMetadata = ({
  name,
  description,
  url,
  image,
  keywords,
  isPrivate = false,
}: {
  name: string;
  description?: string;
  url: string;
  image?: string | null;
  keywords?: string[];
  /** Kept out of search results, though the link itself still previews */
  isPrivate?: boolean;
}): Metadata => {
  const title = `Tukai - ${name}`;
  const images = image ? [{ url: image, alt: name }] : [];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tukai',
      type: 'website',
      locale: 'en_KE',
      images,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
    robots: isPrivate ? { index: false, follow: false } : undefined,
  };
};
