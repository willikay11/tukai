import { Status } from '@/enums/status';
import { Location } from '@/types/location';
import { Photo } from '@/types/photo';
import { PlaceCategory } from '@/types/placeCategory';

export type Place = {
  id: string;
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
