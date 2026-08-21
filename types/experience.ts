import { Status } from '@/enums/status';
import { ExperienceCategory } from '@/types/experienceCategory';
import { Location } from '@/types/location';
import { User } from '@/types/user';

import { Photo } from './photo';
import { Ticket } from './ticket';

export type Experience = {
  id: string;
  title: string;
  description: string;
  location: Location;
  startDate: string;
  endDate: string;
  recurrenceRule?: string | null;
  // Returned by the API alongside the dates; drives the itinerary vs standard
  // split (see inferUIExperienceType)
  experienceType?: 'standard' | 'itinerary';
  currency: string;
  isPaid: boolean;
  ticketSalesClosingDuration: number;
  ticketSalesClosingUnit: 'minutes' | 'hours' | 'days';
  ticketSalesClosingCondition: 'before_end' | 'before_start';
  priceStartsFrom: { amount: number; currency: string };
  // Remaining inventory, not a flag — the API sends a count here (and the same
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
  meetingPoint?: string;
  meetingTime?: string;
  // Who absorbs Tukai's commission. Drives each ticket's buyer_price.
  feesAllocation?: 'host_pays' | 'customer_pays' | 'split' | null;
  dateCreated: string;
  // Not documented on every response — parseSnakeToCamel maps `date_updated`
  // when the API sends it. Read it through getLastSavedAt(), which falls back
  // to dateCreated so callers never depend on it being present.
  dateUpdated?: string;
  guests: {
    id: string;
    email: string;
    dateCreated: string;
    status: 'invited' | 'accepted' | 'declined';
  }[];
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
  itineraryMode?: 'fixed' | 'flexible';
  itineraryDurationDays?: number;
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
