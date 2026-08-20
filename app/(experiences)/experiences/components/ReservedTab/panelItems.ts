import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

import { ReservationView } from './types';

/**
 * The calendar panel lists two different things on one timeline: reservations
 * the user has paid for, and invitations still waiting on them.
 */
export interface PanelItem {
  id: string;
  kind: 'reservation' | 'invite';
  experienceId: string;
  title: string;
  coverPhoto: string | null;
  start: string | null;
  end: string | null;
  // "from KES 1,200", or "Free" when the experience carries no charge
  priceLabel: string | null;
  // Present on reservations, and what the ticket modal is opened with
  reservation?: ReservationView;
}

const coverOf = (experience: Experience): string | null =>
  experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
  experience.photos?.[0]?.photo ||
  null;

const priceLabelOf = (experience: Experience): string | null => {
  if (experience.isPaid === false) return 'Free';

  const price = experience.priceStartsFrom;
  if (!price || price.amount === null || price.amount === undefined) return null;

  return `from ${price.currency} ${Number(price.amount).toLocaleString()}`;
};

export const reservationToPanelItem = (
  reservation: ReservationView,
  experiences: Experience[],
): PanelItem => {
  const experience = experiences.find((item) => item.id === reservation.experienceId);

  return {
    id: reservation.key,
    kind: 'reservation',
    experienceId: reservation.experienceId,
    title: reservation.title,
    coverPhoto: reservation.coverPhoto,
    start: reservation.start,
    end: reservation.end,
    priceLabel: experience ? priceLabelOf(experience) : null,
    reservation,
  };
};

export const inviteToPanelItem = (experience: Experience): PanelItem => ({
  id: `invite-${experience.id}`,
  kind: 'invite',
  experienceId: experience.id,
  title: experience.title,
  coverPhoto: coverOf(experience),
  start: experience.startDate ?? null,
  end: experience.endDate ?? null,
  priceLabel: priceLabelOf(experience),
});

// Reservations and invites share one date-ordered timeline
export const buildPanelItems = (
  reservations: ReservationView[],
  experiences: Experience[],
  invites: Experience[],
): PanelItem[] => {
  const reserved = reservations.map((item) => reservationToPanelItem(item, experiences));
  const invited = invites
    // An invite the user already booked is a reservation, not an open invite
    .filter((invite) => !reservations.some((item) => item.experienceId === invite.id))
    .map(inviteToPanelItem);

  return [...reserved, ...invited].sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
};
