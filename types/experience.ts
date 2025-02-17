import { ExperienceCategory } from '@/types/experienceCategory';
import { ExperiencePhoto } from '@/types/experiencePhoto';
import { Status } from '@/enums/status';
import { User } from '@/types/user';
import { Location } from '@/types/location';

export type Experience = {
  id: string;
  title: string;
  location: Location;
  startDate: string;
  endDate: string;
  currency: string;
  priceStartsFrom: string;
  ticketsAvailable: boolean;
  isSoldOut: boolean;
  isBookmarked: boolean;
  categories: ExperienceCategory[];
  photos: ExperiencePhoto[];
  status: Status;
  host: User;
  coHosts: User[];
  dateCreated: string;
};
