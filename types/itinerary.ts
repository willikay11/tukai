export interface ItineraryActivity {
  id: string; // local uuid
  activityApiId?: string; // set after POST
  title: string;
  description: string;
  placeId: string | null; // optional
  placeName: string | null;
  placeImageUrl: string | null;
  placeCity: string | null;
  startTime: string | null; // "HH:MM"
  endTime: string | null; // "HH:MM"
}

export interface ItineraryDayFormValue {
  id: string; // local uuid
  apiId?: string; // returned by API after POST
  dayNumber: number; // 1-based
  activities: ItineraryActivity[]; // multiple activities per day
  title?: string; // kept for API compatibility, not rendered
  description?: string; // kept for API compatibility, not rendered
}

export interface ItineraryDayPayload {
  day_number: number;
  title: string;
  description: string;
  id?: string; // optional, only for updates
}
