import moment from 'moment';

import { Experience } from '@/types/experience';
import { Ticket, isTicketPaused } from '@/types/ticket';
import { experiencePath } from '@/utils/detail-paths';
import { currencyFullName } from '@/utils/money';

/**
 * The seven figures the canvas shows under a ticket type, in its order and
 * with its labels. The last one spans the row.
 *
 * `full` is that span. The value a paused type shows in that place is not the
 * expiry but the words "Paused" — a host wants to know sales are off before
 * they read anything else about when they would have ended.
 */
export type TicketStat = { label: string; value: string; full?: boolean };

/** The API reports the total created and how many remain; buyers hold the rest. */
export const ticketsSold = (ticket: Ticket): number =>
  Math.max((Number(ticket.quantity) || 0) - (Number(ticket.availableQuantity) || 0), 0);

export const ticketPrice = (ticket: Ticket): number => parseFloat(String(ticket.price)) || 0;

export const ticketStats = (ticket: Ticket, currency: string): TicketStat[] => {
  const created = Number(ticket.quantity) || 0;
  const available = Number(ticket.availableQuantity) || 0;
  const sold = ticketsSold(ticket);
  const price = ticketPrice(ticket);
  const money = (amount: number) => `${currency} ${Math.round(amount).toLocaleString('en-US')}`;

  return [
    { label: 'Ticket currency', value: currencyFullName(currency) },
    { label: 'Tickets created', value: String(created) },
    // A free ticket says so rather than showing a zero
    { label: 'Amount per ticket', value: price ? money(price) : 'Free' },
    { label: 'Tickets sold', value: String(sold) },
    // Gross of any fees or refunds — there is no revenue endpoint to net it
    { label: 'Amount sold', value: money(sold * price) },
    { label: 'Available tickets', value: String(available) },
    isTicketPaused(ticket)
      ? { label: 'Ticket sales', value: 'Paused', full: true }
      : {
          label: 'Estimated sales expiry',
          value: ticket.salesEndDate
            ? moment(ticket.salesEndDate).format('D MMM YYYY, h:mm A')
            : '—',
          full: true,
        },
  ];
};

/**
 * The canvas lists the types that are on sale first and gathers the paused ones
 * under their own heading, rather than mixing the two.
 */
export const splitBySales = (tickets: Ticket[]) => ({
  active: tickets.filter((ticket) => !isTicketPaused(ticket)),
  paused: tickets.filter(isTicketPaused),
});

/**
 * The link a host shares to sell a ticket type.
 *
 * There is no per-ticket page, and no per-ticket link on the API: tickets are
 * chosen on the experience's own page. So this is that page's link, and what is
 * said about it names the type without pretending it points straight at it.
 */
export const ticketShareLink = (experience: Pick<Experience, 'id' | 'slug'>): string =>
  `${process.env.NEXT_PUBLIC_APP_URL ?? ''}${experiencePath(experience)}`;

export const ticketShareMessage = (ticket: Ticket, experienceTitle: string): string =>
  `${ticket.name} is on sale on the ${experienceTitle} page.`;
