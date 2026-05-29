'use client';

import { TimePicker } from '@/components/ui/time-picker';

interface EditMeetingTimeFieldProps {
  value: string | null;
  onChange: (time: string | null) => void;
  error?: string;
}

export const EditMeetingTimeField = ({ value, onChange, error }: EditMeetingTimeFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">Meeting Time</label>
      <TimePicker
        value={value}
        onChange={(time) => {
          onChange(time);
        }}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
