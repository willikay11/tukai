import { ExperienceCategory } from '@/types/experienceCategory';
import { Status } from '@/enums/status';
import { User } from '@/types/user';
import { Location } from '@/types/location';
import { Photo } from './photo';
import { Ticket } from './ticket';

export type Experience = {
  id: string;
  title: string;
  description: string;
  location: Location;
  startDate: string;
  endDate: string;
  currency: string;
  priceStartsFrom: { amount: number; currency: string };
  ticketsAvailable: boolean;
  isSoldOut: boolean;
  isPublic: boolean;
  isBookmarked: boolean;
  categories: ExperienceCategory[];
  tickets: Ticket[];
  photos: Photo[];
  status: Status;
  host: User;
  coHosts: User[];
  dateCreated: string;
};

export function isExperience(item: any): item is Experience {
  return 'ticketsAvailable' in item && 'isSoldOut' in item;
}
