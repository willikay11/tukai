'use client';

import { IconComponent } from '@/app/shared/components';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import { Icon } from 'lucide-react';

interface MeetingDetailsInputProps {
  meetingPoint: string;
  meetingTime: string | null;
  onMeetingPointChange: (value: string) => void;
  onMeetingTimeChange: (value: string) => void;
}

export const MeetingDetailsInput = ({
  meetingPoint,
  meetingTime,
  onMeetingPointChange,
  onMeetingTimeChange,
}: MeetingDetailsInputProps) => {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <label htmlFor="meeting-point" className="text-xs font-medium text-gray-800">
          Meeting Details (Optional)
        </label>
        <Input
          id="meeting-point"
          placeholder="Meeting/Pick-up Point"
          value={meetingPoint}
          onChange={(e) => onMeetingPointChange(e.target.value)}
          className="h-[50px]"
          suffixIcon={<IconComponent iconName="Location06Icon" size={18} className="text-gray-800" />}
        />
      </div>

      <TimePicker
        value={meetingTime || undefined}
        onChange={onMeetingTimeChange}
        placeholder="Select time"
      />
    </div>
  );
};
