import { ExperienceRating } from '@/types/experienceRating';

import { canOfferReviewForm, hasEnded, ownReview } from './review-eligibility';

const NOW = new Date('2026-09-30T12:00:00Z').getTime();

const mine: ExperienceRating = { id: 'r1', rating: 5, attendee: { id: 'me' } };
const theirs: ExperienceRating = { id: 'r2', rating: 4, attendee: { id: 'someone' } };

describe('hasEnded', () => {
  it('is true once the end has passed', () => {
    expect(hasEnded('2026-09-29T12:00:00Z', NOW)).toBe(true);
  });

  it('is false while it is still to come', () => {
    expect(hasEnded('2026-10-05T12:00:00Z', NOW)).toBe(false);
  });

  // An experience with no end date is not one we can say has ended
  it('is false without an end date', () => {
    expect(hasEnded(null, NOW)).toBe(false);
    expect(hasEnded(undefined, NOW)).toBe(false);
  });

  it('is false on a date it cannot read', () => {
    expect(hasEnded('not a date', NOW)).toBe(false);
  });
});

describe('ownReview', () => {
  it('finds the review left by the reader', () => {
    expect(ownReview([theirs, mine], 'me')?.id).toBe('r1');
  });

  it('finds nothing for someone who has not reviewed it', () => {
    expect(ownReview([theirs], 'me')).toBeUndefined();
  });

  it('finds nothing when nobody is signed in', () => {
    expect(ownReview([mine], undefined)).toBeUndefined();
  });
});

/**
 * The API is the authority on who may review. This decides who is offered the
 * form, from the two things the page can already see.
 */
describe('canOfferReviewForm', () => {
  const base = { ratings: [theirs], userId: 'me', endDate: '2026-09-29T12:00:00Z', now: NOW };

  it('offers it after the experience, to someone who has not reviewed it', () => {
    expect(canOfferReviewForm(base)).toBe(true);
  });

  it('does not offer it before the experience has happened', () => {
    expect(canOfferReviewForm({ ...base, endDate: '2026-10-05T12:00:00Z' })).toBe(false);
  });

  it('does not offer it twice', () => {
    expect(canOfferReviewForm({ ...base, ratings: [theirs, mine] })).toBe(false);
  });

  it('does not offer it to someone who is not signed in', () => {
    expect(canOfferReviewForm({ ...base, userId: undefined })).toBe(false);
  });
});
