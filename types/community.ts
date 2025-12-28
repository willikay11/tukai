import { Location } from './location';
import { Photo } from './photo';
import { User } from './user';

export type CommunityMember = {
  id: string;
  user: User;
  role: 'owner' | 'admin' | 'moderator' | 'regular' | 'guest';
  dateCreated: string;
};

export type CommunityCategory = {
  id: string;
  name: string;
};

export type Community = {
  id: string;
  title: string;
  description: string;
  categories: CommunityCategory[];
  isPublic: boolean;
  status: string;
  photos: Photo[];
  location: Location;
  members: CommunityMember[];
  dateCreated: string;
  dateModified: string;
};
