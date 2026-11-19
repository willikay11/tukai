import { MoneyAmount } from '@/types/payment';
import { Photo } from '@/types/photo';
import { LinkedUser } from '@/types/user';

/** What guests pay to confirm a reservation. */
export type ReservationPaymentType = 'free' | 'deposit' | 'entry_fee';

/** One guest category and its entry fee, e.g. Adults at KES 1,500. */
export type PlaceEntryFee = {
  id?: string;
  guestType: string;
  price: MoneyAmount;
};

/**
 * Where a place's booking income is paid out (DEV-450): the payout wallets of
 * the host who earns it - the owning community's owner. Only shown to the
 * place's managers.
 */
export type ReservationPayoutAccount = {
  host: { id: string; firstName?: string; lastName?: string; displayName?: string } | null;
  wallets: {
    id: string;
    walletType: 'phone' | 'bank' | 'paybill' | string;
    /** Masked: "•••6826" */
    destination: string;
    bankName?: string;
    accountHolderName?: string;
    isVerified?: boolean;
  }[];
};

/** A place's bookability configuration, set up by its owning community. */
export type PlaceReservationProfile = {
  id: string;
  place: string;
  reservationType: 'restaurant_reservation' | 'cinema_reservation';
  status: 'draft' | 'active' | 'paused';
  seatingCapacity?: number;
  /** Largest group on one booking; a bigger request is refused */
  maxPartySize?: number | null;
  /** How long the host has to answer a request (default 48) */
  respondWithinHours?: number | null;
  /** How long a guest has to pay once accepted (default 24) */
  payWithinHours?: number | null;
  paymentType?: ReservationPaymentType | null;
  /** Per guest, when paymentType is deposit */
  depositAmount?: MoneyAmount | null;
  entryFees?: PlaceEntryFee[];
  /** On the single-profile read only, for the place's managers */
  payoutAccount?: ReservationPayoutAccount | null;
  // Creating a profile auto-provisions a draft "anchor" experience; bookings
  // hang off it server-side. Diners never see it.
  experienceId?: string;
  experienceTitle?: string;
  experienceDescription?: string;
  photos?: Photo[];
};

/** Fixed weekly opening hours for a profile. */
export type PlaceAvailabilityRule = {
  id: string;
  reservationProfile: string;
  // 0 = Monday .. 6 = Sunday (per the API's own field description)
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: number;
};

/** A one-off closure or override on a single date. */
export type PlaceAvailabilityException = {
  id: string;
  reservationProfile: string;
  // YYYY-MM-DD
  date: string;
  isClosed?: boolean;
  openTime?: string;
  closeTime?: string;
};

export type CreatePlaceAvailabilityException = {
  // YYYY-MM-DD
  date: string;
  isClosed: boolean;
  // 'HH:MM', only when part of the day stays open
  openTime?: string;
  closeTime?: string;
};

export type RestaurantReservationDetail = {
  partySize: number;
  specialRequests?: string;
};

/**
 * A table request. The API returns a Purchase, so a reservation carries the
 * same lifecycle as a ticket - the venue's owner accepts or declines it.
 */
export type PlaceBookingRequest = {
  id: string;
  purchaseNumber?: string;
  status:
    | 'requested'
    | 'accepted'
    | 'declined'
    | 'pending'
    | 'completed'
    | 'failed'
    | 'redeemed'
    | 'cancelled'
    | 'expired'
    | 'refunded';
  restaurantDetail?: RestaurantReservationDetail;
  occurrence?: { id: string; startDate?: string; endDate?: string };
  user?: LinkedUser;
  message?: string;
  // When the venue must respond by
  respondBy?: string;
  payBy?: string;
  declineReason?: string;
  cancellationReason?: string;
  dateCreated?: string;
};

/**
 * The body of POST …/booking-requests/, per
 * `WriteOnlyRestaurantBookingRequestCreateSerializer`. It is flat - not the
 * `ticket_purchases` array the experience purchase paths take - and the first
 * three fields are required.
 */
export type CreatePlaceBookingRequest = {
  // 'YYYY-MM-DD'
  requestedDate: string;
  // 'HH:MM'
  requestedTime: string;
  partySize: number;
  specialRequests?: string;
  message?: string;
};

/**
 * What the reservation settings screen sends when it saves: the profile, its
 * payment terms and its weekly hours, in one request.
 */
export type ReservationSettingsDraft = {
  /** Absent until the place has been opened to reservations at all */
  profileId?: string;
  profile: {
    reservationType: PlaceReservationProfile['reservationType'];
    seatingCapacity?: number;
    maxPartySize?: number;
    respondWithinHours?: number;
    payWithinHours?: number;
    paymentType: ReservationPaymentType;
    depositAmount?: MoneyAmount | null;
    entryFees?: { guestType: string; price: MoneyAmount }[];
  };
  /** The whole weekly schedule; saving replaces what was there */
  rules: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    slotIntervalMinutes?: number;
  }[];
  isActive: boolean;
  /** Lent to the profile's anchor experience when it has none, so activation can go through */
  placePhotos?: Photo[];
};
