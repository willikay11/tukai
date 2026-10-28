import moment from 'moment';

import { Experience } from '@/types/experience';
import { Reservation, TicketPurchase } from '@/types/ticket-purchase';
import { coverPhotoUrl } from '@/types/photo';
import { groupTicketPurchases } from '@/utils/ticket-utils';

export type CalendarTag = 'Booked' | 'Hosting' | 'Attended';

export interface CalendarItem {
  key: string;
  experienceId: string;
  date: string;
  title: string;
  image?: string;
  place: string;
  organiser?: string;
  tag: CalendarTag;
  isPast: boolean;
}

export interface CalendarDay {
  /** Days from today; negative is past, 0 is today. */
  offset: number;
  date: string;
  count: number;
  isToday: boolean;
  isPast: boolean;
}

/** Days between two dates, ignoring time of day, in the viewer's own timezone. */
export const dayOffset = (date: string | Date, now: Date = new Date()): number =>
  moment(date).startOf('day').diff(moment(now).startOf('day'), 'days');

const placeLine = (experience?: Experience | null): string =>
  experience?.location?.name || experience?.location?.city || '';

/**
 * Who ran it: the guide for a guided tour, otherwise the organising community.
 *
 * Not `linkedUserName` for the guide - on a person, `displayName` is their
 * @handle, not a name to show here.
 */
const organiserLine = (experience?: Experience | null): string | undefined => {
  if (!experience) return undefined;

  if (experience.experienceType === 'guide_booking') {
    const name = [experience.host?.firstName, experience.host?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return name ? `Guided by ${name}` : undefined;
  }

  return experience.hostCommunity?.title;
};

/** "yesterday" or "{n} days ago", for the attended-experience review copy. */
export const attendedAgo = (date: string, now: Date = new Date()): string => {
  const ago = -dayOffset(date, now);
  return ago <= 1 ? 'yesterday' : `${ago} days ago`;
};

/**
 * One bookings calendar out of three separate records: ticket purchases carry
 * no title or photo of their own (only the experience uuid), so a reservation
 * is only shown where it also appears in `reservedExperiences`. A reservation
 * in the past is "Attended" rather than "Booked" - there is no separate
 * attendance record, so whether it happened is read off its own date.
 */
export const buildCalendarAgenda = (
  purchases: TicketPurchase[],
  reservedExperiences: Experience[],
  hostedExperiences: Experience[],
  now: Date = new Date(),
): { agenda: CalendarItem[]; days: CalendarDay[] } => {
  const experienceById = new Map(reservedExperiences.map((experience) => [experience.id, experience]));

  const booked: CalendarItem[] = groupTicketPurchases(purchases)
    .map((reservation: Reservation) => {
      const experience = experienceById.get(reservation.experienceId);
      const date = reservation.occurrenceStart ?? experience?.startDate;
      if (!experience || !date) return null;

      const isPast = dayOffset(date, now) < 0;

      return {
        key: reservation.key,
        experienceId: reservation.experienceId,
        date,
        title: experience.title,
        image: coverPhotoUrl(experience.photos),
        place: placeLine(experience),
        organiser: organiserLine(experience),
        tag: isPast ? 'Attended' : 'Booked',
        isPast,
      } as CalendarItem;
    })
    .filter((item): item is CalendarItem => item !== null);

  const hosting: CalendarItem[] = hostedExperiences
    .filter((experience) => Boolean(experience.startDate))
    .map((experience) => ({
      key: `hosting-${experience.id}`,
      experienceId: experience.id,
      date: experience.startDate,
      title: experience.title,
      image: coverPhotoUrl(experience.photos),
      place: placeLine(experience),
      tag: 'Hosting' as const,
      isPast: dayOffset(experience.startDate, now) < 0,
    }));

  const agenda = [...booked, ...hosting].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const byOffset = new Map<number, number>();
  agenda.forEach((item) => {
    const offset = dayOffset(item.date, now);
    byOffset.set(offset, (byOffset.get(offset) ?? 0) + 1);
  });

  const days: CalendarDay[] = Array.from(byOffset.entries())
    .sort(([a], [b]) => a - b)
    .map(([offset, count]) => ({
      offset,
      date: moment(now).startOf('day').add(offset, 'days').toISOString(),
      count,
      isToday: offset === 0,
      isPast: offset < 0,
    }));

  return { agenda, days };
};

/** The next day with a plan, or the most recent past one where there is none. */
export const defaultDayOffset = (days: CalendarDay[]): number => {
  const upcoming = days.find((day) => day.offset >= 0);
  if (upcoming) return upcoming.offset;

  return days.length ? days[days.length - 1].offset : 0;
};

/** Where the "Attended" stat jumps to - the most recent day with a past plan. */
export const mostRecentPastOffset = (days: CalendarDay[]): number | null => {
  const past = [...days].reverse().find((day) => day.isPast);
  return past ? past.offset : null;
};

/**
 * Up to three items from the selected day onward - not just that day's own
 * items, so picking a quiet day still shows what is coming after it.
 */
export const itemsFrom = (agenda: CalendarItem[], offset: number, now: Date = new Date()): CalendarItem[] =>
  agenda.filter((item) => dayOffset(item.date, now) >= offset).slice(0, 3);
