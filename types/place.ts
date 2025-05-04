import { Photo } from '@/types/photo';
import { PlaceCategory } from '@/types/placeCategory';
import { Location } from '@/types/location';
import { Status } from '@/enums/status';

export type Place = {
  id: string;
  title: string;
  description: string;
  location: Location;
  category: PlaceCategory;
  photos: Photo[];
  totalReviews: number;
  averageRating: number;
  isBookmarked: boolean;
  status: Status;
  dateCreated: string;
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
