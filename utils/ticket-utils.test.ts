import { parseSnakeToCamel } from './parseSnakeToCamel';
import {
  buildAbsoluteTicketValidity,
  buildRecurringTicketValidity,
  mapAnchorToCondition,
  mapRelativeUnit,
  mapRelativeUnitAmount,
  parseSalesEndRelativeFromTicket,
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

describe('parseSalesEndRelativeFromTicket', () => {
  it('converts hours to an hour-anchored relative value', () => {
    expect(parseSalesEndRelativeFromTicket(1, 'hours', 'before_start')).toEqual({
      amount: 1,
      unit: 'hour',
      anchor: 'start',
    });
  });

  it('converts a small day count to days with end anchor', () => {
    expect(parseSalesEndRelativeFromTicket(3, 'days', 'before_end')).toEqual({
      amount: 3,
      unit: 'day',
      anchor: 'end',
    });
  });

  it('returns null when any field is missing', () => {
    expect(parseSalesEndRelativeFromTicket(null, 'hours', 'before_start')).toBeNull();
    expect(parseSalesEndRelativeFromTicket(1, null, 'before_start')).toBeNull();
    expect(parseSalesEndRelativeFromTicket(1, 'hours', null)).toBeNull();
  });

  it('round-trips a form value through build → parse', () => {
    const built = buildRecurringTicketValidity({ amount: 2, unit: 'hour', anchor: 'start' });
    expect(
      parseSalesEndRelativeFromTicket(
        built.ticket_sales_closing_duration,
        built.ticket_sales_closing_unit,
        built.ticket_sales_closing_condition,
      ),
    ).toEqual({ amount: 2, unit: 'hour', anchor: 'start' });
  });

  it('reads the camelCase keys that parseSnakeToCamel produces (the hydration bug)', () => {
    // The experience fetch runs parseSnakeToCamel, so the ticket arrives camelCased.
    // This proves the field names the hydration reads actually exist post-transform.
    const apiTicket = {
      ticket_sales_closing_duration: 1,
      ticket_sales_closing_unit: 'hours',
      ticket_sales_closing_condition: 'before_start',
    };
    const camel = parseSnakeToCamel(apiTicket) as {
      ticketSalesClosingDuration: number;
      ticketSalesClosingUnit: string;
      ticketSalesClosingCondition: string;
    };

    expect(camel.ticketSalesClosingDuration).toBe(1);
    expect(camel.ticketSalesClosingUnit).toBe('hours');
    expect(camel.ticketSalesClosingCondition).toBe('before_start');

    // The old code read snake_case keys, which are undefined post-transform → null.
    expect(
      parseSalesEndRelativeFromTicket(
        (camel as any).ticket_sales_closing_duration,
        (camel as any).ticket_sales_closing_unit,
        (camel as any).ticket_sales_closing_condition,
      ),
    ).toBeNull();

    // The fix reads camelCase keys → a real relative value.
    expect(
      parseSalesEndRelativeFromTicket(
        camel.ticketSalesClosingDuration,
        camel.ticketSalesClosingUnit,
        camel.ticketSalesClosingCondition,
      ),
    ).toEqual({ amount: 1, unit: 'hour', anchor: 'start' });
  });
});
