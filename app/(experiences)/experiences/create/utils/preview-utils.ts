import type {
  CommunityOption,
  FormData,
  FormPhoto,
} from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { buildRecurrenceRule } from '@/app/(experiences)/experiences/create/utils/buildRecurrenceRule';
import { Status } from '@/enums/status';
import { Experience } from '@/types/experience';
import { Location } from '@/types/location';
import { Photo } from '@/types/photo';
import { Ticket } from '@/types/ticket';
import { User } from '@/types/user';
import { getTicketBuyerPrice } from '@/utils/ticket-utils';

/**
 * Maps the in-progress create-experience form onto the Experience shape the
 * customer detail view consumes, so the Preview step can render the REAL
 * detail components (ViewExperiencePageContent) rather than a parallel copy.
 *
 * Fields the form cannot know yet are synthesised — see PREVIEW_DEFAULTS below.
 * Nothing here may throw on a half-filled form: the creator can open Preview at
 * any point in the flow.
 */

export const PREVIEW_EXPERIENCE_ID = 'preview';

export interface PreviewContext {
  // The saved experience's id once it exists. BookingPanel loads occurrences by
  // id, so passing the real one makes slots and per-slot tickets render exactly
  // as customers will see them. Falls back to a synthetic id before creation,
  // where the panel simply has no slots to show.
  experienceId?: string | null;
  hostCommunity?: CommunityOption | null;
  // The NextAuth session user — the creator previews as their own host card
  currentUser?: { id?: string | null; name?: string | null; image?: string | null } | null;
  // Resolved from about.locationPlaceId via the Google geocode endpoint
  geocodedLocation?: Partial<Location> | null;
}

/**
 * The session carries `name`/`image`; the host card wants first/last/display
 * and a hosted count the session has no idea about.
 */
export const mapSessionUserToHost = (sessionUser: PreviewContext['currentUser']): User => {
  const name = sessionUser?.name ?? '';
  const [firstName = '', ...rest] = name.split(' ');

  return {
    id: sessionUser?.id ?? 'preview-host',
    firstName,
    lastName: rest.join(' '),
    displayName: name,
    picture: sessionUser?.image ?? '',
    experienceHostedCount: 0,
  };
};

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * Narrows a Google geocode result to the Location fields the detail view reads
 * (map coordinates + city/country label).
 */
export const mapGeocodeResultToLocation = (result: any): Partial<Location> | null => {
  if (!result?.geometry?.location) return null;

  const { lat, lng } = result.geometry.location;
  const components: GoogleAddressComponent[] = result.address_components ?? [];
  const findComponent = (type: string) =>
    components.find((component) => component.types.includes(type))?.long_name ?? '';

  return {
    formattedAddress: result.formatted_address ?? '',
    street: findComponent('route'),
    city: findComponent('locality') || findComponent('administrative_area_level_2'),
    state: findComponent('administrative_area_level_1'),
    country: findComponent('country'),
    pointLat: lat,
    pointLong: lng,
    // GeoJSON order is [lng, lat] — the same order the API returns
    point: { type: 'Point', coordinates: [lng, lat] },
  };
};

const toIsoDateTime = (date: string | null, time: string | null, endOfDay = false): string => {
  if (!date) return '';
  if (time) return `${date}T${time}:00`;
  return endOfDay ? `${date}T23:59:59` : `${date}T00:00:00`;
};

/**
 * Photo order is the creator's: the About step lets them drag photos to
 * reorder, and the first one is the cover. Marking index 0 as `isCover` keeps
 * the detail view's cover-first sort a no-op, so the hero carousel shows
 * exactly the order set in the form.
 */
export const mapFormPhotosToPreview = (photos: FormPhoto[]): Photo[] =>
  photos.map((photo, index) => ({
    id: photo.id,
    mediaType: 'photo' as const,
    // Local object URLs / data URIs render in <Image> the same as remote ones
    photo: photo.url,
    isCover: index === 0,
  }));

export const mapFormTicketsToPreview = (formData: FormData): Ticket[] =>
  formData.tickets.items.map((item) => ({
    id: item.apiId ?? item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.amount,
    // Only saved tickets have one — a draft the API has not seen yet previews
    // at the host's base amount
    buyerPrice:
      item.buyerPrice != null
        ? { amount: item.buyerPrice, currency: PREVIEW_DEFAULTS.currency }
        : null,
    experience: PREVIEW_EXPERIENCE_ID,
    availableQuantity: item.quantity,
    // Preview tickets are never scoped to a slot template: without one they
    // always pass BookingPanel's visibility filter, so the creator sees every
    // ticket they defined rather than an empty "no tickets for this slot" list
    slotTemplate: null,
    salesStartDate: item.salesStartDate,
    salesStartTime: item.salesStartTime,
    salesEndDate: item.salesEndDate,
    salesEndTime: item.salesEndTime,
    salesStartRelative: item.salesStartRelative,
    salesEndRelative: item.salesEndRelative,
  }));

