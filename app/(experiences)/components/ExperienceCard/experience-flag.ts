import { Experience } from '@/types/experience';
import { CANVAS_ICONS } from '@/utils/canvas-icons';
import { moneyAmount } from '@/utils/money';

export type ExperienceFlag = { text: string; icon: string };

/**
 * The pill over an experience's photo, or null when there is nothing to say.
 *
 * The canvas carries three - "Sold out", "Recurring" and "Free" - and never
 * two at once, but does not say which wins when more than one applies. Sold
 * out leads here because it is the only one that changes whether the reader
 * can act on the card at all; a free experience that cannot be joined is
 * first of all one that cannot be joined.
 */
export const experienceFlag = (experience: Experience): ExperienceFlag | null => {
  if (experience.isSoldOut) return { text: 'Sold out', icon: CANVAS_ICONS.clock };
  if (experience.recurrenceRule) return { text: 'Recurring', icon: CANVAS_ICONS.repeat };
  if (isFree(experience)) return { text: 'Free', icon: CANVAS_ICONS.tag };
  return null;
};

/**
 * `is_paid` is the host's own answer, and the one to trust: a paid experience
 * whose cheapest ticket happens to be zero is still not a free one. The price
 * is only read when the flag is absent.
 */
export const isFree = (experience: Experience): boolean =>
  experience.isPaid === false || moneyAmount(experience.priceStartsFrom) === 0;

/**
 * "Free", or "KES 1,800/person".
 *
 * ⚠️ The canvas builds the "/person" half from a `priceBasis` the API has no
 * field for ("per person, two hours"). Per person is what the ticket prices
 * in, so it is said plainly rather than left off.
 */
export const experiencePriceLine = (experience: Experience): string => {
  if (isFree(experience)) return 'Free';

  const amount = moneyAmount(experience.priceStartsFrom);
  if (amount === null) return '';

  const currency = experience.priceStartsFrom?.currency ?? '';
  return `${currency} ${amount.toLocaleString('en-US')}/person`.trim();
};

/**
 * Who is running this - the line above the title.
 *
 * Most experiences are run by a community. A guided tour is not: its
 * `experience_type` is `guide_booking` and it is auto-provisioned behind a
 * guide's profile, so the person hosting it IS the guide, and their name is
 * what the card has to say.
 */
export const experienceRunBy = (experience: Experience): string | undefined => {
  const community = experience.hostCommunity?.title?.trim();
  if (community) return community;

  const host = experience.host;
  if (!host) return undefined;

  return (
    host.displayName?.trim() || `${host.firstName ?? ''} ${host.lastName ?? ''}`.trim() || undefined
  );
};
