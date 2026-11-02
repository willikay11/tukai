import type { Community } from '@/types/community';
import type { Experience } from '@/types/experience';
import type { Location } from '@/types/location';
import { Moment, momentAuthorName, momentContext, momentPhotos } from '@/types/moment';
import { Photo, coverPhotoUrl } from '@/types/photo';
import type { Place } from '@/types/place';
import { canvasIcon } from '@/utils/canvas-icons';
import { moneyAmount } from '@/utils/money';
import { APP_ORIGIN } from '@/utils/share-metadata';

/**
 * What the share sheet says about one thing: the photo and pill over the top,
 * the title block, the link, and the note on who that link works for.
 *
 * Built once per kind below, from the design handoff's "What it says for each
 * kind" tables, so the sheet itself never branches on what it is showing.
 */
export type ShareContent = {
  /** The dialog's accessible name - "Share place" */
  heading: string;
  /** The pill over the photo - "Place", "Private community" */
  kind: string;
  /** An IconComponent name, for the pill */
  kindIcon: string;
  image?: string;
  title: string;
  sub: string;
  /** The absolute link, `https://tukai.co/p/{slug}` */
  url: string;
  /** The message's opening and the email subject - "The Roastery on Tukai" */
  lead: string;
  /** Switches the note's icon to the lock */
  isPrivate: boolean;
  note: string;
};

/**
 * The short link for one thing. `/p`, `/e` and `/c` are routes of their own
 * that land on Discover with the drawer open (app/(experiences)/p and its
 * siblings); `/m` redirects to the Moments page with the moment open.
 *
 * The slug where the record has one, as the detail paths use, falling back to
 * the id; the routes resolve either. Moments have no slug, so they use the id.
 */
const shareUrl = (type: 'p' | 'e' | 'c' | 'm', record: { id: string; slug?: string }) =>
  `${APP_ORIGIN}/${type}/${record.slug || record.id}`;

const joinDot = (parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' · ');

/** "Westlands" - the first part of the locality, as the handoff asks. */
const areaOf = (location?: Partial<Location> | null) =>
  location?.city?.trim() || location?.formattedAddress?.split(',')[0]?.trim() || undefined;

const time12 = (date: Date) => {
  const hours = date.getHours();
  return `${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
};

const day = (date: Date) =>
  date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/**
 * "Sat 24 Oct, 9:00 AM - 5:00 PM". An experience that runs past midnight names
 * its end day too, so the range never reads as ending before it starts.
 */
export const shareWhen = (start?: string | null, end?: string | null): string | undefined => {
  if (!start) return undefined;

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return undefined;

  const endDate = end ? new Date(end) : null;
  if (!endDate || Number.isNaN(endDate.getTime())) return `${day(startDate)}, ${time12(startDate)}`;

  const sameDay = startDate.toDateString() === endDate.toDateString();

  return sameDay
    ? `${day(startDate)}, ${time12(startDate)} - ${time12(endDate)}`
    : `${day(startDate)}, ${time12(startDate)} - ${day(endDate)}, ${time12(endDate)}`;
};

/** "KES 2,000", or "Free" */
const sharePrice = (experience: Partial<Pick<Experience, 'isPaid' | 'priceStartsFrom'>>) => {
  const amount = moneyAmount(experience.priceStartsFrom);
  if (experience.isPaid === false || amount === 0) return 'Free';
  if (amount === null) return undefined;

  return `${experience.priceStartsFrom?.currency ?? 'KES'} ${amount.toLocaleString('en-US')}`;
};

export const placeShare = (
  place: Pick<Place, 'id' | 'title'> & {
    slug?: string;
    photos?: Photo[];
    categories?: Place['categories'];
    location?: Partial<Location> | null;
  },
): ShareContent => ({
  heading: 'Share place',
  kind: 'Place',
  kindIcon: canvasIcon('hgi-location-01')!,
  image: coverPhotoUrl(place.photos, 'md'),
  title: place.title,
  sub: joinDot([place.categories?.[0]?.name, areaOf(place.location)]),
  url: shareUrl('p', place),
  lead: `${place.title} on Tukai`,
  isPrivate: false,
  note: `Anyone with the link can see ${place.title}, its hours and what is on there.`,
});

export const experienceShare = (
  experience: Pick<Experience, 'id' | 'title'> &
    Partial<
      Pick<
        Experience,
        | 'photos'
        | 'startDate'
        | 'endDate'
        | 'isPublic'
        | 'isPaid'
        | 'priceStartsFrom'
        | 'experienceType'
        | 'slug'
      >
    > & {
      /** A cover already resolved by the caller, where it has no photos array */
      image?: string | null;
    },
): ShareContent => {
  const isItinerary = experience.experienceType === 'itinerary';
  // Only an explicit false: a caller without the flag shares the public note,
  // and the link still checks access when it is opened
  const isPrivate = experience.isPublic === false;
  const when = shareWhen(experience.startDate, experience.endDate);

  return {
    heading: isItinerary ? 'Share itinerary' : 'Share experience',
    kind: isItinerary ? 'Itinerary' : 'Experience',
    kindIcon: canvasIcon('hgi-calendar-03')!,
    image: experience.image || coverPhotoUrl(experience.photos, 'md'),
    title: experience.title,
    sub: joinDot([when, sharePrice(experience)]),
    url: shareUrl('e', experience),
    lead: `${experience.title}${when ? `, ${when}` : ''} on Tukai`,
    isPrivate,
    note: isPrivate
      ? 'Only invited guests can open this link. A forwarded link grants nothing.'
      : 'Anyone with the link can see the details. Sharing never books a seat.',
  };
};

export const communityShare = (
  community: Pick<Community, 'id' | 'title' | 'isPublic'> &
    Partial<Pick<Community, 'slug' | 'photos' | 'location' | 'membersCount' | 'members'>>,
): ShareContent => {
  const isPrivate = !community.isPublic;
  const count = community.membersCount ?? community.members?.length;

  return {
    heading: 'Share community',
    kind: isPrivate ? 'Private community' : 'Community',
    kindIcon: canvasIcon(isPrivate ? 'hgi-square-lock-02' : 'hgi-user-multiple')!,
    image: coverPhotoUrl(community.photos, 'md'),
    title: community.title,
    sub: joinDot([
      count === undefined ? null : `${count} ${count === 1 ? 'member' : 'members'}`,
      areaOf(community.location),
    ]),
    url: shareUrl('c', community),
    lead: `${community.title} on Tukai`,
    isPrivate,
    note: isPrivate
      ? 'Only members can open this link. To bring someone in, invite them from the community.'
      : `Anyone with the link can see ${community.title} and join. Joining is instant.`,
  };
};

/**
 * `privateCommunity` is the moment's community where the caller knows it is
 * private: the moment itself only carries the community's id and title.
 */
export const momentShare = (
  moment: Moment,
  privateCommunity?: { title: string } | null,
): ShareContent => {
  const attachedTo = momentContext(moment)?.label ?? 'Removed';
  const isPrivate = Boolean(privateCommunity);

  return {
    heading: 'Share moment',
    kind: 'Moment',
    kindIcon: canvasIcon('hgi-camera-01')!,
    image: momentPhotos(moment)[0]?.photo,
    title: `Moment by ${momentAuthorName(moment.author)}`,
    sub: attachedTo,
    url: shareUrl('m', moment),
    lead: `A moment from ${attachedTo} on Tukai`,
    isPrivate,
    note: privateCommunity
      ? `Only members of ${privateCommunity.title} can open this link. A forwarded link grants nothing.`
      : `Anyone with the link can see this moment and ${attachedTo}.`,
  };
};