/**
 * Start/end come from a different pair of fields per experience type — the form
 * keeps them separate so switching type does not clobber the other's dates.
 */
export const resolvePreviewDates = (
  dateType: FormData['dateType'],
): { startDate: string; endDate: string } => {
  if (dateType.experienceType === 'itinerary') {
    return {
      startDate: toIsoDateTime(dateType.itineraryStartDate, null),
      endDate: toIsoDateTime(dateType.itineraryEndDate, null, true),
    };
  }

  if (dateType.experienceType === 'multi-day') {
    return {
      startDate: toIsoDateTime(dateType.multiDayStartDate, dateType.multiDayStartTime),
      endDate: toIsoDateTime(dateType.multiDayEndDate, dateType.multiDayEndTime, true),
    };
  }

  if (dateType.isRecurring) {
    const firstSlot = dateType.timeSlots?.[0];
    return {
      startDate: toIsoDateTime(dateType.recurrenceStartDate, firstSlot?.startTime ?? null),
      endDate: toIsoDateTime(dateType.recurrenceEndDate, firstSlot?.endTime ?? null, true),
    };
  }

  return {
    startDate: toIsoDateTime(dateType.date, dateType.startTime),
    endDate: toIsoDateTime(dateType.date, dateType.endTime, true),
  };
};

const mapPreviewLocation = (
  formData: FormData,
  geocoded: Partial<Location> | null | undefined,
): Location =>
  ({
    id: 'preview-location',
    // The form only captures a display string; geocoding fills the rest
    name: formData.about.location,
    formattedAddress: geocoded?.formattedAddress ?? formData.about.location,
    street: geocoded?.street ?? '',
    city: geocoded?.city ?? '',
    state: geocoded?.state ?? '',
    country: geocoded?.country ?? '',
    pointLat: geocoded?.pointLat as number,
    pointLong: geocoded?.pointLong as number,
    point: geocoded?.point as Location['point'],
    googleMapPlaceId: formData.about.locationPlaceId || undefined,
  }) as Location;

/**
 * Values the detail view requires that a not-yet-published experience has no
 * truthful answer for. Kept in one place so the report of "what was faked"
 * stays honest.
 */
const PREVIEW_DEFAULTS = {
  isBookmarked: false,
  isSoldOut: false,
  ticketsAvailable: 0,
  reservedTicketsCount: 0,
  coHosts: [] as User[],
  currency: 'Ksh.',
  // The form sets sales-closing per ticket; Experience carries one scalar pair.
  // These mirror the copy the Cancellation Policy section renders.
  ticketSalesClosingDuration: 1,
  ticketSalesClosingUnit: 'hours' as const,
  ticketSalesClosingCondition: 'before_start' as const,
};

export const buildPreviewExperience = (
  formData: FormData,
  context: PreviewContext = {},
): Experience => {
  const { dateType, about, invite } = formData;
  const { startDate, endDate } = resolvePreviewDates(dateType);
  const previewTickets = mapFormTicketsToPreview(formData);

  // "From" pricing is shown to buyers, so it follows the buyer price
  const ticketPrices = previewTickets
    .map((ticket) => getTicketBuyerPrice(ticket))
    .filter((price) => Number.isFinite(price));

  const hostCommunity = context.hostCommunity ?? dateType.community;

  return {
    id: context.experienceId || PREVIEW_EXPERIENCE_ID,
    status: Status.Draft,
    dateCreated: new Date().toISOString(),

    title: about.title,
    description: about.description,
    whatsIncluded: about.whatsIncluded,
    whatsNotIncluded: about.whatsNotIncluded,
    meetingPoint: about.meetingPoint,
    meetingTime: about.meetingTime ?? undefined,

    photos: mapFormPhotosToPreview(about.photos),
    location: mapPreviewLocation(formData, context.geocodedLocation),
    // Interest and ExperienceCategory differ only in `icon` being optional
    categories: about.categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon ?? '',
    })),

    startDate,
    endDate,
    recurrenceRule: dateType.isRecurring ? buildRecurrenceRule(dateType) : null,
    experienceType: dateType.experienceType === 'itinerary' ? 'itinerary' : 'standard',

    isPaid: dateType.experiencePricing === 'paid',
    isPublic: about.visibility === 'public',
    tickets: previewTickets,
    priceStartsFrom: {
      amount: ticketPrices.length > 0 ? Math.min(...ticketPrices) : 0,
      currency: PREVIEW_DEFAULTS.currency,
    },

    host: mapSessionUserToHost(context.currentUser),
    hostCommunity: hostCommunity
      ? {
          id: hostCommunity.id,
          title: hostCommunity.name,
          photos: hostCommunity.imageUrl
            ? [{ id: hostCommunity.id, mediaType: 'photo', photo: hostCommunity.imageUrl }]
            : [],
        }
      : undefined,
    guests: invite.invitedGuests,

    ...PREVIEW_DEFAULTS,
  };
};
