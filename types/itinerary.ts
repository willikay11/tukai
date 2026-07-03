export interface ItineraryDayPlace {
  id: string; // local uuid
  placeId: string; // google place id
  placeName: string; // display name
  imageUrl: string | null;
  city: string | null;
  startTime: string | null; // "HH:MM"
  endTime: string | null; // "HH:MM"
  activityApiId?: string; // returned after POST
}

export interface ItineraryDayFormValue {
  id: string; // local uuid
  apiId?: string; // returned by API after POST
  dayNumber: number; // 1-based
  title: string; // "Activity Title"
  description: string;
  places: ItineraryDayPlace[]; // multiple places per day
}

export interface ItineraryDayPayload {
  day_number: number;
  title: string;
  description: string;
  id?: string; // optional, only for updates
}
