import { Community, CommunityMember, CommunityPlace, CommunityRating } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment, momentPhotos } from '@/types/moment';
import { photoUrl } from '@/types/photo';

export type CommunityMembership = 'none' | 'pending' | 'member';

/**
 * A join request on a public community is accepted immediately; on a private
 * one it is only recorded as `requested` until a host approves it. A record
 * whose status the API leaves out still counts as a member - membership is
 * what having the record means.
 */
export const membershipOf = (member?: CommunityMember): CommunityMembership => {
  if (!member) return 'none';
  if (member.inviteStatus === 'requested' || member.inviteStatus === 'pending') return 'pending';
  if (member.inviteStatus === 'rejected' || member.inviteStatus === 'ignored') return 'none';
  return 'member';
};

export const nameOfMember = (member: CommunityMember): string =>
  member.user?.displayName ||
  `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim() ||
  (member as CommunityMember & { email?: string }).email ||
  'Member';

/** The community's owner, from the detail endpoint's own member records. */
export const ownerOf = (members: CommunityMember[]): CommunityMember | undefined =>
  members.find((member) => member.role === 'owner');

/** Everyone actually in: the owner, and every record that has been accepted. */
export const acceptedMembers = (members: CommunityMember[]): CommunityMember[] =>
  members.filter((member) => member.role === 'owner' || membershipOf(member) === 'member');

/** Invites an owner sent that nobody has answered yet. */
export const pendingInvites = (members: CommunityMember[]): CommunityMember[] =>
  members.filter((member) => member.role !== 'owner' && member.inviteStatus === 'pending');

/**
 * Which of the handoff's views the reader gets.
 *
 * Private communities are invitation only: an invitee gets the invited state,
 * and anyone else - including someone who opens a forwarded link - the closed
 * one. A public community is open to everybody.
 */
export type CommunityAccess = 'owner' | 'member' | 'guest' | 'invited' | 'closed';

export const accessOf = (
  community: Community,
  currentUserId: string | undefined,
  hasDeclined = false,
): CommunityAccess => {
  const self = currentUserId
    ? (community.members ?? []).find((member) => member.user?.id === currentUserId)
    : undefined;

  if (self?.role === 'owner') return 'owner';
  if (membershipOf(self) === 'member') return 'member';
  if (community.isPublic) return 'guest';
  if (self?.inviteStatus === 'pending' && !hasDeclined) return 'invited';
  return 'closed';
};

/** "Kilimani, Nairobi" -> "Nairobi", per the handoff: the last part is the city. */
export const cityOf = (community: Community): string | undefined => {
  const city = community.location?.city;
  if (city) return city;

  const parts = (community.location?.formattedAddress ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1];
};

/** The drawer's photo row widths, in order, from the handoff. */
export const PHOTO_WIDTHS = [158, 240, 408, 240, 240, 180, 348, 240];

/**
 * Up to 8: the community's own photos (the cover first), then its moments',
 * then its experiences'. Unlike the prototype nothing tops the row up with
 * stock photos - a community with one photo shows one.
 */
export const drawerPhotos = (
  community: Community,
  moments: Moment[],
  experiences: Experience[],
): string[] => {
  const urls = [
    ...(community.photos ?? []).map((photo) => photoUrl(photo, 'lg')),
    ...moments.flatMap((moment) => momentPhotos(moment).map((media) => media.photo)),
    ...experiences.map((experience) => photoUrl(experience.photos?.[0], 'lg')),
  ].filter((url): url is string => Boolean(url));

  return Array.from(new Set(urls)).slice(0, PHOTO_WIDTHS.length);
};

/** Column x row spans by how many moment tiles there are, from the handoff. */
const MOSAIC_SPANS: Record<number, Array<[number, number]>> = {
  1: [[1, 1]],
  2: [
    [1, 1],
    [2, 1],
  ],
  3: [
    [1, 1],
    [1, 1],
    [1, 1],
  ],
  4: [
    [1, 1],
    [2, 1],
    [2, 1],
    [1, 1],
  ],
  5: [
    [1, 1],
    [2, 1],
    [1, 1],
    [1, 1],
    [1, 1],
  ],
  6: [
    [1, 1],
    [2, 1],
    [2, 1],
    [1, 1],
    [1, 1],
    [2, 1],
  ],
  7: [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
    [1, 1],
    [1, 1],
    [1, 1],
  ],
};

export const MAX_MOSAIC_TILES = 7;

export const mosaicSpans = (count: number): Array<[number, number]> =>
  MOSAIC_SPANS[Math.min(count, MAX_MOSAIC_TILES)] ?? [];

/** Experiences that have finished, for the Admin band's "{n} past experiences organised". */
export const pastExperienceCount = (experiences: Experience[], now = Date.now()): number =>
  experiences.filter(
    (experience) => new Date(experience.endDate ?? experience.startDate).getTime() < now,
  ).length;

/** Experiences still to come: today's drop out once they have ended. */
export const upcomingExperiences = (experiences: Experience[], now = Date.now()): Experience[] =>
  experiences.filter(
    (experience) => new Date(experience.endDate ?? experience.startDate).getTime() >= now,
  );

const MAX_MEETING_PLACES = 6;

/**
 * A verified business lists exactly the places it owns, so the count matches
 * its chip. Any other community lists up to 6 places its experiences happen at.
 */
export const communityPlaces = (
  community: Community,
  experiences: Experience[],
): { places: CommunityPlace[]; isOwned: boolean } => {
  const owned = community.verifiedPlaces ?? [];
  if (community.verified && owned.length > 0) return { places: owned, isOwned: true };

  const byId = new Map<string, CommunityPlace>();
  experiences.forEach((experience) => {
    if (experience.place?.id && !byId.has(experience.place.id)) {
      byId.set(experience.place.id, experience.place);
    }
  });
  return { places: Array.from(byId.values()).slice(0, MAX_MEETING_PLACES), isOwned: false };
};

export const MAX_REVIEWS = 4;

/** The average (one decimal) and count, and the newest few to show. */
export const reviewSummary = (ratings: CommunityRating[], total?: number) => {
  const count = total ?? ratings.length;
  const average = ratings.length
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
    : 0;
  const newest = ratings
    .slice()
    .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
    .slice(0, MAX_REVIEWS);

  return { count, average: Math.round(average * 10) / 10, newest };
};
