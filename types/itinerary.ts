export interface ItineraryDayFormValue {
  id: string; // local uuid
  apiId?: string; // returned by API after POST
  dayNumber: number; // 1-based
  title: string; // "Activity Title"
  description: string;
  placeId?: string | null; // google place id
  placeName?: string | null; // display name
}

export interface ItineraryDayPayload {
  day_number: number;
  title: string;
  description: string;
}
