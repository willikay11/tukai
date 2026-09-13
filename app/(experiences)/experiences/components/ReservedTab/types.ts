import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { Reservation, ReservationTicket } from '@/types/ticket-purchase';
import { mergeReservationStatus } from '@/utils/ticket-utils';

// A reservation joined with its experience. The purchases endpoint only carries
// the experience uuid, so title, cover, community and price come from the
// separately-fetched reserved experiences.
export interface ReservationView {
  key: string;
  experienceId: string;
  title: string;
  coverPhoto: string | null;
  communityName: string | null;
  start: string | null;
  end: string | null;
  status: string;
  ticketCount: number;
  tickets: ReservationTicket[];
  // Reservation carries no price, so "from X" comes from the experience
  priceAmount: number | null;
  currency: string | null;
}

// 'completed' and 'paid' are settled; everything else (pending, partial,
// expired, failed…) still needs the buyer to act
export const isSettled = (status: string): boolean => status === 'completed' || status === 'paid';

export const toReservationView = (
  reservation: Reservation,
  experiences: Experience[],
): ReservationView => {
  const experience = experiences.find((item) => item.id === reservation.experienceId);
  const coverPhoto =
    experience?.photos?.find((photo: Photo) => photo.isCover)?.photo ||
    experience?.photos?.[0]?.photo ||
    null;

  return {
    key: reservation.key,
    experienceId: reservation.experienceId,
    title: experience?.title ?? reservation.ticketName,
    coverPhoto,
    communityName: experience?.hostCommunity?.title ?? null,
    start: reservation.occurrenceStart,
    end: reservation.occurrenceEnd,
    status: reservation.status,
    ticketCount: reservation.ticketCount,
    tickets: reservation.tickets,
    priceAmount: experience?.priceStartsFrom?.amount ?? null,
    currency: experience?.priceStartsFrom?.currency ?? null,
  };
};

export const isUpcoming = (item: ReservationView, now: number = Date.now()): boolean => {
  if (!item.start) return false;
  const start = new Date(item.start).getTime();
  return !Number.isNaN(start) && start >= now;
};

/**
 * One card per reserved EXPERIENCE.
 *
 * The upcoming cards used to be built from ticket purchases, which the API
 * returns one row per ticket and which we group per occurrence — so an
 * experience booked on several dates produced several cards for the same
 * experience. The experiences endpoint already reports reserved_tickets_count
 * and reserved_tickets_amount per experience, so that is the honest source for
 * "your upcoming experiences", and it also gives the amount actually paid
 * rather than the experience's from-price.
 *
 * Purchases are still used for the ticket modal and for the calendar, which is
 * date-based and legitimately shows one row per occurrence.
 */
export interface ExperienceReservationView {
  key: string;
  experienceId: string;
  title: string;
  coverPhoto: string | null;
  communityName: string | null;
  start: string | null;
  end: string | null;
  status: string;
  ticketCount: number;
  tickets: ReservationTicket[];
  paidAmount: number | null;
  currency: string | null;
}

const toAmount = (value: string | number | undefined): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};

export const toExperienceReservationViews = (
  experiences: Experience[],
  reservations: Reservation[],
  now: number = Date.now(),
): ExperienceReservationView[] =>
  experiences.map((experience) => {
    const forExperience = reservations.filter((item) => item.experienceId === experience.id);

    // The soonest occurrence still ahead, falling back to the earliest booked
    // one, then to the experience's own start date
    const futureStarts = forExperience
      .map((item) => item.occurrenceStart)
      .filter((start): start is string => Boolean(start))
      .sort();
    const nextStart =
      futureStarts.find((start) => new Date(start).getTime() >= now) ??
      futureStarts[0] ??
      experience.startDate ??
      null;
    const matching = forExperience.find((item) => item.occurrenceStart === nextStart);

    const coverPhoto =
      experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
      experience.photos?.[0]?.photo ||
      null;

    return {
      key: experience.id,
      experienceId: experience.id,
      title: experience.title,
      coverPhoto,
      communityName: experience.hostCommunity?.title ?? null,
      start: nextStart,
      end: matching?.occurrenceEnd ?? experience.endDate ?? null,
      // Every ticket the user holds for this experience, whatever the date
      status: forExperience.reduce<string>(
        (current, item) => (current ? mergeReservationStatus(current, item.status) : item.status),
        '',
      ),
      ticketCount: experience.reservedTicketsCount ?? forExperience.length,
      tickets: forExperience.flatMap((item) => item.tickets),
      paidAmount: toAmount(experience.reservedTicketsAmount?.amount),
      currency:
        experience.reservedTicketsAmount?.currency ?? experience.priceStartsFrom?.currency ?? null,
    };
  });

export const isExperienceUpcoming = (
  item: ExperienceReservationView,
  now: number = Date.now(),
): boolean => {
  if (!item.end && !item.start) return false;
  // An experience runs until its end date, so a multi-day trip already under
  // way is still "upcoming" rather than history
  const boundary = new Date(item.end ?? item.start!).getTime();
  return !Number.isNaN(boundary) && boundary >= now;
};

// A reservation that is over: it has a date, and that date has passed. Kept
// visible in its own section so nothing a user booked silently disappears —
// the alternative was reaching it only by paging the calendar back a month.
export const isExperiencePast = (
  item: ExperienceReservationView,
  now: number = Date.now(),
): boolean => Boolean(item.end ?? item.start) && !isExperienceUpcoming(item, now);
