import moment from 'moment';

import { Status } from '@/enums/status';
import { Experience } from '@/types/experience';

/**
 * Metrics for the Creator Studio landing page.
 *
 * Revenue, tickets sold and experience counts are REAL — the experiences
 * endpoint returns per-experience host figures (tickets_sold, total_amount_sold)
 * when you own the experience, and these sum them.
 *
 * Everything in PLACEHOLDER_METRICS has NO endpoint anywhere in the API: there
 * is no payouts/withdrawals resource, no profile-view analytics, no per-month
 * revenue series, and experiences carry no rating field. They are grouped here
 * and nowhere else, so swapping each for a real source is a single edit.
 */
export const toAmount = (value: { amount: string | number } | undefined): number => {
  if (!value || value.amount === null || value.amount === undefined) return 0;
  const parsed = typeof value.amount === 'string' ? parseFloat(value.amount) : value.amount;
  return Number.isFinite(parsed) ? parsed : 0;
};

export interface StudioMetrics {
  // ─── Derived from real host data ───
  totalRevenue: number;
  currency: string;
  ticketsSold: number;
  activeExperiences: number;

  // ─── Placeholders: no endpoint ───
  revenueChangePercent: number;
  thisMonthRevenue: number;
  withdrawable: number;
  profileViews: number;
  profileViewsChangePercent: number;
  averageRating: number;
  averageRatingChange: number;
  ticketsSoldChangePercent: number;
  newActiveExperiences: number;
  monthlyRevenue: { month: string; amount: number }[];
}

/** TODO: replace once host revenue/payout/analytics endpoints exist. */
const PLACEHOLDER_METRICS = {
  revenueChangePercent: 12.4,
  profileViews: 8942,
  profileViewsChangePercent: 23.6,
  averageRating: 4.8,
  averageRatingChange: -0.1,
  ticketsSoldChangePercent: 8.1,
  newActiveExperiences: 3,
};

// No per-month revenue series exists; the chart needs eight labelled buckets
const placeholderMonthlyRevenue = (total: number): { month: string; amount: number }[] => {
  const weights = [0.72, 0.85, 0.8, 0.95, 0.93, 1.05, 1.02, 1.2];
  const base = total > 0 ? total / weights.reduce((sum, weight) => sum + weight, 0) : 0;

  return weights.map((weight, index) => ({
    month: moment()
      .subtract(weights.length - 1 - index, 'months')
      .format('MMM'),
    amount: Math.round(base * weight),
  }));
};

export const isActive = (experience: Experience): boolean =>
  experience.status === ('published' as Status) || experience.status === ('PUBLISHED' as Status);

export const buildStudioMetrics = (experiences: Experience[]): StudioMetrics => {
  const totalRevenue = experiences.reduce(
    (sum, experience) => sum + toAmount(experience.totalAmountSold),
    0,
  );
  const ticketsSold = experiences.reduce(
    (sum, experience) => sum + (experience.ticketsSold ?? 0),
    0,
  );

  return {
    totalRevenue,
    currency: experiences[0]?.priceStartsFrom?.currency ?? 'Ksh.',
    ticketsSold,
    activeExperiences: experiences.filter(isActive).length,

    ...PLACEHOLDER_METRICS,
    // Derived from the real total so the figures stay consistent with each other
    thisMonthRevenue: Math.round(totalRevenue * 0.175),
    withdrawable: Math.round(totalRevenue * 0.855),
    monthlyRevenue: placeholderMonthlyRevenue(totalRevenue),
  };
};

export interface ExperienceProgress {
  sold: number;
  total: number;
  percent: number;
  isSellingFast: boolean;
}

export const experienceProgress = (experience: Experience): ExperienceProgress => {
  const sold = experience.ticketsSold ?? 0;
  const total = experience.totalTickets ?? experience.ticketsCreated ?? 0;
  const percent = total > 0 ? Math.min(Math.round((sold / total) * 100), 100) : 0;

  return { sold, total, percent, isSellingFast: percent >= 60 && percent < 100 };
};

// Future experiences first, soonest at the top
export const upcomingExperiences = (
  experiences: Experience[],
  now: number = Date.now(),
): Experience[] =>
  experiences
    .filter((experience) => {
      if (!experience.startDate) return false;
      const start = new Date(experience.startDate).getTime();
      return !Number.isNaN(start) && start >= now;
    })
    .sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''));
