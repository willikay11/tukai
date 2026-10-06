import { Experience } from '@/types/experience';

import { isOngoing, ongoingExperiences } from './happening-now';

const NOON = new Date(2026, 9, 6, 12);

const experience = (id: string, startDate: string, endDate: string, extra = {}): Experience =>
  ({ id, title: id, startDate, endDate, ...extra }) as unknown as Experience;

describe('isOngoing', () => {
  it('is true between start and end', () => {
    const e = experience('a', '2026-10-06T10:00:00', '2026-10-06T14:00:00');
    expect(isOngoing(e, NOON)).toBe(true);
  });

  it('is false before it starts', () => {
    const e = experience('a', '2026-10-06T13:00:00', '2026-10-06T14:00:00');
    expect(isOngoing(e, NOON)).toBe(false);
  });

  it('is false once it has ended', () => {
    const e = experience('a', '2026-10-06T09:00:00', '2026-10-06T11:00:00');
    expect(isOngoing(e, NOON)).toBe(false);
  });

  it('counts the start instant as on, and the end instant as over', () => {
    expect(isOngoing(experience('a', NOON.toISOString(), '2026-10-06T14:00:00'), NOON)).toBe(true);
    expect(isOngoing(experience('a', '2026-10-06T10:00:00', NOON.toISOString()), NOON)).toBe(false);
  });

  it('is false for a recurring experience, whose dates describe the whole series', () => {
    const e = experience('a', '2026-01-01T10:00:00', '2027-01-01T10:00:00', {
      recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=TU',
    });
    expect(isOngoing(e, NOON)).toBe(false);
  });

  it('is false when a date is missing or unreadable', () => {
    expect(isOngoing(experience('a', '', '2026-10-06T14:00:00'), NOON)).toBe(false);
    expect(isOngoing(experience('a', '2026-10-06T10:00:00', 'not a date'), NOON)).toBe(false);
  });
});

describe('ongoingExperiences', () => {
  it('keeps only what is on, the one that started first leading', () => {
    const later = experience('later', '2026-10-06T11:30:00', '2026-10-06T15:00:00');
    const earlier = experience('earlier', '2026-10-06T10:00:00', '2026-10-06T15:00:00');
    const over = experience('over', '2026-10-06T08:00:00', '2026-10-06T09:00:00');

    expect(ongoingExperiences([later, over, earlier], NOON).map((e) => e.id)).toEqual([
      'earlier',
      'later',
    ]);
  });

  it('is empty when nothing is on', () => {
    expect(ongoingExperiences([], NOON)).toEqual([]);
  });
});
