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
