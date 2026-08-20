export interface ItineraryActivity {
  id: string; // local uuid
  activityApiId?: string; // set after POST
  title: string;
  description: string;
  placeId: string | null; // optional
  placeName: string | null;
  placeImageUrl: string | null;
  placeCity: string | null;
  locationId: string | null;
  startTime: string | null; // "HH:MM"
  endTime: string | null; // "HH:MM"
}

export interface ItineraryDayFormValue {
  id: string; // local uuid
  apiId: string;
  dayNumber: number; // 1-based
  title: string; // day title
  description: string; // day description
  activities: ItineraryActivity[]; // multiple activities per day
}

export interface ItineraryDayPayload {
  day_number: number;
  title: string;
  description: string;
  id?: string; // optional, only for updates
}

/**
 * What /v1/experiences/{id}/itinerary-days/ returns after parseSnakeToCamel.
 * Distinct from ItineraryDayFormValue above, which is the create flow's local
 * draft shape — the API carries no client uuid and nests a full place object.
 */
export interface ItineraryDayActivity {
  id: string;
  title: string;
  description: string;
  // "06:00:00"
  startTime: string | null;
  endTime: string | null;
  order: number;
  location: string | null;
  place: {
    id: string;
    title: string;
    photos?: { id: string; photo: string | null; isCover?: boolean }[];
  } | null;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: ItineraryDayActivity[];
}

// The API stores no per-day date; a day is its offset from the experience start
export const itineraryDayDate = (
  experienceStart: string | null | undefined,
  dayNumber: number,
): Date | null => {
  if (!experienceStart || !Number.isFinite(dayNumber)) return null;

  const date = new Date(experienceStart);
  if (Number.isNaN(date.getTime())) return null;

  date.setDate(date.getDate() + dayNumber - 1);
  return date;
};

export const activityPhoto = (activity: ItineraryDayActivity): string | null => {
  const photos = activity.place?.photos ?? [];
  const cover = photos.find((photo) => photo.isCover)?.photo;
  return cover || photos[0]?.photo || null;
};
