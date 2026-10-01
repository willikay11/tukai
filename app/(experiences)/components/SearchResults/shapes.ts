import { Experience } from '@/types/experience';

/**
 * The four shapes the canvas lets a reader pick between.
 *
 * ⚠️ Only `itinerary` is something the API filters on. "One day", "Recurring"
 * and "Multi-day" describe how an experience sits in the calendar — a
 * recurrence rule, or a start and end on different days — and no endpoint takes
 * either as a parameter. They are applied to the rows that come back instead,
 * and the counts shown are counted from the same rows, so the number and the
 * list always agree.
 */
export type ExperienceShape = 'one' | 'recurring' | 'multi' | 'itinerary';

export const EXPERIENCE_SHAPES: Array<{
  value: ExperienceShape;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'one',
    label: 'One day',
    description: 'Happens once, on a single day',
    icon: 'Calendar03Icon',
  },
  { value: 'recurring', label: 'Recurring', description: 'Runs every week', icon: 'RepeatIcon' },
  {
    value: 'multi',
    label: 'Multi-day',
    description: 'Two days or more, one booking',
    icon: 'Calendar02Icon',
  },
  {
    value: 'itinerary',
    label: 'Itinerary',
    description: 'Several places in one plan',
    icon: 'Route01Icon',
  },
];

const onDifferentDays = (experience: Experience): boolean => {
  if (!experience.startDate || !experience.endDate) return false;

  return experience.startDate.slice(0, 10) !== experience.endDate.slice(0, 10);
};

export const shapeOf = (experience: Experience): ExperienceShape => {
  if (experience.experienceType === 'itinerary') return 'itinerary';
  // A recurrence rule is what makes it recurring, whatever its dates say
  if (experience.recurrenceRule) return 'recurring';

  return onDifferentDays(experience) ? 'multi' : 'one';
};

/** No shapes picked means every shape. */
export const matchesShapes = (experience: Experience, shapes: string[]): boolean =>
  shapes.length === 0 || shapes.includes(shapeOf(experience));

/** The only shape the API itself can narrow by, so the query can be smaller. */
export const apiExperienceType = (shapes: string[]): string | undefined =>
  shapes.length === 1 && shapes[0] === 'itinerary' ? 'itinerary' : undefined;
