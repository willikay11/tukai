import { ReservationSettingsValues } from './schemas';

const joinAnd = (items: string[]): string => {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};

/**
 * The one combined sentence the amber error box reads, in the handoff's own
 * order. Kept separate from the Zod schema's per-field messages (still used
 * for the inline `FieldError`s) because the handoff's copy and ordering do
 * not line up with a per-field error map.
 */
export const reservationErrorSentence = (values: ReservationSettingsValues): string | null => {
  const items: string[] = [];
  const capacity = Number(values.seatingCapacity) || 0;
  const partySize = Number(values.partySize) || 0;

  if (values.paymentType === 'deposit' && !(Number(values.depositAmount) > 0)) {
    items.push('a deposit per guest');
  }
  if (values.paymentType === 'entry_fee' && values.entryFees.length === 0) {
    items.push('at least one guest category with a price');
  }

  if (!capacity) items.push('your seating capacity');

  if (!partySize) items.push('a max party size');
  else if (capacity && partySize > capacity)
    items.push('a party size no bigger than your capacity');

  if (values.days.length === 0) items.push('at least one active day');

  if (values.opensAt && values.closesAt && values.opensAt === values.closesAt) {
    items.push('opening and closing times');
  }

  return items.length > 0 ? `Add ${joinAnd(items)}.` : null;
};
