import { ExperienceCategory } from '@/types/experienceCategory';
import { Status } from '@/enums/status';
import { User } from '@/types/user';
import { Location } from '@/types/location';
import { Photo } from './photo';

export type Experience = {
  id: string;
  title: string;
  location: Location;
  startDate: string;
  endDate: string;
  currency: string;
  priceStartsFrom: { amount: number; currency: string };
  ticketsAvailable: boolean;
  isSoldOut: boolean;
  isBookmarked: boolean;
  categories: ExperienceCategory[];
  photos: Photo[];
  status: Status;
  host: User;
  coHosts: User[];
  dateCreated: string;
};
