import { Status } from '@/enums/status';
import { Experience } from '@/types/experience';

/**
 * Shared metrics helpers for the host-facing Dashboard and the per-experience
 * manage page: parsing the API's decimal money fields, telling an owner's own
 * experience apart from one they only co-host, and a published experience's
 * sold/total/percent progress.
 */
export const toAmount = (value: { amount: string | number } | undefined): number => {
  if (!value || value.amount === null || value.amount === undefined) return 0;
  const parsed = typeof value.amount === 'string' ? parseFloat(value.amount) : value.amount;
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Whether this user actually owns the experience.
 *
 * The API's hosted_by filter also returns experiences you are a CO-HOST on, so
 * the control center was listing other people's experiences - and counting their sales
 * in the host's own figures. Ownership is the host id, not co-host membership.
 */
export const isHostedBy = (experience: Experience, userId: string | null | undefined): boolean =>
  Boolean(userId) && experience.host?.id === userId;

export const isActive = (experience: Experience): boolean =>
  experience.status === ('published' as Status) || experience.status === ('PUBLISHED' as Status);

export interface ExperienceProgress {
  sold: number;
  total: number;
  percent: number;
  isSellingFast: boolean;
}

export const experienceProgress = (experience: Experience): ExperienceProgress => {
  const sold = experience.ticketsSold ?? 0;
  const remaining = Number(experience.ticketsAvailable) || 0;
  // total_tickets is the host figure; sold + remaining is the fallback for a
  // payload that omits it
  const total = experience.totalTickets ?? experience.ticketsCreated ?? sold + remaining;
  const percent = total > 0 ? Math.min(Math.round((sold / total) * 100), 100) : 0;

  return { sold, total, percent, isSellingFast: percent >= 60 && percent < 100 };
};
