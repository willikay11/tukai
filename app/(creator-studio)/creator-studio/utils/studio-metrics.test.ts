import { Experience } from '@/types/experience';

import {
  buildStudioMetrics,
  experienceProgress,
  isActive,
  toAmount,
  upcomingExperiences,
} from './studio-metrics';

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

describe('buildStudioMetrics', () => {
  it('sums real revenue and tickets across hosted experiences', () => {
    const metrics = buildStudioMetrics([
      hosted(),
      hosted({ id: 'e2', ticketsSold: 6, totalAmountSold: { amount: '2000.00', currency: 'KES' } }),
    ]);

    expect(metrics.totalRevenue).toBe(342000);
    expect(metrics.ticketsSold).toBe(10);
  });

  it('counts only published experiences as active', () => {
    const metrics = buildStudioMetrics([
      hosted(),
      hosted({ id: 'e2', status: 'draft' }),
      hosted({ id: 'e3', status: 'expired' }),
    ]);

    expect(metrics.activeExperiences).toBe(1);
  });

  it('copes with a host who has no experiences', () => {
    const metrics = buildStudioMetrics([]);

    expect(metrics.totalRevenue).toBe(0);
    expect(metrics.ticketsSold).toBe(0);
    expect(metrics.activeExperiences).toBe(0);
    expect(metrics.monthlyRevenue).toHaveLength(8);
  });

  it('ignores experiences with no host counters', () => {
    const metrics = buildStudioMetrics([
      hosted({ ticketsSold: undefined, totalAmountSold: undefined }),
    ]);

    expect(metrics.totalRevenue).toBe(0);
    expect(metrics.ticketsSold).toBe(0);
  });

  // The chart has no endpoint; it must still line up with the real total
  it('produces eight labelled months that stay proportional to the total', () => {
    const metrics = buildStudioMetrics([hosted()]);

    expect(metrics.monthlyRevenue).toHaveLength(8);
    metrics.monthlyRevenue.forEach((point) => {
      expect(point.month).toMatch(/^[A-Z][a-z]{2}$/);
      expect(point.amount).toBeGreaterThan(0);
    });
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

describe('upcomingExperiences', () => {
  const now = new Date('2026-08-20T00:00:00Z').getTime();

  it('keeps future experiences, soonest first', () => {
    const result = upcomingExperiences(
      [
        hosted({ id: 'late', startDate: '2026-10-01T06:00:00Z' }),
        hosted({ id: 'past', startDate: '2026-07-01T06:00:00Z' }),
        hosted({ id: 'soon', startDate: '2026-09-01T06:00:00Z' }),
      ],
      now,
    );

    expect(result.map((item) => item.id)).toEqual(['soon', 'late']);
  });

  it('drops experiences with no start date', () => {
    expect(upcomingExperiences([hosted({ startDate: null })], now)).toEqual([]);
  });
});

describe('isActive', () => {
  it('accepts either casing the API uses for published', () => {
    expect(isActive(hosted({ status: 'published' }))).toBe(true);
    expect(isActive(hosted({ status: 'PUBLISHED' }))).toBe(true);
    expect(isActive(hosted({ status: 'draft' }))).toBe(false);
  });
});
