import { RefObject } from 'react';

import { Input } from '@/components/ui/input';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';

import { Loader } from '@/app/shared/components/Forms/form';
import { IconComponent } from '@/app/shared/components/Icons';

type LocationAutocompleteFieldProps = {
  containerRef?: RefObject<HTMLDivElement>;
  value: string;
  placeholder?: string;
  inputClassName?: string;
  showSuggestions: boolean;
  minQueryLength?: number;
  suggestions?: GoogleMapsAutocompletePrediction[];
  isLoading?: boolean;
  onValueChange: (value: string) => void;
  onFocus?: () => void;
  onSelectSuggestion: (place: GoogleMapsAutocompletePrediction) => void;
};

export const LocationAutocompleteField = ({
  containerRef,
  value,
  placeholder = 'City e.g. Nairobi, Watamu...',
  inputClassName = 'h-[50px]',
  showSuggestions,
  minQueryLength = 3,
  suggestions = [],
  isLoading = false,
  onValueChange,
  onFocus,
  onSelectSuggestion,
}: LocationAutocompleteFieldProps) => {
  const canShowDropdown =
    showSuggestions && value.length >= minQueryLength && (isLoading || suggestions.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder={placeholder}
        className={inputClassName}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onFocus={onFocus}
        suffixIcon={<IconComponent iconName="Location06Icon" size={18} className="text-gray-800" />}
      />

      {canShowDropdown && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="flex items-center px-4 py-3 text-sm text-gray-600">
              <Loader size="small" />
              <span>Searching locations...</span>
            </div>
          ) : (
            suggestions.map((place) => (
              <button
                key={place.place_id}
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
                onClick={() => onSelectSuggestion(place)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <IconComponent iconName="Location01Icon" color="#10B981" size={20} />
                </div>
                <span className="text-gray-700">{place.description}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
