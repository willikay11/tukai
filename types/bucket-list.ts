import { LinkedUser } from '@/types/user';
import { MoneyLike } from '@/utils/money';

/** One saved experience or place. Exactly one of the two bookmarks is set. */
export interface BucketListItem {
  id: string;
  note?: string;
  position: number;
  addedBy?: LinkedUser;
  experienceBookmark?: {
    id: string;
    experienceId?: string;
    // `experience_title` on the wire — the place side calls its own `place_name`
    experienceTitle?: string;
    photo?: PhotoLike;
    status?: string;
    // The API sends a plain string here in places and a { city, ... } object in
    // others, so callers read it through `bucketListItemLocation`
    location?: string | { city?: string; name?: string };
    startDate?: string;
    endDate?: string;
    // Money, not a string — the swagger says otherwise but every other reader
    // in the app treats it as { amount, currency }
    priceStartsFrom?: MoneyLike;
  };
  placeBookmark?: {
    id: string;
    placeId?: string;
    placeName?: string;
    photo?: PhotoLike;
    status?: string;
    location?: string | { city?: string; name?: string };
  };
  dateCreated?: string;
}

export interface BucketListMember {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'removed';
  user: LinkedUser;
  invitedBy?: LinkedUser;
  dateCreated?: string;
}

/** A list as the collection endpoint returns it. */
export interface BucketList {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  coverImage?: string | null;
  shareToken?: string;
  owner?: LinkedUser;
  itemCount: number;
  memberCount: number;
  // The API sends this as a string on the list serializer
  isMember?: boolean | string;
  dateCreated?: string;
  dateModified?: string;
}

/** The detail endpoint adds what the list is made of. */
export interface BucketListDetail extends BucketList {
  items: BucketListItem[];
  members?: BucketListMember[];
}

export interface CreateBucketListPayload {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
}

export interface AddBucketListItemPayload {
  note?: string;
  experienceId?: string;
  placeId?: string;
}

/**
 * A photo arrives as a URL string on some endpoints and as the Photo object on
 * others — `price_starts_from` is documented as a string and is not one either,
 * so neither is taken on trust here.
 */
export type PhotoLike =
  | string
  | { photo?: string; url?: string; photoUrl?: string; photoWebpMdUrl?: string }
  | null;

const photoUrl = (photo?: PhotoLike): string | undefined => {
  if (!photo) return undefined;
  if (typeof photo === 'string') return photo || undefined;

  return photo.photoWebpMdUrl ?? photo.photoUrl ?? photo.photo ?? photo.url ?? undefined;
};

/** The photo a saved item shows, whichever kind it is. */
export const bucketListItemPhoto = (item: BucketListItem): string | undefined =>
  photoUrl(item.experienceBookmark?.photo) ?? photoUrl(item.placeBookmark?.photo);

/** What the saved item is called, whichever kind it is. */
export const bucketListItemName = (item: BucketListItem): string =>
  item.experienceBookmark?.experienceTitle ?? item.placeBookmark?.placeName ?? 'Saved item';

/** Where a saved item goes when opened. */
export const bucketListItemHref = (item: BucketListItem): string | null => {
  if (item.experienceBookmark?.experienceId) {
    return `/experiences/${item.experienceBookmark.experienceId}`;
  }
  if (item.placeBookmark?.placeId) return `/places/${item.placeBookmark.placeId}`;
  return null;
};

/** Where a saved item is, however the API chose to describe it. */
export const bucketListItemLocation = (item: BucketListItem): string | undefined => {
  const location = item.experienceBookmark?.location ?? item.placeBookmark?.location;

  if (!location) return undefined;
  if (typeof location === 'string') return location;

  return location.city ?? location.name ?? undefined;
};
