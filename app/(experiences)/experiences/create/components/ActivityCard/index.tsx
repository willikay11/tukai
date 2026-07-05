'use client';

import { useState } from 'react';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { TimePicker } from '@/components/ui/time-picker';
import { ItineraryActivity } from '@/types/itinerary';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ActivityCardProps {
  activity: ItineraryActivity;
  dayDate: string | null;
  onChange: (data: Partial<ItineraryActivity>) => void;
  onDelete: () => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

export const ActivityCard = ({
  activity,
  dayDate,
  onChange,
  onDelete,
  onSave,
  isSaving = false,
}: ActivityCardProps) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!activity.title.trim()) {
      errors.title = 'Activity title is required';
    }

    if (!activity.description.trim()) {
      errors.description = 'Description is required';
    }

    // Time validation
    if (activity.startTime && !activity.endTime) {
      errors.endTime = 'End time is required when start time is set';
    }

    if (activity.endTime && !activity.startTime) {
      errors.startTime = 'Start time is required when end time is set';
    }

    if (activity.startTime && activity.endTime) {
      const [startHour, startMin] = activity.startTime.split(':').map(Number);
      const [endHour, endMin] = activity.endTime.split(':').map(Number);
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;

      if (endTotalMin <= startTotalMin) {
        errors.endTime = 'End time must be after start time';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearError = (field: string) => {
    setFormErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    setSaveError(null);
    try {
      await onSave();
    } catch (err) {
      setSaveError('Failed to save activity');
    }
  };

  return (
    <div className="border border-dashed border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Place header — only if place attached */}
      {activity.placeId && (
        <div className="flex items-center gap-3 p-2 border-b border-gray-100">
          {activity.placeImageUrl ? (
            <div className="relative w-16 h-14 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={activity.placeImageUrl}
                alt={activity.placeName ?? ''}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-14 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <IconComponent
                iconName="Location01Icon"
                size={18}
                className="text-primary"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {activity.placeName}
              </p>
              <IconComponent
                iconName="ArrowUpRight01Icon"
                size={14}
                className="text-primary flex-shrink-0"
              />
            </div>
            {activity.placeCity && (
              <p className="text-xs text-gray-500">{activity.placeCity}</p>
            )}
          </div>

          {/* Delete activity */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red-400 hover:text-red-600 mr-1"
            aria-label="Delete activity"
          >
            <IconComponent iconName="Delete02Icon" size={16} />
          </button>
        </div>
      )}

      {/* No place — show generic header with delete */}
      {!activity.placeId && (
        <div className="flex items-center justify-between px-3 pt-3">
          <p className="text-xs font-medium text-gray-500">
            Activity (no specific place)
          </p>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600"
            aria-label="Delete activity"
          >
            <IconComponent iconName="Delete02Icon" size={14} />
          </button>
        </div>
      )}

      {/* Activity fields */}
      <div className="p-3 space-y-3">
        <div>
          <Input
            type="text"
            value={activity.title}
            onChange={(e) => {
              onChange({ title: e.target.value });
              clearError('title');
            }}
            placeholder="Activity Title"
          />
          {formErrors.title && (
            <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>
          )}
        </div>

        <div>
          <Textarea
            value={activity.description}
            onChange={(e) => {
              onChange({ description: e.target.value });
              clearError('description');
            }}
            placeholder="Add a brief description about this activity"
            rows={3}
          />
          {formErrors.description && (
            <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Start Time
            </label>
            <TimePicker
              value={activity.startTime ?? undefined}
              onChange={(time) => {
                onChange({ startTime: time });
                clearError('startTime');
              }}
            />
            {formErrors.startTime && (
              <p className="mt-1 text-xs text-red-500">{formErrors.startTime}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              End Time
            </label>
            <TimePicker
              value={activity.endTime ?? undefined}
              onChange={(time) => {
                onChange({ endTime: time });
                clearError('endTime');
              }}
            />
            {formErrors.endTime && (
              <p className="mt-1 text-xs text-red-500">{formErrors.endTime}</p>
            )}
          </div>
        </div>

        {/* Save button and status */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            {activity.activityApiId && !isSaving && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <IconComponent iconName="CheckmarkCircle01Icon" size={12} />
                Saved
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !!activity.activityApiId}
            variant="gradient"
            className="rounded-full"
          >
            {isSaving ? 'Saving...' : activity.activityApiId ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};
