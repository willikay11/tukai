'use client';

import { useCallback } from 'react';
import { TimePicker } from '@/components/ui/time-picker';
import { IconComponent } from '@/app/shared/components/Icons';

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
        {slots.map((slot, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <TimePicker
                value={slot.startTime || undefined}
                onChange={(time) => handleStartTimeChange(index, time)}
                placeholder="Select time"
              />
              {errors[`slots.${index}.startTime`] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors[`slots.${index}.startTime`]}
                </p>
              )}
            </div>

            <div className="flex-1">
              <TimePicker
                value={slot.endTime || undefined}
                onChange={(time) => handleEndTimeChange(index, time)}
                placeholder="Select time"
              />
              {errors[`slots.${index}.endTime`] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors[`slots.${index}.endTime`]}
                </p>
              )}
            </div>

            {slots.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveSlot(index)}
                className="mb-2 text-red-500 hover:text-red-700"
                aria-label="Remove time slot"
              >
                <IconComponent iconName="Trash03Icon" size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSlot}
        className="text-xs font-semibold text-primary hover:text-primary/80"
      >
        + Add another time slot
      </button>

      {errors.timeSlots && <p className="text-xs text-red-500 mt-2">{errors.timeSlots}</p>}
    </div>
  );
};
