import { Experience } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';

import { buildCalendarAgenda, dayOffset, defaultDayOffset, itemsFrom } from './calendar-agenda';

const NOW = new Date('2026-06-15T12:00:00Z');

const purchase = (overrides: Partial<TicketPurchase> = {}): TicketPurchase => ({
  id: 'p1',
  ticketNumber: 'TKT-1',
  ticket: { id: 't1', name: 'General', price: '1000', currency: 'KES', experience: 'e1' },
  occurrence: null,
  qrCodeImage: null,
  ticketPdf: null,
  status: 'completed',
  dateCreated: '2026-06-01T00:00:00Z',
  ...overrides,
});

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Pottery for beginners',
    startDate: '2026-06-20T12:00:00Z',
    photos: [],
    location: { name: 'Dust Studio', city: 'Nairobi' },
    ...overrides,
  }) as Experience;

describe('dayOffset', () => {
  it('ignores the time of day', () => {
    expect(dayOffset('2026-06-20T12:00:00Z', NOW)).toBe(5);
    expect(dayOffset('2026-06-15T12:00:00Z', NOW)).toBe(0);
    expect(dayOffset('2026-06-10T12:00:00Z', NOW)).toBe(-5);
  });
});

describe('buildCalendarAgenda', () => {
  it('tags a future booking as Booked and a past one as Attended', () => {
    const future = purchase({ id: 'p-future' });
    const past = purchase({
      id: 'p-past',
      ticket: { ...purchase().ticket, experience: 'e2' },
      occurrence: { id: 'o1', startDate: '2026-06-01T12:00:00Z', endDate: '2026-06-01T14:00:00Z' },
    });

    const { agenda } = buildCalendarAgenda(
      [future, past],
      [experience(), experience({ id: 'e2', title: 'Sunrise hike' })],
      [],
      NOW,
    );

    expect(agenda.find((item) => item.experienceId === 'e1')?.tag).toBe('Booked');
    expect(agenda.find((item) => item.experienceId === 'e2')?.tag).toBe('Attended');
  });

  it('drops a purchase whose experience was not also returned as reserved', () => {
    const { agenda } = buildCalendarAgenda([purchase()], [], [], NOW);

    expect(agenda).toHaveLength(0);
  });

  it('tags a hosted experience as Hosting regardless of its date', () => {
    const past = experience({ id: 'hosted-past', startDate: '2026-01-01T00:00:00Z' });
    const future = experience({ id: 'hosted-future', startDate: '2026-12-01T00:00:00Z' });

    const { agenda } = buildCalendarAgenda([], [], [past, future], NOW);

    expect(agenda.every((item) => item.tag === 'Hosting')).toBe(true);
    expect(agenda).toHaveLength(2);
  });

  it('groups tickets for the same occurrence into one reservation', () => {
    const a = purchase({ id: 'a' });
    const b = purchase({ id: 'b', ticketNumber: 'TKT-2' });

    const { agenda } = buildCalendarAgenda([a, b], [experience()], [], NOW);

    expect(agenda).toHaveLength(1);
  });

  it('counts how many separate plans land on the same day', () => {
    const a = purchase({ id: 'a' });
    const b = purchase({ id: 'b', ticket: { ...purchase().ticket, experience: 'e2' } });

    const { days } = buildCalendarAgenda(
      [a, b],
      [experience(), experience({ id: 'e2', title: 'Sunrise hike' })],
      [],
      NOW,
    );

    expect(days).toHaveLength(1);
    expect(days[0]).toMatchObject({ offset: 5, count: 2, isToday: false, isPast: false });
  });
});

describe('defaultDayOffset', () => {
  it('picks the next day with a plan', () => {
    expect(defaultDayOffset([{ offset: -3, date: '', count: 1, isToday: false, isPast: true }, { offset: 2, date: '', count: 1, isToday: false, isPast: false }])).toBe(2);
  });

  it('falls back to the most recent past day when nothing is upcoming', () => {
    expect(
      defaultDayOffset([
        { offset: -5, date: '', count: 1, isToday: false, isPast: true },
        { offset: -1, date: '', count: 1, isToday: false, isPast: true },
      ]),
    ).toBe(-1);
  });

  it('is today when there are no days at all', () => {
    expect(defaultDayOffset([])).toBe(0);
  });
});

describe('itemsFrom', () => {
  it('takes up to three items from the given day onward, not just that day', () => {
    const agenda = [
      { key: 'a', experienceId: 'e1', date: '2026-06-16', title: 'A', place: '', tag: 'Booked' as const, isPast: false },
      { key: 'b', experienceId: 'e2', date: '2026-06-18', title: 'B', place: '', tag: 'Booked' as const, isPast: false },
      { key: 'c', experienceId: 'e3', date: '2026-06-20', title: 'C', place: '', tag: 'Booked' as const, isPast: false },
      { key: 'd', experienceId: 'e4', date: '2026-06-22', title: 'D', place: '', tag: 'Booked' as const, isPast: false },
    ];

    expect(itemsFrom(agenda, 1, NOW).map((item) => item.key)).toEqual(['a', 'b', 'c']);
  });
});
