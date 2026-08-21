import { Experience } from '@/types/experience';

import { buildManageExperienceMetrics } from './manage-metrics';

// Mirrors the host payload: tickets_sold / total_tickets are the host's own
// figures, while reserved_tickets_count is the REQUESTING USER's own bookings
const experience = (overrides: Partial<Experience> = {}) =>
  ({
    id: 'exp-1',
    status: 'published',
    ticketsSold: 48,
    totalTickets: 80,
    ticketsCreated: 80,
    ticketsAvailable: 32,
    reservedTicketsCount: 1,
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

  // Regression: sold came from reserved_tickets_count — the host's OWN
  // bookings, normally 0 — so the dashboard reported almost no sales and the
  // donut barely moved
  it('reads sales from the host figures, not the viewer own reservations', () => {
    const metrics = buildManageExperienceMetrics(
      experience({ ticketsSold: 4, totalTickets: 15, reservedTicketsCount: 1 }),
    );

    expect(metrics.ticketsSold).toBe(4);
    expect(metrics.ticketsTotal).toBe(15);
    expect(metrics.fillRatePercent).toBe(27);
  });

  it('falls back to sold plus remaining when total_tickets is absent', () => {
    const metrics = buildManageExperienceMetrics(
      experience({
        totalTickets: undefined,
        ticketsCreated: undefined,
        ticketsSold: 10,
        ticketsAvailable: 5,
      }),
    );

    expect(metrics.ticketsTotal).toBe(15);
  });

  it('does not divide by zero when no tickets exist', () => {
    const metrics = buildManageExperienceMetrics(
      experience({ ticketsSold: 0, totalTickets: 0, ticketsCreated: 0, ticketsAvailable: 0 }),
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
    expect(buildManageExperienceMetrics(experience({ ticketsAvailable: 0 })).isSelling).toBe(false);
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
