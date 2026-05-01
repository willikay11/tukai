'use client';

import { useCallback, useRef, useState } from 'react';

import { LocationAutocompleteField } from '@/app/shared/components/LocationPicker';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';

interface ExperienceLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ExperienceLocationInput = ({ value, onChange, error }: ExperienceLocationInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<GoogleMapsAutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleValueChange = useCallback((newValue: string) => {
    onChange(newValue);
  }, [onChange]);

  const handleSelectSuggestion = useCallback((place: GoogleMapsAutocompletePrediction) => {
    onChange(place.description);
    setShowSuggestions(false);
    setSuggestions([]);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label htmlFor="experience-location" className="text-xs font-medium text-gray-800">
        Where will the experience take place?
      </label>
      <LocationAutocompleteField
        containerRef={containerRef}
        value={value}
        placeholder="Add location/name of the place..."
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        isLoading={isLoading}
        onValueChange={handleValueChange}
        onFocus={handleFocus}
        onSelectSuggestion={handleSelectSuggestion}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
