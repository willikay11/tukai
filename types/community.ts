import { Photo } from './photo';
import { Location } from './location';
import { User } from './user';

export type CommunityMember = {
  id: string;
  user: User;
  role: 'owner' | 'admin' | 'moderator' | 'regular' | 'guest';
  dateCreated: string;
};

export type Community = {
  id: string;
  title: string;
  description: string;
  categories: string[];
  isPublic: boolean;
  status: string;
  photos: Photo[];
  location: Location;
  members: CommunityMember[];
  dateCreated: string;
  dateModified: string;
};
