export interface GoogleMapsAutocompletePrediction {
  description: string;
  place_id: string;
  reference: string;
  structured_formatting: {
    main_text: string;
    main_text_matched_substrings: Array<{
      length: number;
      offset: number;
    }>;
    secondary_text: string;
  };
  terms: Array<{
    offset: number;
    value: string;
  }>;
  types: string[];
}

export interface GoogleMapsAutocompleteResponse {
  predictions: GoogleMapsAutocompletePrediction[];
  status: string;
}
