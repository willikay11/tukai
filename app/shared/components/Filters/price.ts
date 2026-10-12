import { isFree } from '@/app/(experiences)/components/ExperienceCard/experience-flag';
import { Experience } from '@/types/experience';
import { moneyAmount } from '@/utils/money';

/**
 * Price narrows experiences only - `Place` carries no price field at all, so
 * a place always matches, whatever is picked here.
 */
export const matchesPrice = (
  experience: Experience,
  {
    freeOnly,
    paidOnly,
    priceMin,
    priceMax,
  }: {
    freeOnly: boolean;
    paidOnly: boolean;
    priceMin?: number;
    priceMax?: number;
  },
): boolean => {
  const free = isFree(experience);
  if (freeOnly && !free) return false;
  if (paidOnly && free) return false;

  if (priceMin === undefined && priceMax === undefined) return true;
  // A free experience always clears a price range - there is nothing to be
  // over or under
  if (free) return true;

  const amount = moneyAmount(experience.priceStartsFrom);
  if (amount === null) return true;

  if (priceMin !== undefined && amount < priceMin) return false;
  if (priceMax !== undefined && amount > priceMax) return false;
  return true;
};
