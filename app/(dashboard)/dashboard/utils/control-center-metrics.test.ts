import { Experience } from '@/types/experience';

import { experienceProgress, isActive, isHostedBy, toAmount } from './control-center-metrics';

// Shaped like the real hosted-experience payload, where money is a decimal
// string and host counters only appear on experiences you own
const hosted = (overrides: Record<string, unknown> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Mt Kenya',
    status: 'published',
    startDate: '2026-09-01T06:00:00Z',
    photos: [],
    priceStartsFrom: { amount: 100, currency: 'Ksh.' },
    ticketsSold: 4,
    totalTickets: 15,
    totalAmountSold: { amount: '340000.00', currency: 'KES' },
    ...overrides,
  }) as unknown as Experience;

describe('toAmount', () => {
  it('parses the decimal strings the API sends', () => {
    expect(toAmount({ amount: '340000.00' })).toBe(340000);
    expect(toAmount({ amount: 500 })).toBe(500);
  });

  it('treats missing or unparseable money as zero', () => {
    expect(toAmount(undefined)).toBe(0);
    expect(toAmount({ amount: 'abc' })).toBe(0);
  });
});

describe('experienceProgress', () => {
  it('computes sold, total and percent', () => {
    expect(experienceProgress(hosted())).toMatchObject({ sold: 4, total: 15, percent: 27 });
  });

  it('flags an experience selling fast', () => {
    expect(experienceProgress(hosted({ ticketsSold: 12 })).isSellingFast).toBe(true);
  });

  it('does not flag a sold-out experience as selling fast', () => {
    expect(experienceProgress(hosted({ ticketsSold: 15 })).isSellingFast).toBe(false);
  });

  it('avoids dividing by zero when no tickets exist', () => {
    expect(experienceProgress(hosted({ totalTickets: 0, ticketsCreated: 0 })).percent).toBe(0);
  });

  it('falls back to ticketsCreated when totalTickets is absent', () => {
    expect(experienceProgress(hosted({ totalTickets: undefined, ticketsCreated: 8 })).total).toBe(
      8,
    );
  });
});

describe('isActive', () => {
  it('accepts either casing the API uses for published', () => {
    expect(isActive(hosted({ status: 'published' }))).toBe(true);
    expect(isActive(hosted({ status: 'PUBLISHED' }))).toBe(true);
    expect(isActive(hosted({ status: 'draft' }))).toBe(false);
  });
});

// Regression: the hosted_by filter also returns experiences the user only
// CO-HOSTS, so the control center listed other people's experiences and folded their
// sales into the host's own figures.
describe('isHostedBy', () => {
  const owned = { host: { id: 'me' }, coHosts: [] } as unknown as Experience;
  const coHosted = {
    host: { id: 'someone-else' },
    coHosts: [{ id: 'me' }],
  } as unknown as Experience;

  it('accepts an experience this user hosts', () => {
    expect(isHostedBy(owned, 'me')).toBe(true);
  });

  it('rejects one where the user is only a co-host', () => {
    expect(isHostedBy(coHosted, 'me')).toBe(false);
  });

  it('rejects everything when there is no signed-in user', () => {
    expect(isHostedBy(owned, undefined)).toBe(false);
    expect(isHostedBy(owned, null)).toBe(false);
  });

  it('rejects an experience with no host', () => {
    expect(isHostedBy({} as Experience, 'me')).toBe(false);
  });

  // Sales on someone else's experience are not this host's revenue
  it('keeps co-hosted experiences out of the owned list', () => {
    const mine = { ...owned, ticketsSold: 4, status: 'published' } as unknown as Experience;
    const theirs = { ...coHosted, ticketsSold: 99, status: 'published' } as unknown as Experience;

    const ownedOnly = [mine, theirs].filter((item) => isHostedBy(item, 'me'));

    expect(ownedOnly).toEqual([mine]);
    expect(ownedOnly.filter(isActive)).toHaveLength(1);
  });
});
