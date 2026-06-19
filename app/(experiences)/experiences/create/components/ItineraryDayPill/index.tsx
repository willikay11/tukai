'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { ItineraryDayFormValue } from '@/types/itinerary';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AddPlaceModal } from '../AddPlaceModal';

interface ItineraryDayPillProps {
  day: ItineraryDayFormValue;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (data: Partial<ItineraryDayFormValue>) => void;
  onDelete: () => void;
  isSaving?: boolean;
  error?: string;
}

export const ItineraryDayPill = ({
  day,
  isExpanded,
  onToggle,
  onChange,
  onDelete,
  isSaving,
  error,
}: ItineraryDayPillProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="relative flex gap-3">
      {/* Timeline dot + dashed vertical line */}
      <div className="flex flex-col items-center relative">
        <div className="mt-3.5 h-1.5 w-1.5 flex-shrink-0 rounded-full border-2 border-gray-300 bg-gray-300 z-10" />
        <div className="pointer-events-none absolute mt-4 h-0 w-3.5 left-1 border-t-[1px] border-dashed border-gray-300" />
        <div className="mt-1 flex-1 border-l-[1px] border-dashed border-gray-300 absolute top-2.5 -bottom-[14px]" />
      </div>

      {/* Pill + expanded content */}
      <div className="flex-1 pb-3">
        {/* Pill header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-800 hover:border-gray-400 transition-colors"
          >
            <IconComponent iconName="Calendar03Icon" size={16} className="text-gray-500" />
            <span>Day {day.dayNumber}</span>
            <IconComponent
              iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
              size={14}
              className="text-gray-400"
            />
          </button>

          {/* Edit icon */}
          <button
            type="button"
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>

          {/* Delete icon */}
          <button
            type="button"
            onClick={onDelete}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <IconComponent iconName="Delete02Icon" size={16} />
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 space-y-3">
            {/* Activity Title */}
            <Input
              value={day.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Activity Title"
            />

            {/* Description */}
            <Textarea
              value={day.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Add a brief description about the day's experiences/activities"
              rows={4}
            />

            {/* Add Place */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-800">
                Where will these activities take place?
              </p>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                <IconComponent
                  iconName="PlusSignCircleIcon"
                  size={16}
                  className="text-primary"
                />
                {day.placeName ? 'Change Place' : 'Add Place'}
              </button>

              {/* Show selected place name if set */}
              {day.placeName && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-primary/5 rounded-lg">
                  <IconComponent
                    iconName="Location01Icon"
                    size={14}
                    className="text-primary flex-shrink-0"
                  />
                  <span className="text-xs text-gray-700 flex-1">{day.placeName}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        placeId: null,
                        placeName: null,
                      })
                    }
                    className="text-gray-400 hover:text-red-400 flex-shrink-0"
                  >
                    <IconComponent iconName="Cancel01Icon" size={12} />
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}

        {/* Place picker modal */}
        <AddPlaceModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          selectedPlaceIds={day.placeId ? [day.placeId] : []}
          onSelect={(place) => {
            onChange({
              placeId: place.id,
              placeName: place.name,
            });
            setIsPickerOpen(false);
          }}
        />
      </div>
    </div>
  );
};
