import { Moment, isRenderablePhoto, momentPhotos } from '@/types/moment';

const asMoment = (media: unknown[]) => ({ media }) as unknown as Moment;

describe('isRenderablePhoto', () => {
  // next/image reads .default off a non-string src, which throws
  it('rejects null and undefined', () => {
    expect(isRenderablePhoto(null)).toBe(false);
    expect(isRenderablePhoto(undefined)).toBe(false);
  });

  it('rejects empty and whitespace-only strings', () => {
    expect(isRenderablePhoto('')).toBe(false);
    expect(isRenderablePhoto('   ')).toBe(false);
  });

  // next/image throws on a relative path with no leading slash
  it('rejects a relative path without a leading slash', () => {
    expect(isRenderablePhoto('uploads/a.jpg')).toBe(false);
  });

  it('accepts absolute URLs and root-relative paths', () => {
    expect(isRenderablePhoto('https://cdn.tukai.co/a.jpg')).toBe(true);
    expect(isRenderablePhoto('http://cdn.tukai.co/a.jpg')).toBe(true);
    expect(isRenderablePhoto('/images/a.jpg')).toBe(true);
  });
});

describe('momentPhotos', () => {
  it('drops media that cannot be rendered', () => {
    const result = momentPhotos(
      asMoment([
        { id: 'video', photo: null },
        { id: 'ok', photo: 'https://cdn.tukai.co/a.jpg' },
        { id: 'relative', photo: 'uploads/b.jpg' },
      ]),
    );

    expect(result.map((media) => media.id)).toEqual(['ok']);
  });

  it('returns empty for a moment whose only media is a video', () => {
    expect(momentPhotos(asMoment([{ id: 'v', photo: null }]))).toEqual([]);
  });

  it('handles missing and empty media arrays', () => {
    expect(momentPhotos(asMoment([]))).toEqual([]);
    expect(momentPhotos({ media: undefined } as unknown as Moment)).toEqual([]);
  });
});
