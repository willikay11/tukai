import moment from 'moment';

import { Status } from '@/enums/status';
import { Experience, ExperienceSalesStats } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';
import { formatCurrencyAmount, moneyAmount } from '@/utils/money';

import { experienceProgress } from '../../../utils/control-center-metrics';

/**
 * Host-facing metrics for the Manage Experience dashboard.
 *
 * Ticket counts come from the experience; the money comes from its sales
 * stats (GET /experiences/{id}/sales-stats/, DEV-371). Until those load, or
 * for a co-host (who may not see them), the money figures are null and show
 * as a dash - never a made-up number.
 */
export interface ManageExperienceMetrics {
  // ─── Derived from real data ───
  ticketsSold: number;
  ticketsTotal: number;
  fillRatePercent: number;
  daysToGo: number | null;
  isSelling: boolean;

  // Distinct people who hold a purchase - counted from the purchase list
  buyers: number;

  // ─── From the sales stats; null until they load ───
  /** What buyers paid, after promo discounts */
  revenue: number | null;
  /** "KES 34,839.00", or "-" */
  revenueText: string;
  /** "KES 34.8K" for the hero's narrow stat, or "-" */
  revenueLabel: string;
  /** Host net not withdrawable yet */
  pendingPayments: number | null;
  pendingPaymentsText: string;
  /** Host net that can be withdrawn now */
  availableBalance: number | null;
  /** Tickets sold per day since the first sale */
  averageDailySales: number | null;
}

const NO_FIGURE = '-';

/** "KES 950", "KES 34.8K", "KES 1.2M" */
export const compactMoney = (amount: number, currency: string): string => {
  const abs = Math.abs(amount);
  const short =
    abs >= 1_000_000
      ? `${Number((amount / 1_000_000).toFixed(1))}M`
      : abs >= 1_000
        ? `${Number((amount / 1_000).toFixed(1))}K`
        : `${Math.round(amount)}`;
  return `${currency} ${short}`;
};

/**
 * How many different people hold a ticket, not how many tickets were sold -
 * one person buying four tickets is one buyer, so the rows are grouped by user.
 *
 * A purchase whose `user` is missing still counts as its own buyer: dropping it
 * would undercount, and collapsing them all together would undercount worse.
 */
export const countBuyers = (purchases: TicketPurchase[]): number =>
  new Set(purchases.map((purchase) => purchase.user?.id ?? `purchase:${purchase.id}`)).size;

const normalizeStatus = (status: string): string => String(status).toUpperCase();

/** The money figures, from the sales stats, or dashes without them. */
const salesFigures = (stats?: ExperienceSalesStats | null) => {
  if (!stats) {
    return {
      revenue: null,
      revenueText: NO_FIGURE,
      revenueLabel: NO_FIGURE,
      pendingPayments: null,
      pendingPaymentsText: NO_FIGURE,
      availableBalance: null,
      averageDailySales: null,
    };
  }

  const currency = stats.revenue?.currency || stats.currency;
  const revenue = moneyAmount(stats.revenue) ?? 0;
  const average = Number.parseFloat(stats.averageDailySales);

  return {
    revenue,
    revenueText: formatCurrencyAmount(stats.revenue),
    revenueLabel: compactMoney(revenue, currency),
    pendingPayments: moneyAmount(stats.pendingBalance) ?? 0,
    pendingPaymentsText: formatCurrencyAmount(stats.pendingBalance),
    availableBalance: moneyAmount(stats.availableBalance) ?? 0,
    averageDailySales: Number.isFinite(average) ? average : 0,
  };
};

export const buildManageExperienceMetrics = (
  experience: Experience | undefined,
  purchases: TicketPurchase[] = [],
  salesStats?: ExperienceSalesStats | null,
): ManageExperienceMetrics => {
  /**
   * tickets_sold and total_tickets are the host's own figures. This used to read
   * reserved_tickets_count, which is how many tickets the REQUESTING USER has
   * reserved as a buyer - on your own experience that is normally zero, so the
   * dashboard reported almost no sales and the donut barely moved.
   */
  const remaining = Number(experience?.ticketsAvailable) || 0;
  const {
    sold: ticketsSold,
    total: ticketsTotal,
    percent: fillRatePercent,
  } = experience ? experienceProgress(experience) : { sold: 0, total: 0, percent: 0 };

  const start = experience?.startDate ? moment(experience.startDate) : null;
  const daysToGo = start?.isValid() ? Math.max(start.diff(moment(), 'days'), 0) : null;

  // No isSelling field exists - inferred from the signals that do: a published
  // experience that is not sold out and still has inventory
  const isSelling =
    normalizeStatus(experience?.status ?? '') === Status.Published &&
    !experience?.isSoldOut &&
    remaining > 0;

  return {
    ticketsSold,
    ticketsTotal,
    fillRatePercent,
    daysToGo,
    isSelling,
    buyers: countBuyers(purchases),
    ...salesFigures(salesStats),
  };
};
