export interface MomentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  picture: string | null;
  isFollowing: boolean;
}

export interface MomentMedia {
  id: string;
  mediaType: string;
  photo: string;
  width: number;
  height: number;
  order: number;
}

export interface Moment {
  id: string;
  author: MomentAuthor;
  title: string;
  description: string;
  community: { id: string; title: string } | null;
  experience: { id: string; title: string } | null;
  place: { id: string; title: string } | null;
  // May be empty — a moment can be posted without media
  media: MomentMedia[];
  totalLikes: number;
  totalComments: number;
  dateCreated: string;
}

// display_name is optional on the API, so fall back to the real name
export const momentAuthorName = (author: MomentAuthor): string =>
  author.displayName?.trim() || `${author.firstName} ${author.lastName}`.trim();
