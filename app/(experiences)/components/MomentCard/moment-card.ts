import { Moment, momentAuthorName } from '@/types/moment';

/** Where the canvas cuts a caption on a grid card. */
export const PREVIEW_LENGTH = 74;

/**
 * The moment's own words.
 *
 * `description` is the caption and `title` the short label above it; a moment
 * posted with only a title still has something to show, which is why the
 * detail page reads them in this order too.
 */
export const momentCaption = (moment: Pick<Moment, 'title' | 'description'>): string =>
  moment.description?.trim() || moment.title?.trim() || '';

/** The caption, cut to one card's worth. */
export const momentPreview = (moment: Pick<Moment, 'title' | 'description'>): string => {
  const caption = momentCaption(moment);
  return caption.length > PREVIEW_LENGTH ? `${caption.slice(0, PREVIEW_LENGTH)}...` : caption;
};

/** "2 Oct" — the compact form the canvas puts in a byline. */
export const momentDate = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/** "Amina · 2 Oct", or just the name when the date cannot be read. */
export const momentByline = (moment: Pick<Moment, 'author' | 'dateCreated'>): string =>
  [momentAuthorName(moment.author), momentDate(moment.dateCreated)].filter(Boolean).join(' · ');
