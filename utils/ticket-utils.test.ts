import {
  buildAbsoluteTicketValidity,
  buildRecurringTicketValidity,
  mapAnchorToCondition,
  mapRelativeUnit,
  mapRelativeUnitAmount,
} from './ticket-utils';

describe('mapRelativeUnit', () => {
  it('maps hour to hours', () => {
    expect(mapRelativeUnit('hour')).toBe('hours');
  });

  it('maps day to days', () => {
    expect(mapRelativeUnit('day')).toBe('days');
  });

  it('maps week to days (API does not support weeks)', () => {
    expect(mapRelativeUnit('week')).toBe('days');
  });
});

describe('mapRelativeUnitAmount', () => {
  it('returns amount unchanged for hours', () => {
    expect(mapRelativeUnitAmount(3, 'hour')).toBe(3);
  });

  it('returns amount unchanged for days', () => {
    expect(mapRelativeUnitAmount(5, 'day')).toBe(5);
  });

  it('converts weeks to days (multiplies by 7)', () => {
    expect(mapRelativeUnitAmount(2, 'week')).toBe(14);
  });

  it('converts single week to 7 days', () => {
    expect(mapRelativeUnitAmount(1, 'week')).toBe(7);
  });
});

describe('mapAnchorToCondition', () => {
  it('maps start to before_start', () => {
    expect(mapAnchorToCondition('start')).toBe('before_start');
  });

  it('maps end to before_end', () => {
    expect(mapAnchorToCondition('end')).toBe('before_end');
  });
});

describe('buildRecurringTicketValidity', () => {
  it('returns null fields when salesEndRelative is null', () => {
    const result = buildRecurringTicketValidity(null);
    expect(result).toEqual({
      ticket_sales_closing_duration: null,
      ticket_sales_closing_unit: null,
      ticket_sales_closing_condition: null,
    });
  });

  it('builds correct payload for hours before start', () => {
    const result = buildRecurringTicketValidity({
      amount: 2,
      unit: 'hour',
      anchor: 'start',
    });
    expect(result).toEqual({
      ticket_sales_closing_duration: 2,
      ticket_sales_closing_unit: 'hours',
      ticket_sales_closing_condition: 'before_start',
    });
  });

  it('builds correct payload for days before end', () => {
    const result = buildRecurringTicketValidity({
      amount: 3,
      unit: 'day',
      anchor: 'end',
    });
    expect(result).toEqual({
      ticket_sales_closing_duration: 3,
      ticket_sales_closing_unit: 'days',
      ticket_sales_closing_condition: 'before_end',
    });
  });

  it('converts weeks to days', () => {
    const result = buildRecurringTicketValidity({
      amount: 1,
      unit: 'week',
      anchor: 'start',
    });
    expect(result).toEqual({
      ticket_sales_closing_duration: 7,
      ticket_sales_closing_unit: 'days',
      ticket_sales_closing_condition: 'before_start',
    });
  });

  it('converts 2 weeks to 14 days', () => {
    const result = buildRecurringTicketValidity({
      amount: 2,
      unit: 'week',
      anchor: 'end',
    });
    expect(result).toEqual({
      ticket_sales_closing_duration: 14,
      ticket_sales_closing_unit: 'days',
      ticket_sales_closing_condition: 'before_end',
    });
  });
});

describe('buildAbsoluteTicketValidity', () => {
  it('builds correct payload when both dates and times set', () => {
    const result = buildAbsoluteTicketValidity('2026-03-24', '09:00', '2026-03-31', '18:00');
    expect(result).toEqual({
      sales_start_date: '2026-03-24T09:00:00',
      sales_end_date: '2026-03-31T18:00:00',
    });
  });

  it('returns null sales_start_date when start date missing', () => {
    const result = buildAbsoluteTicketValidity(null, '09:00', '2026-03-31', '18:00');
    expect(result.sales_start_date).toBeNull();
  });

  it('returns null sales_start_date when start time missing', () => {
    const result = buildAbsoluteTicketValidity('2026-03-24', null, '2026-03-31', '18:00');
    expect(result.sales_start_date).toBeNull();
  });

  it('returns null sales_end_date when end date missing', () => {
    const result = buildAbsoluteTicketValidity('2026-03-24', '09:00', null, '18:00');
    expect(result.sales_end_date).toBeNull();
  });

  it('returns null sales_end_date when end time missing', () => {
    const result = buildAbsoluteTicketValidity('2026-03-24', '09:00', '2026-03-31', null);
    expect(result.sales_end_date).toBeNull();
  });

  it('returns null for both when all inputs null', () => {
    const result = buildAbsoluteTicketValidity(null, null, null, null);
    expect(result).toEqual({
      sales_start_date: null,
      sales_end_date: null,
    });
  });
});
