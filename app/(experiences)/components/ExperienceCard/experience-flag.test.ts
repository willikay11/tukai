import { Experience } from '@/types/experience';

import { experienceFlag, experiencePriceLine, experienceRunBy } from './experience-flag';

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Pottery for beginners',
    isPaid: true,
    isSoldOut: false,
    priceStartsFrom: { amount: 1800, currency: 'KES' },
    ...overrides,
  }) as unknown as Experience;

describe('experienceFlag', () => {
  it('is nothing for an ordinary paid experience with seats left', () => {
    expect(experienceFlag(experience())).toBeNull();
  });

  it('flags a free experience', () => {
    expect(experienceFlag(experience({ isPaid: false }))).toEqual({
      text: 'Free',
      icon: 'Tag01Icon',
    });
  });

  it('flags a recurring one', () => {
    expect(experienceFlag(experience({ recurrenceRule: 'FREQ=WEEKLY;BYDAY=SA' }))).toEqual({
      text: 'Recurring',
      icon: 'RepeatIcon',
    });
  });

  it('flags a sold-out one', () => {
    expect(experienceFlag(experience({ isSoldOut: true }))).toEqual({
      text: 'Sold out',
      icon: 'Clock01Icon',
    });
  });

  // The canvas never shows two at once and does not say which wins. Sold out
  // leads because it is the only one that changes whether the reader can act.
  it('says sold out ahead of free or recurring', () => {
    const both = experience({
      isSoldOut: true,
      isPaid: false,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=SA',
    });
    expect(experienceFlag(both)?.text).toBe('Sold out');
  });

  it('reads is_paid ahead of the price', () => {
    // A paid experience whose cheapest ticket is zero is still not free
    expect(experienceFlag(experience({ priceStartsFrom: { amount: 0, currency: 'KES' } }))).toEqual(
      {
        text: 'Free',
        icon: 'Tag01Icon',
      },
    );
    expect(
      experienceFlag(experience({ isPaid: true, priceStartsFrom: undefined as never })),
    ).toBeNull();
  });
});

describe('experiencePriceLine', () => {
  it('writes the price per person', () => {
    expect(experiencePriceLine(experience())).toBe('KES 1,800/person');
  });

  it('says Free rather than a zero', () => {
    expect(experiencePriceLine(experience({ isPaid: false }))).toBe('Free');
  });

  it('reads a decimal string, as the API sometimes sends it', () => {
    const priced = experience({ priceStartsFrom: { amount: '2500.00', currency: 'KES' } as never });
    expect(experiencePriceLine(priced)).toBe('KES 2,500/person');
  });

  // Rather than "undefined /person"
  it('says nothing when there is no price at all', () => {
    expect(experiencePriceLine(experience({ priceStartsFrom: undefined as never }))).toBe('');
  });
});

describe('experienceRunBy', () => {
  it('is the host community for an ordinary experience', () => {
    const run = experience({
      hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' } as never,
    });

    expect(experienceRunBy(run)).toBe('Nairobi Makers Circle');
  });

  // A guided tour is provisioned behind a guide's profile, so the host IS the
  // guide and their name is what the card has to say
  it('falls back to the host for a guided tour, which has no community', () => {
    const tour = experience({
      host: { id: 'u1', firstName: 'Michelle', lastName: 'Wachira' } as never,
    });

    expect(experienceRunBy(tour)).toBe('Michelle Wachira');
  });

  it('prefers a display name', () => {
    const tour = experience({
      host: {
        id: 'u1',
        firstName: 'Michelle',
        lastName: 'Wachira',
        displayName: 'Shelly',
      } as never,
    });

    expect(experienceRunBy(tour)).toBe('Shelly');
  });

  it('is nothing when neither is there', () => {
    expect(experienceRunBy(experience())).toBeUndefined();
  });

  // Rather than a stray space passing as a name
  it('is nothing when the host has no name at all', () => {
    expect(experienceRunBy(experience({ host: { id: 'u1' } as never }))).toBeUndefined();
  });
});
