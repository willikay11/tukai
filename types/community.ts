import { Location } from './location';
import { Photo } from './photo';
import { User } from './user';

export type CommunityMember = {
  id: string;
  user: User;
  role: 'owner' | 'admin' | 'moderator' | 'regular' | 'guest';
  dateCreated: string;
  /** The API enum, from `CommunityMember.invite_status` in the swagger. */
  inviteStatus: 'pending' | 'requested' | 'accepted' | 'rejected' | 'ignored';
};

export type CommunityCategory = {
  id: string;
  name: string;
  icon: string;
};

/**
 * The owner summary the LIST endpoint returns. It is not a CommunityMember —
 * the list response carries no membership records at all, just this and a
 * count.
 */
export type CommunityOwner = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  picture: string | null;
};

export type Community = {
  id: string;
  /** URL key. The detail route and every nested one resolve it or the UUID. */
  slug?: string;
  title: string;
  description: string;
  categories: CommunityCategory[];
  isPublic: boolean;
  verified?: boolean;
  status: string;
  photos: Photo[];
  location: Location;
  // ⚠️ The LIST endpoint does not return this — only the detail endpoint does.
  // For a list row use `membersCount` and `owners` instead.
  members: CommunityMember[];
  membersCount?: number;
  owners?: CommunityOwner[];
  dateCreated: string;
  dateModified: string;
};

export type CreateCommunity = {
  title: string;
  description: string;
  categoriesIds: string[];
  isPublic: boolean;
  newPhotos: File[];
  googleMapPlaceId: string;
  invitedMemberIds: string[];
  invitedCommunityIds: string[];
  invitedEmails: string[];
  status?: string;
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
