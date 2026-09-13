'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';

interface GooglePlaceCardProps {
  prediction: GoogleMapsAutocompletePrediction;
  onAdd: () => void;
  isAdded: boolean;
}

export const GooglePlaceCard = ({ prediction, onAdd, isAdded }: GooglePlaceCardProps) => {
  const mainText = prediction.structured_formatting?.main_text ?? prediction.description;
  const secondaryText = prediction.structured_formatting?.secondary_text ?? '';

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3">
      {/* Location icon + text */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <IconComponent iconName="Location01Icon" size={18} className="text-primary" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{mainText}</p>
          {secondaryText && <p className="truncate text-xs text-gray-500">{secondaryText}</p>}
        </div>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={onAdd}
        disabled={isAdded}
        className={`flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          isAdded
            ? 'border border-primary bg-white text-primary'
            : 'border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary'
        } `}
      >
        <IconComponent
          iconName={isAdded ? 'CheckmarkCircle01Icon' : 'PlusSignCircleIcon'}
          size={14}
        />
        {isAdded ? 'Added' : 'Add'}
      </button>
    </div>
  );
};
