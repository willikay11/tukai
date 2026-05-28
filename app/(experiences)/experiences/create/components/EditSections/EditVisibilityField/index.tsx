'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useUpdateExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';

interface EditVisibilityFieldProps {
  experienceId: string;
  currentVisibility?: 'public' | 'private';
  onSave: () => void;
  onCancel: () => void;
}

export const EditVisibilityField = ({
  experienceId,
  currentVisibility = 'public',
  onSave,
  onCancel,
}: EditVisibilityFieldProps) => {
  const [visibility, setVisibility] = useState<'public' | 'private'>(currentVisibility);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        isPublic: visibility === 'public',
      } as any);

      toast({
        title: 'Success',
        description: 'Visibility updated successfully',
        variant: 'success',
      });
      onSave();
    } catch (err: any) {
      const message = err?.message || 'Failed to update visibility';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [visibility, experienceId, updateExperienceAsync, onSave, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Visibility</h3>
        <p className="mt-1 text-xs text-gray-600">Control who can see this experience</p>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={visibility === 'public'}
            onChange={() => setVisibility('public')}
            className="mt-1"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Public</p>
            <p className="text-xs text-gray-600">Anyone can see and book this experience</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="visibility"
            value="private"
            checked={visibility === 'private'}
            onChange={() => setVisibility('private')}
            className="mt-1"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Private</p>
            <p className="text-xs text-gray-600">Only invited guests can see and book</p>
          </div>
        </label>
      </div>

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
