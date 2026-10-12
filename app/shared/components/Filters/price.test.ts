import { Experience } from '@/types/experience';

import { matchesPrice } from './price';

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Sunrise hike',
    isPaid: true,
    priceStartsFrom: { amount: 1500, currency: 'KES' },
    ...overrides,
  }) as unknown as Experience;

const none = { freeOnly: false, paidOnly: false, priceMin: undefined, priceMax: undefined };

describe('matchesPrice', () => {
  it('keeps everything when nothing is picked', () => {
    expect(matchesPrice(experience(), none)).toBe(true);
  });

  it('keeps a free experience for Free and drops it for Paid', () => {
    const free = experience({ isPaid: false });

    expect(matchesPrice(free, { ...none, freeOnly: true })).toBe(true);
    expect(matchesPrice(free, { ...none, paidOnly: true })).toBe(false);
  });

  it('keeps a paid experience for Paid and drops it for Free', () => {
    expect(matchesPrice(experience(), { ...none, paidOnly: true })).toBe(true);
    expect(matchesPrice(experience(), { ...none, freeOnly: true })).toBe(false);
  });

  it('keeps a price inside the range and drops one outside it', () => {
    expect(matchesPrice(experience(), { ...none, priceMin: 1000, priceMax: 2000 })).toBe(true);
    expect(matchesPrice(experience(), { ...none, priceMin: 2000 })).toBe(false);
    expect(matchesPrice(experience(), { ...none, priceMax: 1000 })).toBe(false);
  });

  // Nothing to be over or under - a free experience always clears a range
  it('lets a free experience clear any price range', () => {
    expect(
      matchesPrice(experience({ isPaid: false }), { ...none, priceMin: 1000, priceMax: 2000 }),
    ).toBe(true);
  });
});
