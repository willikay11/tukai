'use client';

import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { IconComponent } from '@/app/shared/components/Icons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ItineraryDayFormValue, ItineraryDayPlace } from '@/types/itinerary';
import {
  createItineraryDayActivity,
  updateItineraryDayActivity,
  type ItineraryActivityPayload,
} from '@/services/experience';
import { parseApiError } from '@/utils/parseApiError';

import { AddPlaceModal } from '../AddPlaceModal';
import { ItineraryPlaceCard } from '../ItineraryPlaceCard';

interface ItineraryDayPillProps {
  day: ItineraryDayFormValue;
  isExpanded: boolean;
  itineraryStartDate: string | null;
  experienceId: string | null;
  onToggle: () => void;
  onChange: (data: Partial<ItineraryDayFormValue>) => void;
  onDelete: () => void;
  isSaving?: boolean;
  error?: string;
}

const getDayDate = (itineraryStartDate: string | null, dayNumber: number): string | null => {
  if (!itineraryStartDate) return null;
  const start = new Date(itineraryStartDate);
  start.setDate(start.getDate() + dayNumber - 1);
  return start.toISOString().split('T')[0];
};

export const ItineraryDayPill = ({
  day,
  isExpanded,
  itineraryStartDate,
  experienceId,
  onToggle,
  onChange,
  onDelete,
  isSaving,
  error,
}: ItineraryDayPillProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [isSavingDay, setIsSavingDay] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string; places?: string }>({});

  const dayDate = getDayDate(itineraryStartDate, day.dayNumber);

  const isSaved = day.places.length > 0 && day.places.every((p) => p.activityApiId != null);

  const validateForm = (): boolean => {
    const errors: { title?: string; description?: string; places?: string } = {};
    if (!day.title.trim()) {
      errors.title = 'Activity title is required';
    }
    if (!day.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!day.places || day.places.length === 0) {
      errors.places = 'At least one place is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!experienceId) return;

    if (!validateForm()) {
      return;
    }

    console.log('Saving day', day);
    // if (!day.apiId) {
    //   setSaveError('Please save the day details first (use Save & Continue on the itinerary step)');
    //   return;
    // }

    setIsSavingDay(true);
    setSaveError(null);

    try {
      let place = day.places[0]; // For now, only handle the first place
      const payload: ItineraryActivityPayload = {
        title: day.title,
        description: day.description,
        location: place.placeId,
        start_time: place.startTime ?? null,
        end_time: place.endTime ?? null,
      };

      if (place.activityApiId) {
        await updateItineraryDayActivity(experienceId, day.apiId!, place.activityApiId, payload);
      } else {
        const response = await createItineraryDayActivity(experienceId, day.apiId!, payload);
         place = {
          ...place,
          activityApiId: response.data.id,
        };
      }

      onChange({ places: place ? [place] : [] });
      onToggle();
    } catch (err) {
      setSaveError(parseApiError(err));
    } finally {
      setIsSavingDay(false);
    }
  };

  const handlePlaceSelected = (selected: {
    id: string;
    name: string;
    imageUrl: string | null;
    city: string | null;
  }) => {
    const newPlace: ItineraryDayPlace = {
      id: uuidv4(),
      placeId: selected.id,
      placeName: selected.name,
      imageUrl: selected.imageUrl,
      city: selected.city,
      startTime: null,
      endTime: null,
    };
    const updatedPlaces = [...(day.places ?? []), newPlace];
    onChange({
      places: updatedPlaces,
    });
    setEditingPlaceId(newPlace.id);
    setIsPickerOpen(false);
  };

  const handlePlaceUpdate = (placeLocalId: string, updates: Partial<ItineraryDayPlace>) => {
    onChange({
      places: (day.places ?? []).map((p) => (p.id === placeLocalId ? { ...p, ...updates } : p)),
    });
  };

  const handlePlaceDelete = (placeLocalId: string) => {
    onChange({
      places: (day.places ?? []).filter((p) => p.id !== placeLocalId),
    });
    if (editingPlaceId === placeLocalId) {
      setEditingPlaceId(null);
    }
  };

  return (
    <div className="relative flex gap-3">
      {/* Timeline dot + dashed vertical line */}
      <div className="relative flex flex-col items-center">
        <div className="z-10 mt-3.5 h-1.5 w-1.5 flex-shrink-0 rounded-full border-2 border-gray-300 bg-gray-300" />
        <div className="pointer-events-none absolute left-1 mt-4 h-0 w-3.5 border-t-[1px] border-dashed border-gray-300" />
        <div className="absolute -bottom-[14px] top-2.5 mt-1 flex-1 border-l-[1px] border-dashed border-gray-300" />
      </div>

      {/* Pill + expanded content */}
      <div className="flex-1 pb-3">
        {/* Pill header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-800 transition-colors hover:border-gray-400"
          >
            <IconComponent iconName="Calendar03Icon" size={16} className="text-gray-500" />
            <span>Day {day.dayNumber}</span>
            {isSaved && <IconComponent iconName="CheckmarkCircle01Icon" size={14} className="text-primary" />}
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
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>

          {/* Delete icon */}
          <button
            type="button"
            onClick={onDelete}
            className="text-red-400 transition-colors hover:text-red-600"
          >
            <IconComponent iconName="Delete02Icon" size={16} />
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 space-y-3">
            {/* Activity Title */}
            <div>
              <Input
                value={day.title}
                onChange={(e) => {
                  onChange({ title: e.target.value });
                  setFormErrors({});
                }}
                placeholder="Activity Title"
              />
              {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <Textarea
                value={day.description}
                onChange={(e) => {
                  onChange({ description: e.target.value });
                  setFormErrors({});
                }}
                placeholder="Add a brief description about the day's experiences/activities"
                rows={4}
              />
              {formErrors.description && <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>}
            </div>

            {/* Place cards */}
            <div className="space-y-3">
              {(day.places ?? []).map((place) => (
                <ItineraryPlaceCard
                  key={place.id}
                  place={place}
                  dayDate={dayDate}
                  isEditingTime={editingPlaceId === place.id}
                  onEdit={() => setEditingPlaceId(editingPlaceId === place.id ? null : place.id)}
                  onDelete={() => handlePlaceDelete(place.id)}
                  onStartTimeChange={(time) => handlePlaceUpdate(place.id, { startTime: time })}
                  onEndTimeChange={(time) => handlePlaceUpdate(place.id, { endTime: time })}
                />
              ))}
              {formErrors.places && <p className="text-xs text-red-500">{formErrors.places}</p>}
            </div>

            {/* Add Place button — always visible */}
            <div className="space-y-2">
              <p className="text-xs text-gray-800">Where will these activities take place?</p>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <IconComponent iconName="PlusSignCircleIcon" size={16} className="text-primary" />
                Add Place
              </button>
            </div>

            {/* Save button row — bottom of expanded content */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSavingDay || !experienceId}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingDay ? 
                    "Saving..."
                : (
                    `Save Day ${day.dayNumber}`
                )}
              </button>
            </div>

            {saveError && <p className="mt-1 text-right text-xs text-red-500">{saveError}</p>}

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}

        {/* Place picker modal */}
        <AddPlaceModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          selectedPlaceIds={(day.places ?? []).map((p) => p.placeId)}
          onSelect={handlePlaceSelected}
        />
      </div>
    </div>
  );
};
