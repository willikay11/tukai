import type { CreateExperienceTicket } from '@/types/experience';
import type { Ticket } from '@/types/ticket';
import type { Reservation, TicketPurchase } from '@/types/ticket-purchase';

export type RelativeUnit = 'hour' | 'day' | 'week';
export type ApiTicketUnit = 'days' | 'hours' | 'minutes';
export type ApiTicketCondition = 'before_start' | 'before_end';

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * The buyer amount the API sent, or null when the payload carries none —
 * locally built draft tickets, and any ticket saved before the field existed.
 * Use this where the caller needs to tell "no buyer price" apart from a price
 * of zero; use getTicketBuyerPrice where a number is all that is needed.
 */
export const getTicketBuyerAmount = (
  ticket: Pick<Ticket, 'buyerPrice' | 'buyer_price'>,
): number | null => toNumber((ticket.buyerPrice ?? ticket.buyer_price)?.amount);

/**
 * The amount a buyer is charged for one ticket. `buyer_price` is computed by the
 * API from the experience's fees_allocation, so anything shown to or totalled
 * for a buyer must use it rather than `price` (the host's base amount), which
 * is what remains as the fallback.
 */
export const getTicketBuyerPrice = (
  ticket: Pick<Ticket, 'price' | 'buyerPrice' | 'buyer_price'>,
): number => getTicketBuyerAmount(ticket) ?? toNumber(ticket.price) ?? 0;

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

/**
 * The ticket-purchases API returns one record per individual ticket. The
 * Reserved tab shows one card per outing, so purchases are grouped by
 * experience + occurrence.
 *
 * Status is deliberately NOT part of the key. It used to be, which split a
 * single booking across several cards the moment one of its tickets differed —
 * 4 completed + 1 expired on the same occurrence rendered as two cards for the
 * same experience. The group now carries one merged status instead (see
 * mergeReservationStatus).
 *
 * The occurrence is identified by its start time rather than its id, so tickets
 * bought separately for the same outing still land in one card even if the API
 * hands back distinct occurrence rows.
 */
const purchaseHolderName = (purchase: TicketPurchase): string => {
  const fullName = [purchase.user?.firstName, purchase.user?.lastName].filter(Boolean).join(' ');
  return fullName || purchase.user?.displayName || '';
};

// Statuses that mean the buyer still has to do something. If any ticket in a
// group is in one of these, the whole reservation is shown that way.
const ACTION_NEEDED = new Set(['pending', 'partial']);
const USABLE = new Set(['completed', 'paid']);

/**
 * One status for a group of tickets:
 *   1. anything awaiting payment wins, so a part-paid outing never reads as paid
 *   2. otherwise, if any ticket is usable the reservation is settled — one
 *      expired ticket among four valid ones must not mark the booking expired
 *   3. otherwise keep what was already there (expired, failed, refunded…)
 */
export const mergeReservationStatus = (current: string, incoming: string): string => {
  if (ACTION_NEEDED.has(current)) return current;
  if (ACTION_NEEDED.has(incoming)) return incoming;
  if (USABLE.has(current)) return current;
  if (USABLE.has(incoming)) return incoming;
  return current;
};

export const groupTicketPurchases = (purchases: TicketPurchase[]): Reservation[] => {
  const groups = new Map<string, Reservation>();

  purchases.forEach((purchase) => {
    const occurrenceKey = purchase.occurrence?.startDate ?? purchase.occurrence?.id ?? 'none';
    const key = `${purchase.ticket.experience}|${occurrenceKey}`;
    const ticket = {
      id: purchase.id,
      ticketNumber: purchase.ticketNumber,
      qrCodeImage: purchase.qrCodeImage,
      hasPdf: Boolean(purchase.ticketPdf),
      holderName: purchaseHolderName(purchase),
      ticketType: purchase.ticket.name,
    };

    const existing = groups.get(key);
    if (existing) {
      existing.ticketCount += 1;
      existing.tickets.push(ticket);
      existing.status = mergeReservationStatus(existing.status, purchase.status);
    } else {
      groups.set(key, {
        key,
        experienceId: purchase.ticket.experience,
        occurrenceId: purchase.occurrence?.id ?? null,
        occurrenceStart: purchase.occurrence?.startDate ?? null,
        occurrenceEnd: purchase.occurrence?.endDate ?? null,
        status: purchase.status,
        ticketName: purchase.ticket.name,
        ticketCount: 1,
        tickets: [ticket],
      });
    }
  });

  return Array.from(groups.values()).sort((a, b) =>
    (a.occurrenceStart ?? '').localeCompare(b.occurrenceStart ?? ''),
  );
};
