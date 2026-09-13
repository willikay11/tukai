import { Experience } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';

import { buildManageExperienceMetrics, countBuyers } from './manage-metrics';

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

const purchase = (id: string, userId?: string): TicketPurchase =>
  ({ id, user: userId ? { id: userId } : null }) as unknown as TicketPurchase;

describe('countBuyers', () => {
  // People, not tickets — one person buying four is one buyer
  it('counts each person once however many tickets they hold', () => {
    expect(countBuyers([purchase('1', 'u1'), purchase('2', 'u1'), purchase('3', 'u1')])).toBe(1);
  });

  it('counts different people separately', () => {
    expect(countBuyers([purchase('1', 'u1'), purchase('2', 'u2')])).toBe(2);
  });

  it('is zero with no purchases', () => {
    expect(countBuyers([])).toBe(0);
  });

  // Dropping an anonymous purchase would undercount; collapsing them all into
  // one would undercount worse
  it('treats purchases with no user as separate buyers', () => {
    expect(countBuyers([purchase('1'), purchase('2')])).toBe(2);
  });

  it('mixes known and unknown buyers', () => {
    expect(countBuyers([purchase('1', 'u1'), purchase('2', 'u1'), purchase('3')])).toBe(2);
  });
});

// `buyers` was hardcoded to 80 regardless of the experience
describe('buildManageExperienceMetrics buyers', () => {
  const published = { status: 'published', ticketsAvailable: 10 } as unknown as Experience;

  it('reports the real buyer count', () => {
    const metrics = buildManageExperienceMetrics(published, [
      purchase('1', 'u1'),
      purchase('2', 'u2'),
      purchase('3', 'u2'),
    ]);

    expect(metrics.buyers).toBe(2);
  });

  it('reports no buyers before anyone has bought', () => {
    expect(buildManageExperienceMetrics(published, []).buyers).toBe(0);
  });

  it('defaults to no buyers when purchases are not supplied', () => {
    expect(buildManageExperienceMetrics(published).buyers).toBe(0);
  });
});
