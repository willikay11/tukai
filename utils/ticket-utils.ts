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
