import moment from 'moment';

import { Experience } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';

export interface BookingConfirmation {
  reference: string;
  experience: {
    title: string;
    thumbnail: string;
    // ISO date; times are display strings as the confirmation presents them
    date: string;
    startTime: string;
    endTime: string;
  };
  lineItems: Array<{
    label: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  amountPaid: number;
  currency: string;
  paidAt: string;
  // Keyed to PaymentStatusBadge's status map
  status: string;
}

/**
 * The purchases that belong to one checkout.
 *
 * "The purchase is the ticket", so buying three tickets creates three rows.
 * They are gathered by occurrence and by the second they were created in —
 * the API exposes no order id on a purchase, so the timestamp is what ties a
 * batch together.
 */
export const purchasesFromSameCheckout = (
  purchases: TicketPurchase[],
  reference: string | null,
  // The purchase the page was opened for, when the URL named one — it is the
  // most reliable anchor there is
  named?: TicketPurchase,
): TicketPurchase[] => {
  if (purchases.length === 0) return [];

  const byReference = reference
    ? purchases.filter(
        (purchase) => purchase.ticketNumber === reference || purchase.id === reference,
      )
    : [];

  const newest = [...purchases].sort((a, b) =>
    moment(b.dateCreated).diff(moment(a.dateCreated)),
  )[0];
  const anchor = named ?? byReference[0] ?? newest;

  return purchases.filter(
    (purchase) =>
      purchase.occurrence?.id === anchor.occurrence?.id &&
      Math.abs(moment(purchase.dateCreated).diff(moment(anchor.dateCreated), 'seconds')) <= 60,
  );
};

/** One line per ticket type, with the quantity bought of it. */
const toLineItems = (purchases: TicketPurchase[]): BookingConfirmation['lineItems'] => {
  const byTicket = new Map<string, { label: string; quantity: number; unitPrice: number }>();

  purchases.forEach((purchase) => {
    const label = purchase.ticket?.name ?? 'Ticket';
    const unitPrice = Number(purchase.ticket?.price ?? 0);
    const existing = byTicket.get(label);

    byTicket.set(label, {
      label,
      unitPrice,
      quantity: (existing?.quantity ?? 0) + 1,
    });
  });

  return Array.from(byTicket.values()).map((line) => ({
    ...line,
    lineTotal: line.unitPrice * line.quantity,
  }));
};

export const toConfirmation = (
  purchases: TicketPurchase[],
  experience: Experience | undefined,
  reference: string | null,
): BookingConfirmation | null => {
  if (purchases.length === 0) return null;

  const [first] = purchases;
  const lineItems = toLineItems(purchases);
  const start = first.occurrence?.startDate ?? experience?.startDate;
  const end = first.occurrence?.endDate ?? experience?.endDate;

  return {
    // The payment reference the buyer arrived with, falling back to the ticket
    // number — both are what support would ask them for
    reference: reference || first.ticketNumber,
    experience: {
      title: experience?.title ?? 'Your experience',
      // Cover first, then whatever the experience leads with — an experience
      // whose photos carry no isCover flag was showing nothing at all
      thumbnail:
        experience?.photos?.find((photo) => photo.isCover)?.photo ||
        experience?.photos?.[0]?.photo ||
        '',
      date: start ? moment(start).format('YYYY-MM-DD') : '',
      startTime: start ? moment(start).format('h:mm A') : '',
      endTime: end ? moment(end).format('h:mm A') : '',
    },
    lineItems,
    amountPaid: lineItems.reduce((sum, line) => sum + line.lineTotal, 0),
    currency: first.ticket?.currency || experience?.currency || 'Ksh.',
    paidAt: first.dateCreated,
    status: first.status,
  };
};
