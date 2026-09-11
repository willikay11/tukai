import { buildShareMetadata } from './share-metadata';

describe('buildShareMetadata', () => {
  const base = { name: 'Karura Night Hike', url: 'https://tukai.co/experiences/karura' };

  it('titles the page and the preview the same way', () => {
    const metadata = buildShareMetadata(base);

    expect(metadata.title).toBe('Tukai - Karura Night Hike');
    expect(metadata.openGraph?.title).toBe('Tukai - Karura Night Hike');
    expect(metadata.twitter?.title).toBe('Tukai - Karura Night Hike');
  });

  it('points the preview at the thing being shared', () => {
    const metadata = buildShareMetadata(base);

    expect(metadata.alternates?.canonical).toBe(base.url);
    expect((metadata.openGraph as { url?: string })?.url).toBe(base.url);
  });

  // A crawler fetches from its own servers, so a large card needs a real image
  it('asks for a large card only when there is an image for it', () => {
    expect(buildShareMetadata({ ...base, image: 'https://cdn/x.jpg' }).twitter?.card).toBe(
      'summary_large_image',
    );
    expect(buildShareMetadata(base).twitter?.card).toBe('summary');
  });

  it('carries the image through to both previews', () => {
    const metadata = buildShareMetadata({ ...base, image: 'https://cdn/x.jpg' });

    expect(metadata.openGraph?.images).toEqual([{ url: 'https://cdn/x.jpg', alt: base.name }]);
    expect(metadata.twitter?.images).toEqual(['https://cdn/x.jpg']);
  });

  // A private list still previews for whoever holds the link; it just should
  // not turn up in search
  it('keeps something private out of the index', () => {
    expect(buildShareMetadata({ ...base, isPrivate: true }).robots).toEqual({
      index: false,
      follow: false,
    });
    expect(buildShareMetadata(base).robots).toBeUndefined();
  });
});
