export interface MomentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  picture: string | null;
  isFollowing: boolean;
  isFollowedBy?: boolean;
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

export interface MomentComment {
  id: string;
  // The API calls this `moment`; it is the moment id
  moment: string;
  commenter: MomentAuthor;
  content: string;
  totalLikes: number;
  totalFlags: number;
  dateCreated: string;
  dateModified: string;
}

export interface FlagReason {
  id: string;
  // The API field name is unverified from here (the endpoint needs auth), so
  // both spellings are accepted and resolved by flagReasonLabel below
  label?: string;
  reason?: string;
  name?: string;
}

export const flagReasonLabel = (reason: FlagReason): string =>
  reason.label || reason.reason || reason.name || 'Unknown reason';
