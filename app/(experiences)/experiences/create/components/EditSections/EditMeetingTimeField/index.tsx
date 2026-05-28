'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useUpdateExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { TimePicker } from '@/components/ui/time-picker';

interface EditMeetingTimeFieldProps {
  experienceId: string;
  currentMeetingTime?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export const EditMeetingTimeField = ({
  experienceId,
  currentMeetingTime = null,
  onSave,
  onCancel,
}: EditMeetingTimeFieldProps) => {
  const [meetingTime, setMeetingTime] = useState<string | null>(currentMeetingTime);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        meetingTime,
      } as any);

      toast({
        title: 'Success',
        description: 'Meeting time updated successfully',
        variant: 'success',
      });
      onSave();
    } catch (err: any) {
      const message = err?.message || 'Failed to update meeting time';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [meetingTime, experienceId, updateExperienceAsync, onSave, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Meeting Time</h3>
        <p className="mt-1 text-xs text-gray-600">What time should guests arrive?</p>
      </div>

      <TimePicker
        value={meetingTime}
        onChange={(time) => {
          setMeetingTime(time);
          setError(null);
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-[50px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="gradient"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-[50px]"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
