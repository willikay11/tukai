import type { Metadata } from 'next';

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
