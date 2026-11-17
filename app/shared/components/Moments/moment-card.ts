import { Moment, momentAuthorName, momentContext, momentPhotos } from '@/types/moment';

/**
 * The moment's own words.
 *
 * `description` is the caption and `title` the short label above it; a moment
 * posted with only a title still has something to show, which is why the
 * detail page reads them in this order too.
 */
export const momentCaption = (moment: Pick<Moment, 'title' | 'description'>): string =>
  moment.description?.trim() || moment.title?.trim() || '';

/** "2 Oct" - the compact form the byline uses under an author's name. */
export const momentDate = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/**
 * What a screen reader hears for a moment's photo: "Moment by Amina Njeri at
 * Nairobi Makers Circle: First bowl off the wheel.", or "3 photos by..." for an
 * album.
 *
 * The photo itself carries `alt=""`, since this label already says it. The
 * full name everywhere - the canvas used the first name on the rail's tiles
 * only, which its own notes flag as a slip.
 */
export const momentLabel = (
  moment: Pick<
    Moment,
    'author' | 'title' | 'description' | 'media' | 'community' | 'experience' | 'place'
  >,
  { isYours = false }: { isYours?: boolean } = {},
): string => {
  const photoCount = momentPhotos(moment).length;
  const context = momentContext(moment);
  const caption = momentCaption(moment);

  const lead = photoCount > 1 ? `${photoCount} photos by` : 'Moment by';
  const at = context ? ` at ${context.label}` : '';

  // "Yours" is drawn over the photo, so it has to be said here too
  return `${lead} ${momentAuthorName(moment.author)}${at}${caption ? `: ${caption}` : ''}${
    isYours ? ', yours' : ''
  }`;
};
