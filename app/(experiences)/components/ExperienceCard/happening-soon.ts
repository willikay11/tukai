import { Experience } from '@/types/experience';
import { nextOccurrence } from '@/utils/recurrence-utils';

/** The canvas's window: "In {city}, next 14 days". */
export const SOON_DAYS = 14;

/** The canvas shows nine, then a See All tile. */
export const SOON_LIMIT = 9;

/**
 * When an experience next happens, or null when it is over.
 *
 * A recurring experience's `start_date` is when the series began, which can be
 * months back — the rule is what says when it next runs, so that is what is
 * read. A series whose UNTIL has passed is finished and drops out.
 */
export const nextStart = (experience: Experience, now: Date): Date | null => {
  if (experience.recurrenceRule) return nextOccurrence(experience.recurrenceRule, now);

  const start = new Date(experience.startDate);
  if (Number.isNaN(start.getTime())) return null;

  // Already under way still counts as happening; finished does not
  const end = new Date(experience.endDate ?? experience.startDate);
  const finishes = Number.isNaN(end.getTime()) ? start : end;

  return finishes.getTime() >= now.getTime() ? start : null;
};

/**
 * The experiences the "Happening soon" rail shows: the soonest first, inside
 * the next fortnight, at most nine.
 *
 * ⚠️ The window is applied here rather than asked for. `GET /experiences/`
 * takes a single `date`, not a range, so there is no way to ask the API for a
 * fortnight — the rail reads a larger page and narrows it. If the city ever
 * holds more experiences than that page, one starting soon could be missed;
 * the rail would still be true about everything it shows.
 */
export const happeningSoon = (experiences: Experience[], now: Date = new Date()): Experience[] => {
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + SOON_DAYS);

  return experiences
    .map((experience) => ({ experience, at: nextStart(experience, now) }))
    .filter(
      (entry): entry is { experience: Experience; at: Date } =>
        entry.at !== null && entry.at.getTime() <= horizon.getTime(),
    )
    .sort((left, right) => left.at.getTime() - right.at.getTime())
    .slice(0, SOON_LIMIT)
    .map((entry) => entry.experience);
};
