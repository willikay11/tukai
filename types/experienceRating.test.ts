import {
  ExperienceRating,
  averageRating,
  ratingBreakdown,
  ratingPhotoUrl,
  ratingSummary,
} from './experienceRating';

const rating = (score: number, id = String(score)): ExperienceRating => ({ id, rating: score });

/**
 * Experiences carry no aggregate of their own on either serializer, so the
 * average and the count are worked out here.
 */
describe('averageRating', () => {
  it('averages the scores', () => {
    expect(averageRating([rating(5), rating(4)])).toBe(4.5);
  });

  it('rounds to one decimal', () => {
    expect(averageRating([rating(5), rating(4), rating(4)])).toBe(4.3);
  });

  it('has no answer before anyone has rated it', () => {
    expect(averageRating([])).toBeNull();
  });

  // A review left without a score should not drag the average to zero
  it('ignores a rating of zero', () => {
    expect(averageRating([rating(5), rating(0)])).toBe(5);
  });
});

describe('ratingSummary', () => {
  it('reads the average and the count together', () => {
    expect(ratingSummary([rating(5), rating(4)])).toBe('4.5 · 2 reviews');
  });

  it('counts one review in the singular', () => {
    expect(ratingSummary([rating(5)])).toBe('5 · 1 review');
  });

  it('says nothing when there is nothing to say', () => {
    expect(ratingSummary([])).toBeNull();
  });
});

describe('ratingBreakdown', () => {
  it('counts each score, five first', () => {
    expect(ratingBreakdown([rating(5), rating(5, 'b'), rating(3)])).toEqual([
      { score: 5, count: 2 },
      { score: 4, count: 0 },
      { score: 3, count: 1 },
      { score: 2, count: 0 },
      { score: 1, count: 0 },
    ]);
  });
});

describe('ratingPhotoUrl', () => {
  it('prefers the size asked for', () => {
    const photo = {
      id: 'p1',
      photoWebpThumbUrl: 'thumb.webp',
      photoWebpMdUrl: 'md.webp',
      photo: 'raw.jpg',
    };

    expect(ratingPhotoUrl(photo, 'thumb')).toBe('thumb.webp');
    expect(ratingPhotoUrl(photo, 'md')).toBe('md.webp');
  });

  // Renditions are generated after upload, so a fresh photo has only the original
  it('falls back to the original', () => {
    expect(ratingPhotoUrl({ id: 'p1', photo: 'raw.jpg' })).toBe('raw.jpg');
  });

  it('has nothing to show for an empty photo', () => {
    expect(ratingPhotoUrl({ id: 'p1' })).toBeUndefined();
  });
});
