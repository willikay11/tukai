'use client';

import { useCallback, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { ActivityCard } from '@/app/(experiences)/experiences/create/components/ActivityCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { ItineraryActivity, ItineraryDayFormValue } from '@/types/itinerary';
import {
  createItineraryDayActivity,
  deleteItineraryDayActivity,
  updateItineraryDayActivity,
  type ItineraryActivityPayload,
} from '@/services/experience';
import { parseApiError } from '@/utils/parseApiError';
import { useToast } from '@/app/shared/hooks/useToast';

import { AddPlaceModal } from '../AddPlaceModal';

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
  const { toast } = useToast();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSavingDay, setIsSavingDay] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dayDate = getDayDate(itineraryStartDate, day.dayNumber);

  const isSaved = day.activities.length > 0 && day.activities.every((a) => a.activityApiId != null);

  const validateForm = (): boolean => {
    if (!day.activities || day.activities.length === 0) {
      setSaveError('At least one activity is required');
      return false;
    }
    for (const activity of day.activities) {
      if (!activity.title.trim()) {
        setSaveError('Each activity must have a title');
        return false;
      }
    }
    return true;
  };

  const handleAddActivity = useCallback(() => {
    setIsPickerOpen(true);
  }, []);

  const handlePlaceSelected = useCallback(
    (selected: {
      id: string;
      name: string;
      imageUrl: string | null;
      city: string | null;
    }) => {
      const newActivity: ItineraryActivity = {
        id: uuidv4(),
        title: '',
        description: '',
        placeId: selected.id,
        placeName: selected.name,
        placeImageUrl: selected.imageUrl,
        placeCity: selected.city,
        startTime: null,
        endTime: null,
      };
      onChange({
        activities: [...day.activities, newActivity],
      });
      setIsPickerOpen(false);
    },
    [day.activities, onChange],
  );

  const handleSkipPlace = useCallback(() => {
    const newActivity: ItineraryActivity = {
      id: uuidv4(),
      title: '',
      description: '',
      placeId: null,
      placeName: null,
      placeImageUrl: null,
      placeCity: null,
      startTime: null,
      endTime: null,
    };
    onChange({
      activities: [...day.activities, newActivity],
    });
    setIsPickerOpen(false);
  }, [day.activities, onChange]);

  const handleActivityChange = useCallback(
    (activityId: string, data: Partial<ItineraryActivity>) => {
      onChange({
        activities: day.activities.map((a) =>
          a.id === activityId ? { ...a, ...data } : a,
        ),
      });
    },
    [day.activities, onChange],
  );

  const handleActivityDelete = useCallback(
    async (activityId: string) => {
      const activity = day.activities.find((a) => a.id === activityId);

      if (activity?.activityApiId && experienceId && day.apiId) {
        try {
          await deleteItineraryDayActivity(experienceId, day.apiId, activity.activityApiId);
        } catch (err) {
          toast({
            description: parseApiError(err),
            variant: 'destructive',
          });
          return;
        }
      }

      onChange({
        activities: day.activities.filter((a) => a.id !== activityId),
      });
    },
    [day.activities, onChange, experienceId, day.apiId, toast],
  );

  const handleSave = useCallback(async () => {
    if (!experienceId || !day.apiId) return;

    if (!validateForm()) {
      return;
    }

    setIsSavingDay(true);
    setSaveError(null);

    try {
      const updatedActivities = await Promise.all(
        day.activities.map(async (activity, index) => {
          const payload: ItineraryActivityPayload = {
            title: activity.title,
            description: activity.description,
            location: activity.placeId,
            start_time: activity.startTime,
            end_time: activity.endTime,
            order: index,
          };

          if (activity.activityApiId) {
            await updateItineraryDayActivity(experienceId, day.apiId!, activity.activityApiId, payload);
            return activity;
          } else {
            const response = await createItineraryDayActivity(experienceId, day.apiId!, payload);
            return {
              ...activity,
              activityApiId: response.data.id,
            };
          }
        }),
      );

      onChange({ activities: updatedActivities });
      onToggle();
    } catch (err) {
      setSaveError(parseApiError(err));
    } finally {
      setIsSavingDay(false);
    }
  }, [experienceId, day, onChange, onToggle]);

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
            {/* Activity cards */}
            {day.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                dayDate={dayDate}
                onChange={(data) => handleActivityChange(activity.id, data)}
                onDelete={() => handleActivityDelete(activity.id)}
              />
            ))}

            {/* Add Activity button */}
            <button
              type="button"
              onClick={handleAddActivity}
              className="flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
            >
              <IconComponent iconName="PlusSignCircleIcon" size={16} className="text-primary" />
              Add Activity
            </button>

            {/* Save button row — bottom of expanded content */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSavingDay || !experienceId}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingDay ? 'Saving...' : `Save Day ${day.dayNumber}`}
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
          onSelect={handlePlaceSelected}
          onSkip={handleSkipPlace}
          selectedPlaceIds={day.activities
            .filter((a) => a.placeId)
            .map((a) => a.placeId!)}
        />
      </div>
    </div>
  );
};
