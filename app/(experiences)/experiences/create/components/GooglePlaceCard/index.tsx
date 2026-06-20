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
    <div className="flex items-center justify-between gap-3 border border-dashed border-gray-200 rounded-xl px-4 py-3 bg-white">
      {/* Location icon + text */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
          <IconComponent iconName="Location01Icon" size={18} className="text-primary" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{mainText}</p>
          {secondaryText && <p className="text-xs text-gray-500 truncate">{secondaryText}</p>}
        </div>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={onAdd}
        disabled={isAdded}
        className={`
          flex items-center gap-1 px-3 py-1.5 rounded-full text-xs
          font-medium flex-shrink-0 transition-colors
          ${
            isAdded
              ? 'bg-white text-primary border border-primary'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'
          }
        `}
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
