import { Photo, coverPhotoUrl, photoUrl } from './photo';

const make = (overrides: Partial<Photo> = {}): Photo =>
  ({
    id: 'p1',
    mediaType: 'photo',
    photo: 'https://cdn.tukai.co/original.webp',
    photoUrl: 'https://cdn.tukai.co/original.webp',
    photoWebpLgUrl: null,
    photoWebpMdUrl: null,
    photoWebpThumbUrl: null,
    ...overrides,
  }) as Photo;

describe('photoUrl', () => {
  const full = make({
    photoWebpLgUrl: 'https://cdn.tukai.co/lg.webp',
    photoWebpMdUrl: 'https://cdn.tukai.co/md.webp',
    photoWebpThumbUrl: 'https://cdn.tukai.co/thumb.webp',
  });

  it('serves each size from its own rendition when they exist', () => {
    expect(photoUrl(full, 'thumb')).toBe('https://cdn.tukai.co/thumb.webp');
    expect(photoUrl(full, 'md')).toBe('https://cdn.tukai.co/md.webp');
    expect(photoUrl(full, 'lg')).toBe('https://cdn.tukai.co/lg.webp');
  });

  it('asks for the card size by default', () => {
    expect(photoUrl(full)).toBe('https://cdn.tukai.co/md.webp');
  });

  // Most of the library predates the renditions: every field but the original
  // comes back null, and the card still has to render
  it('falls back to the original when nothing has been rendered yet', () => {
    expect(photoUrl(make(), 'thumb')).toBe('https://cdn.tukai.co/original.webp');
    expect(photoUrl(make(), 'lg')).toBe('https://cdn.tukai.co/original.webp');
  });

  it('steps up, never down — a card takes the large file over the thumbnail', () => {
    const thumbOnly = make({ photo: undefined, photoUrl: undefined });
    expect(photoUrl({ ...thumbOnly, photoWebpLgUrl: 'lg' }, 'md')).toBe('lg');

    // Nothing bigger exists, so md has nothing to serve rather than a blur
    expect(photoUrl({ ...thumbOnly, photoWebpThumbUrl: 'thumb' }, 'md')).toBeUndefined();
    expect(photoUrl({ ...thumbOnly, photoWebpThumbUrl: 'thumb' }, 'thumb')).toBe('thumb');
  });

  it('treats an empty string as no photo', () => {
    expect(photoUrl(make({ photo: '', photoUrl: '' }))).toBeUndefined();
    expect(photoUrl(null)).toBeUndefined();
    expect(photoUrl(undefined)).toBeUndefined();
  });
});

describe('coverPhotoUrl', () => {
  it('prefers the photo flagged as the cover', () => {
    const photos = [
      make({ id: 'a', photo: 'a.webp', photoUrl: 'a.webp' }),
      make({ id: 'b', photo: 'b.webp', photoUrl: 'b.webp', isCover: true }),
    ];

    expect(coverPhotoUrl(photos)).toBe('b.webp');
  });

  // A set whose photos carry no flag used to render nothing at all
  it('falls back to the first when none is flagged', () => {
    const photos = [
      make({ photo: 'a.webp', photoUrl: 'a.webp' }),
      make({ photo: 'b.webp', photoUrl: 'b.webp' }),
    ];

    expect(coverPhotoUrl(photos)).toBe('a.webp');
  });

  it('reads the cover at the size asked for', () => {
    const photos = [make({ isCover: true, photoWebpThumbUrl: 'thumb.webp' })];

    expect(coverPhotoUrl(photos, 'thumb')).toBe('thumb.webp');
  });

  it('has nothing to show for an empty or missing set', () => {
    expect(coverPhotoUrl([])).toBeUndefined();
    expect(coverPhotoUrl(undefined)).toBeUndefined();
  });
});
