import type { CreateExperienceTicket } from '@/types/experience';

export type RelativeUnit = 'hour' | 'day' | 'week';
export type ApiTicketUnit = 'days' | 'hours' | 'minutes';
export type ApiTicketCondition = 'before_start' | 'before_end';

export const mapRelativeUnit = (unit: RelativeUnit): ApiTicketUnit => {
  const map: Record<RelativeUnit, ApiTicketUnit> = {
    hour: 'hours',
    day: 'days',
    week: 'days',
  };
  return map[unit];
};

export const mapRelativeUnitAmount = (amount: number, unit: RelativeUnit): number => {
  if (unit === 'week') return amount * 7;
  return amount;
};

export const mapAnchorToCondition = (anchor: 'start' | 'end'): ApiTicketCondition => {
  return anchor === 'start' ? 'before_start' : 'before_end';
};

/**
 * Inverse of buildRecurringTicketValidity: converts an API ticket's closing
 * fields back into the form's relative-validity shape. Returns null when any
 * field is missing. Used when hydrating an existing recurring experience.
 */
export const parseSalesEndRelativeFromTicket = (
  closingDuration: number | null | undefined,
  closingUnit: string | null | undefined,
  closingCondition: string | null | undefined,
): { amount: number; unit: RelativeUnit; anchor: 'start' | 'end' } | null => {
  if (!closingDuration || !closingUnit || !closingCondition) {
    return null;
  }

  let unit: RelativeUnit = 'day';
  if (closingUnit === 'hours') unit = 'hour';
  else if (closingUnit === 'days') unit = closingDuration > 7 ? 'week' : 'day';
  else if (closingUnit === 'minutes') unit = 'hour';

  // Collapse whole-week day counts back to weeks
  let amount = closingDuration;
  if (unit === 'day' && amount % 7 === 0 && amount > 7) {
    unit = 'week';
    amount = amount / 7;
  }

  const anchor: 'start' | 'end' = closingCondition === 'before_start' ? 'start' : 'end';

  return { amount, unit, anchor };
};

export const buildRecurringTicketValidity = (
  salesEndRelative: {
    amount: number;
    unit: RelativeUnit;
    anchor: 'start' | 'end';
  } | null,
): Pick<
  CreateExperienceTicket,
  'ticket_sales_closing_duration' | 'ticket_sales_closing_unit' | 'ticket_sales_closing_condition'
> => {
  if (!salesEndRelative) {
    return {
      ticket_sales_closing_duration: null,
      ticket_sales_closing_unit: null,
      ticket_sales_closing_condition: null,
    };
  }

  return {
    ticket_sales_closing_duration: mapRelativeUnitAmount(
      salesEndRelative.amount,
      salesEndRelative.unit,
    ),
    ticket_sales_closing_unit: mapRelativeUnit(salesEndRelative.unit),
    ticket_sales_closing_condition: mapAnchorToCondition(salesEndRelative.anchor),
  };
};

export const buildAbsoluteTicketValidity = (
  salesStartDate: string | null,
  salesStartTime: string | null,
  salesEndDate: string | null,
  salesEndTime: string | null,
): Pick<CreateExperienceTicket, 'sales_start_date' | 'sales_end_date'> => {
  const buildDateTime = (date: string | null, time: string | null): string | null => {
    if (!date || !time) return null;
    return `${date}T${time}:00`;
  };

  return {
    sales_start_date: buildDateTime(salesStartDate, salesStartTime),
    sales_end_date: buildDateTime(salesEndDate, salesEndTime),
  };
};
