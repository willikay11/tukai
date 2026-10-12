import { Experience } from '@/types/experience';
import { DurationBand } from '@/types/search';

export const DURATION_BANDS: Array<{ value: DurationBand; label: string }> = [
  { value: 'short', label: 'Up to 2 hours' },
  { value: 'medium', label: '2 to 5 hours' },
  { value: 'full', label: 'Full day' },
];

const SHORT_MAX_MINUTES = 120;
const MEDIUM_MAX_MINUTES = 300;

/**
 * Minutes between start and end, read straight off the row. A recurring
 * experience's dates describe the whole series rather than one run, so
 * there is nothing honest to read here - `null` leaves it out of every band.
 */
export const durationMinutesOf = (experience: Experience): number | null => {
  if (experience.recurrenceRule) return null;
  if (!experience.startDate || !experience.endDate) return null;

  const start = new Date(experience.startDate).getTime();
  const end = new Date(experience.endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return (end - start) / (1000 * 60);
};

/** Duration narrows experiences only - `Place` has no start or end to read. */
export const matchesDuration = (
  experience: Experience,
  band: DurationBand | undefined,
): boolean => {
  if (!band) return true;

  const minutes = durationMinutesOf(experience);
  if (minutes === null) return false;

  if (band === 'short') return minutes <= SHORT_MAX_MINUTES;
  if (band === 'medium') return minutes > SHORT_MAX_MINUTES && minutes <= MEDIUM_MAX_MINUTES;
  return minutes > MEDIUM_MAX_MINUTES;
};
