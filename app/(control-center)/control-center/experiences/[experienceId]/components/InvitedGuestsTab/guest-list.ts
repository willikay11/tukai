import { Experience } from '@/types/experience';

/**
 * The invited, as the canvas shows them: one chip each, with a face where we
 * have one and a letter where we do not.
 *
 * Guests come back as an email and a status - no display name, no avatar - so a
 * guest's letter is the `@` the canvas uses for an address. Communities come
 * back with a title and photos.
 */
export type InviteChip = {
  id: string;
  label: string;
  initial: string;
  image?: string;
  /** What the remove button reads as, and what the message afterwards names. */
  removeLabel: string;
};

export const guestChip = (guest: Experience['guests'][number]): InviteChip => ({
  id: guest.id,
  label: guest.email,
  // The canvas marks an address with an @ rather than its first letter
  initial: guest.email?.includes('@') ? '@' : (guest.email?.charAt(0).toUpperCase() ?? '?'),
  removeLabel: guest.email,
});

export const matchesQuery = (chip: InviteChip, query: string): boolean =>
  !query.trim() || chip.label.toLowerCase().includes(query.trim().toLowerCase());

/** The canvas's own wording, and it changes with what is missing. */
export const emptyLine = (view: 'guests' | 'communities', query: string): string => {
  if (query.trim()) return 'No one matches that search.';

  return view === 'guests' ? 'No guests invited yet.' : 'No communities invited yet.';
};
