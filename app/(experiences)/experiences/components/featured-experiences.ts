import { Experience } from '@/types/experience';

/**
 * How many experiences are read before filtering to the featured ones.
 * `GET /experiences/` has no `featured` param, so the rail can only see what
 * one page holds.
 */
export const FEATURED_PAGE_SIZE = 50;

/**
 * The experiences the editors have featured, in the order the API returns
 * them. Anything without the flag is left out, so nothing is shown as
 * featured that was not chosen.
 */
export const featuredOnly = (experiences: Experience[]): Experience[] =>
  experiences.filter((experience) => experience.featured === true);
