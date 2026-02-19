import { Location } from './location';
import { Photo } from './photo';
import { User } from './user';

export type CommunityMember = {
  id: string;
  user: User;
  role: 'owner' | 'admin' | 'moderator' | 'regular' | 'guest';
  dateCreated: string;
  inviteStatus: 'accepted' | 'requested' | 'declined';
};

export type CommunityCategory = {
  id: string;
  name: string;
  icon: string;
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

export type CreateCommunity = {
  title: string;
  description: string;
  categoriesIds: string[];
  isPublic: boolean;
  newPhotos?: string[];
  googleMapPlaceId: string;
  invitedMemberIds: string[];
  invitedCommunityIds: string[];
  invitedEmails: string[];
};

export type CommunityPostsQueryParams = {
  community?: string;
  community__is_public?: boolean;
  author?: boolean;
  is_liked?: boolean;
  page?: number;
  page_size?: number;
};

export type CommunityPost = {
  id: string;
  community: Community;
  title: string;
  description: string;
  photos: Photo[];
  isLiked?: boolean;
  totalLikes?: number;
  totalComments?: number;
  dateCreated: string;
  dateModified: string;
  createdBy: User;
};
