import { PlaceBookingRequest } from '@/types/placeReservation';

export interface PlaceBookingAction {
  key: 'pay' | 'change' | 'cancel' | 'rebook';
  label: string;
  icon: string;
  tone: 'default' | 'lime' | 'danger';
}

export interface PlaceBookingStatusVm {
  label: string;
  bg: string;
  fg: string;
  icon: string;
  actions: PlaceBookingAction[];
}

/**
 * Maps the real `PlaceBookingRequest.status` enum onto the handoff's 8 pill
 * states.
 *
 * ⚠️ The two don't line up 1:1 - there is no `confirmed`/`no_show`/
 * `not_paid_in_time` value on the wire, so this is an approximation:
 * `completed`→Confirmed, `redeemed`→Visited, `failed`→Released (the handoff's
 * "Not paid in time"), `pending`→treated like `requested`. `cancelled` and
 * `refunded` return null - cancelled bookings never show per the handoff, and
 * `refunded` has no clear home yet. Flagged in the Dashboard backend-gaps note.
 */
export const mapPlaceBookingStatus = (
  status: PlaceBookingRequest['status'],
  payAmountLabel: string,
): PlaceBookingStatusVm | null => {
  switch (status) {
    case 'requested':
    case 'pending':
      return {
        label: 'Waiting for an answer',
        bg: 'bg-warn-surface',
        fg: 'text-warn',
        icon: 'HourglassIcon',
        actions: [
          { key: 'change', label: 'Change request', icon: 'Edit04Icon', tone: 'default' },
          { key: 'cancel', label: 'Cancel request', icon: 'Delete01Icon', tone: 'danger' },
        ],
      };
    case 'accepted':
      return {
        label: 'Accepted, not paid yet',
        bg: 'bg-warn-surface',
        fg: 'text-warn',
        icon: 'Wallet02Icon',
        actions: [
          { key: 'pay', label: `Pay ${payAmountLabel}`, icon: 'Wallet02Icon', tone: 'lime' },
          { key: 'cancel', label: 'Cancel booking', icon: 'Delete01Icon', tone: 'danger' },
        ],
      };
    case 'completed':
      return {
        label: 'Confirmed',
        bg: 'bg-surface-brand',
        fg: 'text-brand',
        icon: 'CheckmarkCircle02Icon',
        actions: [
          { key: 'cancel', label: 'Cancel booking', icon: 'Delete01Icon', tone: 'danger' },
        ],
      };
    case 'redeemed':
      return {
        label: 'Visited',
        bg: 'bg-surface-brand',
        fg: 'text-brand',
        icon: 'CheckmarkCircle02Icon',
        actions: [],
      };
    case 'declined':
      return {
        label: 'Declined',
        bg: 'bg-danger-surface',
        fg: 'text-danger-deep',
        icon: 'CancelCircleIcon',
        actions: [
          { key: 'rebook', label: 'Book another time', icon: 'CalendarAdd01Icon', tone: 'default' },
        ],
      };
    case 'expired':
      return {
        label: 'Expired',
        bg: 'bg-surface',
        fg: 'text-ink',
        icon: 'Clock01Icon',
        actions: [
          { key: 'rebook', label: 'Book another time', icon: 'CalendarAdd01Icon', tone: 'default' },
        ],
      };
    case 'failed':
      return {
        label: 'Released',
        bg: 'bg-surface',
        fg: 'text-ink',
        icon: 'Clock01Icon',
        actions: [
          { key: 'rebook', label: 'Book another time', icon: 'CalendarAdd01Icon', tone: 'default' },
        ],
      };
    case 'cancelled':
    case 'refunded':
    default:
      return null;
  }
};
