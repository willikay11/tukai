import {
  localDateTimeToUtcIso,
  localTimeToUtcTime,
  utcDateOf,
  utcIsoToLocalParts,
  utcTimeToLocalTime,
} from './utc-time';

// jest.config.js pins the local zone to Africa/Nairobi (UTC+3)

describe('localDateTimeToUtcIso', () => {
  it('sends a local time as its UTC instant', () => {
    expect(localDateTimeToUtcIso('2026-07-05', '08:00')).toBe('2026-07-05T05:00:00Z');
  });

  it('moves a time just after midnight to the previous UTC day', () => {
    expect(localDateTimeToUtcIso('2026-07-05', '01:30')).toBe('2026-07-04T22:30:00Z');
  });

  it('uses the start or the last second of the day when there is no time', () => {
    expect(localDateTimeToUtcIso('2026-07-05')).toBe('2026-07-04T21:00:00Z');
    expect(localDateTimeToUtcIso('2026-07-05', null, true)).toBe('2026-07-05T20:59:59Z');
  });

  it('sends nothing for no date', () => {
    expect(localDateTimeToUtcIso('', '08:00')).toBe('');
  });
});

describe('utcIsoToLocalParts', () => {
  it('reads an API datetime back as the local date and time', () => {
    expect(utcIsoToLocalParts('2026-07-05T05:00:00Z')).toEqual({
      date: '2026-07-05',
      time: '08:00',
    });
  });

  it('moves a late UTC time onto the next local day', () => {
    expect(utcIsoToLocalParts('2026-07-04T22:30:00Z')).toEqual({
      date: '2026-07-05',
      time: '01:30',
    });
  });

  it('round-trips what the form sent', () => {
    expect(utcIsoToLocalParts(localDateTimeToUtcIso('2026-12-31', '23:15'))).toEqual({
      date: '2026-12-31',
      time: '23:15',
    });
  });

  it('answers nulls for nothing', () => {
    expect(utcIsoToLocalParts(null)).toEqual({ date: null, time: null });
    expect(utcIsoToLocalParts('not a date')).toEqual({ date: null, time: null });
  });
});

describe('slot start times', () => {
  // The ticket's own examples (DEV-454)
  it('sends an 08:00 Nairobi slot as 05:00', () => {
    expect(localTimeToUtcTime('2026-07-05', '08:00')).toBe('05:00');
  });

  it('sends a 01:30 Nairobi slot as 22:30', () => {
    expect(localTimeToUtcTime('2026-07-05', '01:30')).toBe('22:30');
  });

  it('shows a UTC slot time as local time', () => {
    expect(utcTimeToLocalTime('2026-07-05', '05:00:00')).toBe('08:00');
    expect(utcTimeToLocalTime('2026-07-04', '22:30')).toBe('01:30');
  });

  it('round-trips through the UTC date of the experience start', () => {
    const start = localDateTimeToUtcIso('2026-07-05', '01:30');
    const sent = localTimeToUtcTime('2026-07-05', '01:30');

    expect(utcTimeToLocalTime(utcDateOf(start), sent)).toBe('01:30');
  });
});

describe('utcDateOf', () => {
  it('is the UTC calendar date, not the local one', () => {
    expect(utcDateOf('2026-07-04T22:30:00Z')).toBe('2026-07-04');
  });
});
