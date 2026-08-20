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

// next/image hard-throws on a null src (it treats a non-string as a static
// import and reads .default off it) and on a relative path without a leading
// slash. Media items carry a media_type, so a video or a still-processing
// upload can legitimately have photo: null — those must never reach an <Image>.
export const isRenderablePhoto = (photo: string | null | undefined): photo is string =>
  typeof photo === 'string' &&
  photo.trim().length > 0 &&
  (photo.startsWith('/') || photo.startsWith('http://') || photo.startsWith('https://'));

// The media on a moment that can actually be rendered as a photo
export const momentPhotos = (item: Pick<Moment, 'media'>): MomentMedia[] =>
  (item.media ?? []).filter((media) => isRenderablePhoto(media.photo));

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
