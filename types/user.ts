export type User = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  picture: string;
  phone?: string;
  email?: string;
  status?: string;
  acceptedTerms?: boolean;
  emailVerified?: boolean;
  experienceHostedCount?: number;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * A user as another record links to them — an owner, a member, whoever added
 * something. The API returns this shape wherever a person is referenced rather
 * than fully described.
 */
export type LinkedUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  picture?: string | null;
  pictureWebpUrl?: string | null;
  pictureWebpSmUrl?: string | null;
};

/** What to call someone, from whichever names came back. */
export const linkedUserName = (user?: LinkedUser | null): string =>
  user?.displayName?.trim() ||
  [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
  'Someone';
