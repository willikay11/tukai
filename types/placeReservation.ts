/** A place's bookability configuration, set up by its owning community. */
export type PlaceReservationProfile = {
  id: string;
  place: string;
  reservationType: 'restaurant_reservation' | 'cinema_reservation';
  status: 'draft' | 'active' | 'paused';
  seatingCapacity?: number;
  // Creating a profile auto-provisions a draft "anchor" experience; bookings
  // hang off it server-side. Diners never see it.
  experienceId?: string;
  experienceTitle?: string;
  experienceDescription?: string;
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

export type RestaurantReservationDetail = {
  partySize: number;
  specialRequests?: string;
};

/**
 * A table request. The API returns a Purchase, so a reservation carries the
 * same lifecycle as a ticket — the venue's owner accepts or declines it.
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
  // When the venue must respond by
  respondBy?: string;
  declineReason?: string;
  cancellationReason?: string;
  dateCreated?: string;
};

/**
 * ⚠️ INFERRED SHAPE. The spec documents no request body for
 * POST .../booking-requests/ (`parameters: []`), same as the guides endpoint it
 * mirrors. This follows the documented `TicketPurchaseRequest`
 * (ticket_id/quantity/party_size/special_requests) and
 * `WriteOnlyExperienceReservationSerializer` (occurrence + purchaser details),
 * which is what every other purchase path on this API takes.
 *
 * Confirm with the backend before relying on it — a wrong field name fails at
 * runtime, not at build.
 */
export type CreatePlaceBookingRequest = {
  occurrence?: string;
  ticketPurchases: {
    ticketId?: string;
    quantity: number;
    partySize: number;
    specialRequests?: string;
  }[];
  firstName?: string;
  lastName?: string;
  confirmationEmail?: string;
  whatsappPhone?: string;
};
