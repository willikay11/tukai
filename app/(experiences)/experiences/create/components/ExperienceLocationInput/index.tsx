'use client';

import { useCallback, useRef, useState } from 'react';

import { LocationAutocompleteField } from '@/app/shared/components/LocationPicker';
import { useGoogleMapsAutocomplete } from '@/app/shared/hooks/usePlaces';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';

interface ExperienceLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ExperienceLocationInput = ({ value, onChange, error }: ExperienceLocationInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: googlePlaces, isFetching: isFetchingGooglePlaces } = useGoogleMapsAutocomplete(
    inputValue,
    inputValue.length > 2,
  );

  const handleFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleValueChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      onChange(newValue);
      setShowSuggestions(true);
    },
    [onChange],
  );

  const handleSelectSuggestion = useCallback((place: GoogleMapsAutocompletePrediction) => {
    onChange(place.description);
    setInputValue(place.description);
    setShowSuggestions(false);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label htmlFor="experience-location" className="text-xs font-medium text-gray-800">
        Where will the experience take place?
      </label>
      <LocationAutocompleteField
        containerRef={containerRef}
        value={inputValue}
        placeholder="Add location(s) of the place..."
        showSuggestions={showSuggestions}
        suggestions={googlePlaces?.data || []}
        isLoading={isFetchingGooglePlaces}
        onValueChange={handleValueChange}
        onFocus={handleFocus}
        onSelectSuggestion={handleSelectSuggestion}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
