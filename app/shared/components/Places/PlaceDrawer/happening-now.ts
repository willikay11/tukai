import { Experience } from '@/types/experience';

/**
 * Under way at `now`: started, and not yet finished.
 *
 * A recurring experience's `startDate` and `endDate` describe the whole series,
 * not the run on today, so they cannot say whether one is on now. Those are
 * left out rather than shown wrongly.
 */
export const isOngoing = (experience: Experience, now: Date = new Date()): boolean => {
  if (experience.recurrenceRule) return false;

  const start = new Date(experience.startDate).getTime();
  const end = new Date(experience.endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;

  const at = now.getTime();
  return start <= at && at < end;
};

/** The experiences on now, the one that started first leading. */
export const ongoingExperiences = (
  experiences: Experience[],
  now: Date = new Date(),
): Experience[] =>
  experiences
    .filter((experience) => isOngoing(experience, now))
    .sort(
      (left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime(),
    );
