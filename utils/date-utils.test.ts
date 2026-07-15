import { inferUIExperienceType } from './date-utils';

describe('inferUIExperienceType', () => {
  it('maps itinerary API type to itinerary UI type', () => {
    expect(inferUIExperienceType('itinerary', '2026-06-10T09:00:00', '2026-06-14T18:00:00')).toBe(
      'itinerary',
    );
  });

  it('maps itinerary regardless of date span', () => {
    expect(inferUIExperienceType('itinerary', '2026-06-10T09:00:00', '2026-06-10T18:00:00')).toBe(
      'itinerary',
    );
  });

  it('maps standard same-day to one-time', () => {
    expect(inferUIExperienceType('standard', '2026-06-10T09:00:00', '2026-06-10T18:00:00')).toBe(
      'one-time',
    );
  });

  it('maps standard same-day different times to one-time', () => {
    expect(inferUIExperienceType('standard', '2026-06-10T00:00:00', '2026-06-10T23:59:59')).toBe(
      'one-time',
    );
  });

  it('maps standard multi-day to multi-day', () => {
    expect(inferUIExperienceType('standard', '2026-06-10T09:00:00', '2026-06-14T18:00:00')).toBe(
      'multi-day',
    );
  });

  it('maps standard two consecutive days to multi-day', () => {
    expect(inferUIExperienceType('standard', '2026-06-10T09:00:00', '2026-06-11T09:00:00')).toBe(
      'multi-day',
    );
  });

  it('defaults to one-time when startDate is null', () => {
    expect(inferUIExperienceType('standard', null, '2026-06-10T18:00:00')).toBe('one-time');
  });

  it('defaults to one-time when endDate is null', () => {
    expect(inferUIExperienceType('standard', '2026-06-10T09:00:00', null)).toBe('one-time');
  });

  it('defaults to one-time when both dates null', () => {
    expect(inferUIExperienceType('standard', null, null)).toBe('one-time');
  });

  it('handles ISO strings with timezone offset', () => {
    expect(inferUIExperienceType('standard', '2026-06-10T09:00:00Z', '2026-06-10T18:00:00Z')).toBe(
      'one-time',
    );
  });

  it('maps a recurring experience spanning multiple days to one-time, not multi-day', () => {
    // Recurring experiences span first-to-last occurrence (here 27–29 Aug) but
    // must stay on the one-time base type so the recurring tickets layout renders.
    expect(
      inferUIExperienceType('standard', '2026-08-27T14:00:00', '2026-08-29T21:00:00', true),
    ).toBe('one-time');
  });

  it('still infers multi-day for a non-recurring multi-day span', () => {
    expect(
      inferUIExperienceType('standard', '2026-08-27T14:00:00', '2026-08-29T21:00:00', false),
    ).toBe('multi-day');
  });

  it('keeps itinerary even when recurring flag is set', () => {
    expect(
      inferUIExperienceType('itinerary', '2026-08-27T14:00:00', '2026-08-29T21:00:00', true),
    ).toBe('itinerary');
  });
});

describe('formatReservationDateTime', () => {
  const { formatReservationDateTime } = jest.requireActual('./date-utils');

  it('formats a same-day range as "Sat 4 July · 6:00 AM — 4:00 PM"', () => {
    // Local timestamps (no Z) so the assertion is timezone-independent
    expect(formatReservationDateTime('2026-07-04T06:00:00', '2026-07-04T16:00:00')).toBe(
      'Sat 4 July · 6:00 AM — 4:00 PM',
    );
  });

  it('formats midnight and noon correctly', () => {
    expect(formatReservationDateTime('2026-07-06T00:00:00', '2026-07-06T12:30:00')).toBe(
      'Mon 6 July · 12:00 AM — 12:30 PM',
    );
  });
});
