'use client';

import { useCallback, useRef, useState } from 'react';

import { LocationAutocompleteField } from '@/app/shared/components/LocationPicker';
import { useGoogleMapsAutocomplete } from '@/app/shared/hooks/usePlaces';
import { TimePicker } from '@/components/ui/time-picker';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';

interface MeetingDetailsInputProps {
  meetingPoint: string;
  meetingTime: string | null;
  onMeetingPointChange: (value: string) => void;
  onMeetingTimeChange: (value: string) => void;
}

export const MeetingDetailsInput = ({
  meetingPoint,
  meetingTime,
  onMeetingPointChange,
  onMeetingTimeChange,
}: MeetingDetailsInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(meetingPoint);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: googlePlaces, isFetching: isFetchingGooglePlaces } = useGoogleMapsAutocomplete(
    inputValue,
    inputValue.length > 2,
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      onMeetingPointChange(newValue);
      setShowSuggestions(true);
    },
    [onMeetingPointChange],
  );

  const handleSelectSuggestion = useCallback(
    (place: GoogleMapsAutocompletePrediction) => {
      onMeetingPointChange(place.description);
      setInputValue(place.description);
      setShowSuggestions(false);
    },
    [onMeetingPointChange],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="meeting-point" className="text-xs font-medium text-gray-800">
          Meeting Details (Optional)
        </label>
        <LocationAutocompleteField
          containerRef={containerRef}
          value={inputValue}
          placeholder="Meeting/Pick-up Point"
          showSuggestions={showSuggestions}
          suggestions={googlePlaces?.data || []}
          isLoading={isFetchingGooglePlaces}
          onValueChange={handleValueChange}
          onFocus={() => setShowSuggestions(true)}
          onSelectSuggestion={handleSelectSuggestion}
        />
        <TimePicker
          value={meetingTime || undefined}
          onChange={onMeetingTimeChange}
          placeholder="Select time"
        />
      </div>
    </div>
  );
};
