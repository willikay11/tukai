import moment from 'moment';

import { MoneyAmount } from '@/types/payment';

/** "Sat 28 Nov" */
export const boostDay = (iso: string) => moment(iso).format('ddd D MMM');

/** A boost on offer: how long it lasts and what it costs (DEV-392). */
export type BoostPackage = {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  price: MoneyAmount;
};

/**
 * A place's boost: once paid, the place ranks first in place listings and
 * search from `startsAt` to `endsAt`. Bought while another runs, it starts
 * when that one ends.
 */
export type PlaceBoost = {
  id: string;
  package: BoostPackage | null;
  price: MoneyAmount;
  durationDays: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  startsAt: string | null;
  endsAt: string | null;
  isLive: boolean;
  orderId: string | null;
  dateCreated: string;
};

/**
 * Where a place's boosting stands: the boost running now, and when the last
 * paid one ends - which may be a queued one, after the live one.
 */
export const boostStateOf = (
  boosts: PlaceBoost[],
  now: Date = new Date(),
): { live: PlaceBoost | null; boostedUntil: string | null; queued: PlaceBoost[] } => {
  const paid = boosts.filter((boost) => boost.status === 'paid' && boost.endsAt);
  const current = paid.filter((boost) => new Date(boost.endsAt!).getTime() > now.getTime());
  const live =
    current.find((boost) => boost.isLive || (boost.startsAt && new Date(boost.startsAt) <= now)) ??
    null;
  const queued = current
    .filter((boost) => boost !== live)
    .sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt)));
  const boostedUntil =
    current
      .map((boost) => boost.endsAt!)
      .sort((a, b) => a.localeCompare(b))
      .at(-1) ?? null;
  return { live, boostedUntil: live ? boostedUntil : null, queued };
};
