import { Status } from '@/enums/status';
import { ExperienceCategory } from '@/types/experienceCategory';
import { Location } from '@/types/location';
import { User } from '@/types/user';

import { Photo } from './photo';
import { Ticket } from './ticket';

/** The five kinds the API's `experience_type` filter accepts. */
export type ExperienceType =
  | 'standard'
  | 'itinerary'
  | 'restaurant_reservation'
  | 'cinema_reservation'
  | 'guide_booking';

export type Experience = {
  id: string;
  // Human-readable identifier, and what the detail URL uses. The API resolves
  // either this or the UUID, so older id-based links keep working.
  slug?: string;
  title: string;
  description: string;
  location: Location;
  startDate: string;
  endDate: string;
  // IANA zone where the experience happens, e.g. 'Africa/Nairobi'. The dates
  // are UTC instants; this is the zone to show them in and edit them in.
  timezone?: string;
  recurrenceRule?: string | null;
  // Returned by the API alongside the dates; drives the itinerary vs standard
  // split (see inferUIExperienceType)
  experienceType?: ExperienceType;
  // Set by the editors on the list serializer. There is no query param for it,
  // so a caller filters the page it has.
  featured?: boolean;
  currency: string;
  isPaid: boolean;
  ticketSalesClosingDuration: number;
  ticketSalesClosingUnit: 'minutes' | 'hours' | 'days';
  ticketSalesClosingCondition: 'before_end' | 'before_start';
  priceStartsFrom: { amount: number; currency: string };
  // Remaining inventory, not a flag - the API sends a count here (and the same
  // count again as available_tickets)
  ticketsAvailable: number;
  availableTickets?: number;
  reservedTicketsCount?: number;
  // Host-only fields: the API includes these when the requesting user owns the
  // experience. Money values arrive as decimal strings.
  totalTickets?: number;
  ticketsCreated?: number;
  ticketsSold?: number;
  targetSales?: { amount: string | number; currency: string };
  totalExpectedTicketSales?: { amount: string | number; currency: string };
  totalAmountSold?: { amount: string | number; currency: string };
  // What this user actually paid across their tickets for this experience.
  // Amount arrives as a decimal string ("190.00").
  reservedTicketsAmount?: { amount: string | number; currency: string };
  isSoldOut: boolean;
  isPublic: boolean;
  isBookmarked: boolean;
  categories: ExperienceCategory[];
  tickets: Ticket[];
  photos: Photo[];
  status: Status;
  host: User;
  coHosts: User[];
  hostCommunity?: { id: string; title: string; photos?: Photo[] };
  place?: { id: string; title: string; photos?: Photo[] } | null;
  whatsIncluded?: string;
  whatsNotIncluded?: string;
  /** `meeting_place` on the API - the saved text address, not a place object. */
  meetingPlace?: string;
  meetingTime?: string;
  // Who absorbs Tukai's commission. Drives each ticket's buyer_price.
  feesAllocation?: 'host_pays' | 'customer_pays' | 'split' | null;
  dateCreated: string;
  // Not documented on every response - parseSnakeToCamel maps `date_updated`
  // when the API sends it. Read it through getLastSavedAt(), which falls back
  // to dateCreated so callers never depend on it being present.
  dateUpdated?: string;
  guests: {
    id: string;
    email: string;
    dateCreated: string;
    status: 'invited' | 'accepted' | 'declined';
  }[];
  // The communities this experience was shared with. Read-only on the detail
  // serializer; the create flow sends them as `invitedCommunityIds`.
  communities?: { id: string; title: string; photos?: Photo[] }[];
};

export type ExperienceOccurrence = {
  id: string;
  startDate: string;
  endDate: string;
  // Only recurring experiences and multi-day "entire period" tickets create
  // slot templates. Itinerary and plain single-day occurrences arrive without
  // one, so every read has to be guarded.
  slotTemplate: {
    id: string;
    name?: string;
    startTime: string | null;
    durationMinutes: number | null;
    recurrenceRule?: string;
    dateCreated?: string;
  } | null;
};

export interface InvitedMember {
  id: string;
  name: string;
  email?: string;
  image?: string;
}

export type CreateExperience = {
  title: string;
  description: string;
  googleMapPlaceId?: string;
  placeId?: string;
  startDate: string;
  endDate: string;
  // IANA zone the dates were entered in. Optional: the API defaults to the
  // host's profile zone, or Africa/Nairobi.
  timezone?: string;
  recurrence_rule: string;
  categoriesIds: string[];
  isPublic?: boolean;
  isPaid?: boolean;
  newPhotos?: File[];
  invitedCommunityIds?: string[];
  invitedGuestsEmails?: string[];
  hostCommunityId?: string;
  whatsIncluded?: string;
  whatsNotIncluded?: string;
  feesAllocation?: 'host_pays' | 'customer_pays' | 'split';
  meetingPlace?: string | null;
  meetingTime?: string | null;
  experienceType?: 'standard' | 'itinerary';
  // Fixed: the host sets the dates. Open: the buyer picks a departure date
  // within start_date..end_date (the web only creates fixed ones so far).
  itineraryMode?: 'fixed' | 'open';
  itineraryDurationDays?: number;
  // When ticket sales stop, relative to the experience. One setting for the
  // whole experience, which every ticket's expiry is then read from.
  ticketSalesClosingDuration?: number;
  ticketSalesClosingUnit?: 'days' | 'hours' | 'minutes';
  ticketSalesClosingCondition?: 'before_start' | 'before_end';
};

export type CreateExperienceTicket = {
  experience: string;
  name: string;
  quantity: number;
  price: string;
  is_paid?: boolean;
  availableQuantity?: number;
  sales_start_date?: string | null;
  sales_end_date?: string | null;
  ticket_sales_closing_duration?: number | null;
  ticket_sales_closing_unit?: 'days' | 'hours' | 'minutes' | null;
  ticket_sales_closing_condition?: 'before_start' | 'before_end' | null;
  slot_template?: string | null;
};

export function isExperience(item: any): item is Experience {
  return 'ticketsAvailable' in item && 'isSoldOut' in item;
}

type SalesMoney = { amount: string; currency: string };

/**
 * GET /v1/experiences/{id}/sales-stats/ (DEV-371): one experience's sales,
 * for its primary host only (a co-host gets 403).
 *
 * revenue is what buyers paid, after promo discounts; listSales is the same
 * sales at list price. hostNet = listSales - hostFundedDiscount - commission.
 * pendingBalance is host net not withdrawable yet; availableBalance can be
 * withdrawn now. dailySales sums to revenue.
 */
export type ExperienceSalesStats = {
  currency: string;
  revenue: SalesMoney;
  listSales: SalesMoney;
  hostFundedDiscount: SalesMoney;
  tukaiFundedDiscount: SalesMoney;
  commission: SalesMoney;
  hostNet: SalesMoney;
  availableBalance: SalesMoney;
  pendingBalance: SalesMoney;
  ticketsSold: number;
  /** Tickets sold per day since the first sale, e.g. "4.0" */
  averageDailySales: string;
  dailySales: { date: string; tickets: number; amount: SalesMoney }[];
};
