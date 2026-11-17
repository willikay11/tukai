import {
  experienceMoment,
  isTimeZone,
  localDateTimeToUtcIso,
  localTimeToUtcTime,
  shiftToZone,
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

// An experience's own zone wins over the browser's (Nairobi, from jest.config.js)
describe("in the experience's time zone", () => {
  it('sends a London summer time as its UTC instant', () => {
    expect(localDateTimeToUtcIso('2026-07-05', '08:00', false, 'Europe/London')).toBe(
      '2026-07-05T07:00:00Z',
    );
  });

  it('reads an API datetime back in New York time', () => {
    expect(utcIsoToLocalParts('2026-07-05T12:00:00Z', 'America/New_York')).toEqual({
      date: '2026-07-05',
      time: '08:00',
    });
  });

  it('follows a daylight-saving change', () => {
    // London is UTC+0 in January and UTC+1 in July
    expect(localDateTimeToUtcIso('2026-01-15', '09:00', false, 'Europe/London')).toBe(
      '2026-01-15T09:00:00Z',
    );
    expect(localDateTimeToUtcIso('2026-07-15', '09:00', false, 'Europe/London')).toBe(
      '2026-07-15T08:00:00Z',
    );
  });

  it('converts slot times in the zone', () => {
    expect(localTimeToUtcTime('2026-07-05', '08:00', 'America/New_York')).toBe('12:00');
    expect(utcTimeToLocalTime('2026-07-05', '12:00', 'America/New_York')).toBe('08:00');
  });

  it('falls back to the browser zone for an unknown name', () => {
    expect(isTimeZone('Mars/Olympus')).toBe(false);
    expect(localDateTimeToUtcIso('2026-07-05', '08:00', false, 'Mars/Olympus')).toBe(
      '2026-07-05T05:00:00Z',
    );
  });

  it('round-trips an experience in another zone', () => {
    const sent = localDateTimeToUtcIso('2026-03-29', '23:30', false, 'Asia/Tokyo');
    expect(utcIsoToLocalParts(sent, 'Asia/Tokyo')).toEqual({ date: '2026-03-29', time: '23:30' });
  });
});

describe('showing an instant in a zone', () => {
  it("shifts a Date so its local getters read the zone's wall clock", () => {
    const shifted = shiftToZone(new Date('2026-07-05T12:00:00Z'), 'America/New_York');
    expect([shifted.getDate(), shifted.getHours()]).toEqual([5, 8]);
  });

  it('leaves the Date alone without a zone', () => {
    const date = new Date('2026-07-05T12:00:00Z');
    expect(shiftToZone(date, null)).toBe(date);
  });

  it('formats an API datetime in the zone', () => {
    expect(
      experienceMoment('2026-11-25T03:30:00Z', 'Africa/Nairobi').format('ddd D MMM, h:mm A'),
    ).toBe('Wed 25 Nov, 6:30 AM');
    expect(experienceMoment('2026-11-25T03:30:00Z', 'Europe/London').format('h:mm A')).toBe(
      '3:30 AM',
    );
  });
});
