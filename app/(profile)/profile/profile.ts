import { LinkedUser } from '@/types/user';

/**
 * A reader's own profile, as `GET /accounts/users/{id}/` returns it.
 *
 * The counts come back as strings, which is why nothing here compares them as
 * numbers without reading them first.
 */
export type MyProfile = LinkedUser & {
  bio?: string | null;
  email?: string;
  gender?: string | null;
  followersCount?: string | number | null;
  followingCount?: string | number | null;
  hasSubscribed?: boolean;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  xUrl?: string | null;
  interests?: { id: string; name?: string; title?: string }[];
  dateCreated?: string;
};

export const profileCount = (value?: string | number | null): number => {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;

  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
};

/**
 * What to call the reader on their own profile.
 *
 * Not `linkedUserName`: that prefers the display name, which is the handle —
 * and the handle already has its own line here, so using it for the heading
 * printed it twice and lost the reader's actual name.
 */
export const profileName = (profile?: MyProfile | null, fallback = 'You'): string =>
  [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() ||
  profile?.displayName?.trim() ||
  fallback;

/** The reader's @handle, where they set one. */
export const profileHandle = (profile?: MyProfile | null): string | null =>
  profile?.displayName?.trim() ? `@${profile.displayName.trim()}` : null;

/** What an interest is called, whichever field carries it. */
export const interestName = (interest: { name?: string; title?: string }): string =>
  interest.name ?? interest.title ?? 'Interest';

export type ProfileSocial = { id: string; label: string; icon: string; url: string };

const SOCIALS: Array<{ id: keyof MyProfile; label: string; icon: string }> = [
  { id: 'websiteUrl', label: 'Website', icon: 'Globe02Icon' },
  { id: 'instagramUrl', label: 'Instagram', icon: 'InstagramIcon' },
  { id: 'tiktokUrl', label: 'TikTok', icon: 'TiktokIcon' },
  { id: 'youtubeUrl', label: 'YouTube', icon: 'YoutubeIcon' },
  { id: 'xUrl', label: 'X', icon: 'NewTwitterIcon' },
];

/**
 * Only the links the reader actually set. A row of five greyed icons says
 * nothing; the ones that are there say where to find them.
 */
export const profileSocials = (profile?: MyProfile | null): ProfileSocial[] => {
  if (!profile) return [];

  return SOCIALS.map(({ id, label, icon }) => ({
    id: String(id),
    label,
    icon,
    url: String(profile[id] ?? '').trim(),
  })).filter((social) => social.url.length > 0);
};

/** The fields the API lets a reader change about themselves. */
export const EDITABLE_FIELDS = [
  'firstName',
  'lastName',
  'displayName',
  'bio',
  'websiteUrl',
  'instagramUrl',
  'tiktokUrl',
  'youtubeUrl',
  'xUrl',
] as const;
