'use client';

import { useCallback } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { TimePicker } from '@/components/ui/time-picker';
import { isEndAfterStart } from '@/utils/itinerary-utils';

export interface TimeSlot {
  startTime: string | null;
  endTime: string | null;
}

interface TimeSlotListProps {
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  errors: Record<string, string>;
}

export const TimeSlotList = ({ slots, onChange, errors }: TimeSlotListProps) => {
  const handleAddSlot = useCallback(() => {
    onChange([...slots, { startTime: null, endTime: null }]);
  }, [slots, onChange]);

  const handleRemoveSlot = useCallback(
    (index: number) => {
      onChange(slots.filter((_, i) => i !== index));
    },
    [slots, onChange],
  );

  const handleStartTimeChange = useCallback(
    (index: number, time: string) => {
      const newSlots = [...slots];
      newSlots[index] = { ...newSlots[index], startTime: time };
      onChange(newSlots);
    },
    [slots, onChange],
  );

  const handleEndTimeChange = useCallback(
    (index: number, time: string) => {
      const newSlots = [...slots];
      newSlots[index] = { ...newSlots[index], endTime: time };
      onChange(newSlots);
    },
    [slots, onChange],
  );

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-900">Times/Time Slots</label>

      <div className="space-y-2">
        {slots.map((slot, index) => {
          // Shown as soon as the pair goes out of order (e.g. the start time was
          // moved past an already-picked end time)
          const endTimeOrderError = isEndAfterStart(slot.startTime, slot.endTime)
            ? null
            : 'End time must be after start time';

          return (
            // Top-aligned so an error message under one field cannot push the
            // other field's input out of line — the message hangs below instead
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <TimePicker
                  value={slot.startTime || undefined}
                  onChange={(time) => handleStartTimeChange(index, time)}
                  placeholder="Select time"
                />
                {errors[`slots.${index}.startTime`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`slots.${index}.startTime`]}</p>
                )}
              </div>

              <div className="flex-1">
                <TimePicker
                  value={slot.endTime || undefined}
                  onChange={(time) => handleEndTimeChange(index, time)}
                  placeholder="Select time"
                  minTime={slot.startTime || undefined}
                />
                {(errors[`slots.${index}.endTime`] || endTimeOrderError) && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[`slots.${index}.endTime`] || endTimeOrderError}
                  </p>
                )}
              </div>

              {slots.length > 1 && (
                // Matches the TimePicker's h-11 so the icon stays centred on
                // the inputs whether or not an error is showing below them
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(index)}
                  className="flex h-11 flex-shrink-0 items-center text-red-500 hover:text-red-700"
                  aria-label="Remove time slot"
                >
                  <IconComponent iconName="Delete02Icon" size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddSlot}
        className="text-xs font-semibold text-primary hover:text-primary/80"
      >
        + Add another time slot
      </button>

      {errors.timeSlots && <p className="mt-2 text-xs text-red-500">{errors.timeSlots}</p>}
    </div>
  );
};
