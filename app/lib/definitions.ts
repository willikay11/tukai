import { Status } from '@/app/lib/enums';

export type Interest = {
  id: string;
  name: string;
};

export type ListExperiences = {
  count: number;
  start_index: number;
  end_index: number;
  next?: string;
  previous?: string;
  results: Experience[];
};

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

export type Location = {
  id: string;
  name: string;
  pointLat: number;
  pointLong: number;
  point: string;
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  country: string;
};

export type ExperienceCategory = {
  id: string;
  name: string;
  icon: string;
};

export type ExperiencePhoto = {
  id: string;
  experience: string;
  photo: string;
  caption: string;
  isCover: boolean;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  picture: string;
};
