/**
 * Who a place is linked to (DEV-385/386): communities that own it or have
 * hosted experiences there, and tour guides who lead experiences there.
 */

/** GET /v1/places/{id}/communities/: the owner first, then the busiest hosts */
export type PlaceLinkedCommunity = {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  isPublic: boolean;
  photoUrl: string | null;
  membersCount: number;
  /** owner: the place's verified owner. host: has hosted experiences there */
  relationship: 'owner' | 'host';
  /** Experiences it has hosted at the place */
  experiencesCount: number;
};

/** GET /v1/places/{id}/guides/: approved guides, most experiences here first */
export type PlaceGuide = {
  id: string;
  headline: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    picture: string | null;
  };
  averageRating: number | null;
  /** Experiences they host or co-host at the place */
  experiencesCount: number;
};

export const guideName = (guide: PlaceGuide): string =>
  guide.user.displayName ||
  [guide.user.firstName, guide.user.lastName].filter(Boolean).join(' ') ||
  'Tour guide';

export const experiencesLine = (count: number, where = 'here'): string =>
  `${count} ${count === 1 ? 'experience' : 'experiences'} ${where}`;
