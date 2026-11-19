import { PlaceBookingStatus } from '@/types/placeReservation';

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
 * A booking's `booking_status` (read with `bookingStatusOf`) as the handoff's
 * 8 pill states. The API now sends the three it lacked - `confirmed`,
 * `no_show` and `not_paid_in_time` (DEV-407) - so only `pending` is
 * approximated (shown like a request still waiting), and `failed` (a payment
 * that didn't go through) reads as Released. Cancelled and refunded bookings
 * don't show.
 */
export const mapPlaceBookingStatus = (
  status: PlaceBookingStatus,
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
    case 'confirmed':
      return {
        label: 'Confirmed',
        bg: 'bg-surface-brand',
        fg: 'text-brand',
        icon: 'CheckmarkCircle02Icon',
        actions: [{ key: 'cancel', label: 'Cancel booking', icon: 'Delete01Icon', tone: 'danger' }],
      };
    case 'redeemed':
      return {
        label: 'Visited',
        bg: 'bg-surface-brand',
        fg: 'text-brand',
        icon: 'CheckmarkCircle02Icon',
        actions: [],
      };
    case 'no_show':
      return {
        label: 'Missed',
        bg: 'bg-surface',
        fg: 'text-ink',
        icon: 'Clock01Icon',
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
    case 'not_paid_in_time':
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
