import moment from 'moment';

import { Status } from '@/enums/status';
import { Experience } from '@/types/experience';

/**
 * Host-facing metrics for the Manage Experience dashboard.
 *
 * Some of these are real — derived from the fetched experience. Others have NO
 * backing endpoint anywhere in the API (there is no revenue, earnings, payout
 * or pending-payments resource), so they are placeholders until one exists.
 * Every placeholder is listed in PLACEHOLDER_METRICS below and nowhere else, so
 * swapping in a real endpoint is a single edit.
 */
export interface ManageExperienceMetrics {
  // ─── Derived from real data ───
  ticketsSold: number;
  ticketsTotal: number;
  fillRatePercent: number;
  daysToGo: number | null;
  isSelling: boolean;

  // ─── Placeholders: no endpoint ───
  revenue: number;
  revenueLabel: string;
  buyers: number;
  pendingPayments: number;
  averageDailySales: number;
}

/**
 * TODO: replace once host revenue/payout endpoints exist. Values mirror the
 * design so the dashboard reads correctly in review.
 */
const PLACEHOLDER_METRICS = {
  revenue: 34839,
  revenueLabel: 'Ksh 34.8K',
  buyers: 80,
  pendingPayments: 78238,
  averageDailySales: 4,
};

const normalizeStatus = (status: string): string => String(status).toUpperCase();

export const buildManageExperienceMetrics = (
  experience: Experience | undefined,
): ManageExperienceMetrics => {
  const ticketsSold = experience?.reservedTicketsCount ?? 0;
  const remaining = Number(experience?.ticketsAvailable) || 0;
  const ticketsTotal = ticketsSold + remaining;

  const fillRatePercent = ticketsTotal > 0 ? Math.round((ticketsSold / ticketsTotal) * 100) : 0;

  const start = experience?.startDate ? moment(experience.startDate) : null;
  const daysToGo = start?.isValid() ? Math.max(start.diff(moment(), 'days'), 0) : null;

  // No isSelling field exists — inferred from the signals that do: a published
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
    ...PLACEHOLDER_METRICS,
  };
};
