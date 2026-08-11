import { Experience } from '@/types/experience';

import { buildManageExperienceMetrics } from './manage-metrics';

const experience = (overrides: Partial<Experience> = {}) =>
  ({
    id: 'exp-1',
    status: 'published',
    reservedTicketsCount: 48,
    ticketsAvailable: 32,
    isSoldOut: false,
    startDate: '2026-09-01T09:00:00Z',
    ...overrides,
  }) as unknown as Experience;

describe('buildManageExperienceMetrics', () => {
  it('derives sold, total and fill rate from the experience', () => {
    const metrics = buildManageExperienceMetrics(experience());

    expect(metrics.ticketsSold).toBe(48);
    expect(metrics.ticketsTotal).toBe(80);
    expect(metrics.fillRatePercent).toBe(60);
  });

  it('does not divide by zero when no tickets exist', () => {
    const metrics = buildManageExperienceMetrics(
      experience({ reservedTicketsCount: 0, ticketsAvailable: false as unknown as boolean }),
    );

    expect(metrics.ticketsTotal).toBe(0);
    expect(metrics.fillRatePercent).toBe(0);
  });

  it('treats a published experience with inventory left as selling', () => {
    expect(buildManageExperienceMetrics(experience()).isSelling).toBe(true);
  });

  it('is not selling when sold out, drafted, or out of inventory', () => {
    expect(buildManageExperienceMetrics(experience({ isSoldOut: true })).isSelling).toBe(false);
    expect(buildManageExperienceMetrics(experience({ status: 'draft' as never })).isSelling).toBe(
      false,
    );
    expect(
      buildManageExperienceMetrics(experience({ ticketsAvailable: false as unknown as boolean }))
        .isSelling,
    ).toBe(false);
  });

  it('never reports negative days to go for a past experience', () => {
    const metrics = buildManageExperienceMetrics(experience({ startDate: '2020-01-01T09:00:00Z' }));

    expect(metrics.daysToGo).toBe(0);
  });

  it('returns null days to go when there is no start date', () => {
    const metrics = buildManageExperienceMetrics(experience({ startDate: undefined }));

    expect(metrics.daysToGo).toBeNull();
  });

  it('survives an undefined experience', () => {
    const metrics = buildManageExperienceMetrics(undefined);

    expect(metrics.ticketsSold).toBe(0);
    expect(metrics.isSelling).toBe(false);
  });
});
