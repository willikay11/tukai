'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { ActivityCard } from '@/app/(experiences)/experiences/create/components/ActivityCard';
import { ActivityListItem } from '@/app/(experiences)/experiences/create/components/ActivityListItem';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type ItineraryActivityPayload,
  createItineraryDayActivity,
  deleteItineraryDayActivity,
  updateItineraryDayActivity,
  updateItineraryDayMetadata,
} from '@/services/experience';
import { ItineraryActivity, ItineraryDayFormValue } from '@/types/itinerary';
import { parseApiError } from '@/utils/parseApiError';

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
  const [savingActivityId, setSavingActivityId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditingTitleAndDescription, setIsEditingTitleAndDescription] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<{
    title?: string;
    description?: string;
  }>({});

  const dayDate = getDayDate(itineraryStartDate, day.dayNumber);

  const isSaved = day.activities.length > 0 && day.activities.every((a) => a.activityApiId != null);

  // Show display view when both fields have content and user is not editing
  const showDisplayView =
    !isEditingTitleAndDescription && day.title.trim() !== '' && day.description.trim() !== '';

  // Auto-exit edit mode when both fields filled
  const maybeExitEditMode = () => {
    if (day.title.trim() !== '' && day.description.trim() !== '') {
      setIsEditingTitleAndDescription(false);
    }
  };

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditingTitleAndDescription) {
      requestAnimationFrame(() => {
        titleInputRef.current?.focus();
      });
    }
  }, [isEditingTitleAndDescription]);

  const performSave = useCallback(async () => {
    const pending = pendingDataRef.current;
    if (!experienceId || !day.apiId) return;

    // Check if there's anything to save
    const hasTitle = pending.title !== undefined;
    const hasDescription = pending.description !== undefined;
    if (!hasTitle && !hasDescription) return;

    try {
      await updateItineraryDayMetadata(experienceId, day.apiId, {
        day_number: day.dayNumber,
        title: pending.title ?? day.title,
        description: pending.description ?? day.description,
      });
      pendingDataRef.current = {};
      setSaveError(null);
    } catch (err) {
      setSaveError(parseApiError(err));
    }
  }, [experienceId, day.apiId, day.dayNumber, day.title, day.description]);

  const scheduleDebouncedSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      performSave();
      saveTimerRef.current = null;
    }, 800);
  }, [performSave]);

  const flushPendingSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      performSave();
    }
  }, [performSave]);

  const handleTitleChange = (value: string) => {
    onChange({ title: value });
    pendingDataRef.current.title = value;
    scheduleDebouncedSave();
  };

  const handleDescriptionChange = (value: string) => {
    onChange({ description: value });
    pendingDataRef.current.description = value;
    scheduleDebouncedSave();
  };

  // Cleanup — flush on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        performSave();
      }
    };
  }, [performSave]);

  // Flush when collapsing the pill
  useEffect(() => {
    if (!isExpanded) {
      flushPendingSave();
    }
  }, [isExpanded, flushPendingSave]);

  const handleAddActivity = useCallback(() => {
    setIsPickerOpen(true);
  }, []);

  const handlePlaceSelected = useCallback(
    (selected: {
      id: string;
      name: string;
      imageUrl: string | null;
      city: string | null;
      locationId: string | null;
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
        locationId: selected.locationId,
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
      locationId: null,
    };
    onChange({
      activities: [...day.activities, newActivity],
    });
    setIsPickerOpen(false);
  }, [day.activities, onChange]);

  const handleActivityChange = useCallback(
    (activityId: string, data: Partial<ItineraryActivity>) => {
      onChange({
        activities: day.activities.map((a) => (a.id === activityId ? { ...a, ...data } : a)),
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

  const handleActivitySave = useCallback(
    async (activityId: string) => {
      if (!experienceId) return;

      const activity = day.activities.find((a) => a.id === activityId);
      if (!activity) return;

      setSavingActivityId(activityId);

      try {
        const index = day.activities.indexOf(activity);
        const payload: ItineraryActivityPayload = {
          title: activity.title,
          description: activity.description,
          location: activity.locationId,
          start_time: activity.startTime,
          end_time: activity.endTime,
          order: index,
        };

        if (activity.activityApiId) {
          await updateItineraryDayActivity(
            experienceId,
            day.apiId,
            activity.activityApiId,
            payload,
          );
        } else {
          const response = await createItineraryDayActivity(experienceId, day.apiId, payload);
          onChange({
            activities: day.activities.map((a) =>
              a.id === activityId ? { ...a, activityApiId: response.data.id } : a,
            ),
          });
        }
      } catch (err) {
        toast({
          description: parseApiError(err),
          variant: 'destructive',
        });
      } finally {
        setSavingActivityId(null);
      }
    },
    [experienceId, day, onChange, toast],
  );

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
            <IconComponent
              iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
              size={14}
              className="text-gray-400"
            />
          </button>

          {/* Edit icon */}
          {/* <button
            type="button"
            onClick={onToggle}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <IconComponent iconName="Edit02Icon" size={16} />
          </button> */}

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
            {/* Title and description display/edit toggle */}
            {showDisplayView ? (
              <div className="space-y-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold leading-snug text-gray-900">{day.title}</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingTitleAndDescription(true)}
                    className="flex-shrink-0 p-1 text-gray-400 transition-colors hover:text-primary"
                    aria-label="Edit title and description"
                  >
                    <IconComponent iconName="Edit02Icon" size={16} />
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">{day.description}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  ref={titleInputRef}
                  type="text"
                  value={day.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={() => {
                    flushPendingSave();
                    maybeExitEditMode();
                  }}
                  placeholder="Day Title"
                />

                <Textarea
                  value={day.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  onBlur={() => {
                    flushPendingSave();
                    maybeExitEditMode();
                  }}
                  placeholder="Add a brief description about the day's experiences/activities"
                  rows={3}
                />
              </div>
            )}

            {/* Save error message */}
            {saveError && <p className="text-xs text-red-500">Failed to save: {saveError}</p>}

            {/* Activity cards/list items */}
            {day.activities.map((activity) =>
              activity.activityApiId ? (
                // Saved activity — show as list item
                <ActivityListItem
                  key={activity.id}
                  activity={activity}
                  onEdit={() => {
                    // TODO: Toggle edit mode for this activity
                  }}
                  onDelete={() => handleActivityDelete(activity.id)}
                />
              ) : (
                // Unsaved activity — show as editable card
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  dayDate={dayDate}
                  otherActivities={day.activities.filter((a) => a.id !== activity.id)}
                  onChange={(data) => handleActivityChange(activity.id, data)}
                  onDelete={() => handleActivityDelete(activity.id)}
                  onSave={() => handleActivitySave(activity.id)}
                  isSaving={savingActivityId === activity.id}
                />
              ),
            )}

            {/* Add Activity button */}
            <button
              type="button"
              onClick={handleAddActivity}
              className="flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
            >
              <IconComponent iconName="PlusSignCircleIcon" size={16} className="text-primary" />
              Add Activity
            </button>

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}

        {/* Place picker modal */}
        <AddPlaceModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={handlePlaceSelected}
          onSkip={handleSkipPlace}
          selectedPlaceIds={day.activities.filter((a) => a.placeId).map((a) => a.placeId!)}
        />
      </div>
    </div>
  );
};
