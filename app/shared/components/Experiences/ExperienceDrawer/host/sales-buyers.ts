import { TicketPurchase } from '@/types/ticket-purchase';

export type BuyerStub = {
  key: string;
  ticketName: string;
  qty: number;
  amount: number;
  at: string;
  code: string | null;
  ticketNumber: string;
};

export type Buyer = {
  key: string;
  name: string;
  picture?: string | null;
  qty: number;
  amount: number;
  stubs: BuyerStub[];
};

export type SalesSummary = {
  total: number;
  ticketsSold: number;
  buyers: number;
  pending: number;
};

const purchasePrice = (purchase: TicketPurchase): number => parseFloat(purchase.ticket?.price ?? '0') || 0;

const buyerName = (purchase: TicketPurchase): string =>
  purchase.user?.displayName ||
  [purchase.user?.firstName, purchase.user?.lastName].filter(Boolean).join(' ') ||
  'Guest';

const latestOf = (purchases: TicketPurchase[]): TicketPurchase =>
  purchases.reduce((latest, purchase) =>
    new Date(purchase.dateCreated) > new Date(latest.dateCreated) ? purchase : latest,
  );

const groupBy = <T>(items: T[], key: (item: T) => string): Map<string, T[]> => {
  const groups = new Map<string, T[]>();
  items.forEach((item) => {
    const k = key(item);
    groups.set(k, [...(groups.get(k) ?? []), item]);
  });
  return groups;
};

/**
 * Groups one experience's purchases into buyers (sales_handoff's own open
 * item #8 leaves this undecided; grouping by person is the standing
 * decision `SalesTab`, the old manage-experience page's equivalent,
 * already shipped) and, within each buyer, into one stub per ticket type
 * they hold. Only `completed` purchases count as a sale - `pending` ones
 * feed `pending` below instead, since they haven't sold yet.
 */
export const buildSalesData = (
  purchases: TicketPurchase[],
): { summary: SalesSummary; buyers: Buyer[] } => {
  const completed = purchases.filter((purchase) => purchase.status === 'completed');
  const pending = purchases.filter((purchase) => purchase.status === 'pending');

  const buyerGroups = groupBy(completed, (purchase) => purchase.user?.id ?? `purchase:${purchase.id}`);

  const buyers: (Buyer & { latestAt: string })[] = Array.from(buyerGroups.values()).map((group) => {
    const first = group[0];
    const stubGroups = groupBy(group, (purchase) => purchase.ticket.id);

    const stubs: BuyerStub[] = Array.from(stubGroups.values())
      .map((stubPurchases) => {
        const latest = latestOf(stubPurchases);
        return {
          key: latest.ticket.id,
          ticketName: latest.ticket.name,
          qty: stubPurchases.length,
          amount: stubPurchases.reduce((sum, purchase) => sum + purchasePrice(purchase), 0),
          at: latest.dateCreated,
          code: latest.qrCodeImage,
          ticketNumber: latest.ticketNumber,
        };
      })
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return {
      key: first.user?.id ?? `purchase:${first.id}`,
      name: buyerName(first),
      picture: first.user?.picture,
      qty: group.length,
      amount: stubs.reduce((sum, stub) => sum + stub.amount, 0),
      stubs,
      latestAt: latestOf(group).dateCreated,
    };
  });

  buyers.sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());

  return {
    summary: {
      total: completed.reduce((sum, purchase) => sum + purchasePrice(purchase), 0),
      ticketsSold: completed.length,
      buyers: buyers.length,
      pending: pending.reduce((sum, purchase) => sum + purchasePrice(purchase), 0),
    },
    buyers,
  };
};
