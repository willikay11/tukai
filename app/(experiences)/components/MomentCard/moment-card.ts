import { Moment } from '@/types/moment';

/**
 * The moment's own words.
 *
 * `description` is the caption and `title` the short label above it; a moment
 * posted with only a title still has something to show, which is why the
 * detail page reads them in this order too.
 */
export const momentCaption = (moment: Pick<Moment, 'title' | 'description'>): string =>
  moment.description?.trim() || moment.title?.trim() || '';

/** "2 Oct" — the compact form the byline uses under an author's name. */
export const momentDate = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
