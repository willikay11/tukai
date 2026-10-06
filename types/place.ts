import { Status } from '@/enums/status';
import { Location } from '@/types/location';
import { Photo } from '@/types/photo';
import { PlaceCategory } from '@/types/placeCategory';

export type Place = {
  id: string;
  // Human-readable identifier, and what the detail URL uses. The API resolves
  // either this or the UUID, so older id-based links keep working.
  slug?: string;
  title: string;
  description: string;
  location: Location;
  categories: PlaceCategory[];
  photos: Photo[];
  // null until the place has been reviewed
  totalReviews: number | null;
  averageRating: number;
  isBookmarked: boolean;
  status: Status;
  dateCreated: string;
  // On both the list and the detail serializer. There is no `featured` query
  // param, so a caller that wants only featured places filters on this.
  featured?: boolean;
  // The DETAIL endpoint embeds both of these, so a place page needs no extra
  // requests for them. The list endpoint does not return them.
  properties?: PlaceProperty[];
  socialLinks?: PlaceSocialLink[];
};

export type PlaceProperty = {
  id: string;
  key: string;
  value: string;
  icon?: string;
  canCopy?: boolean;
  // Set when the value is a website or email address, so the drawer can link it.
  // The API does not send this yet; until it does, the value renders as text.
  linkType?: 'website' | 'email';
};

export type PlaceSocialLink = {
  id: string;
  platformName: string;
  url: string;
  icon?: string;
};

export function isPlace(item: any): item is Place {
  return 'totalReviews' in item && 'averageRating' in item;
}
