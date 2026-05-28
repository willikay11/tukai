'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useUpdateExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';

interface EditTitleFieldProps {
  experienceId: string;
  currentTitle?: string;
  onSave: () => void;
  onCancel: () => void;
}

export const EditTitleField = ({
  experienceId,
  currentTitle = '',
  onSave,
  onCancel,
}: EditTitleFieldProps) => {
  const [title, setTitle] = useState(currentTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        title,
      } as any);

      toast({
        title: 'Success',
        description: 'Title updated successfully',
        variant: 'success',
      });
      onSave();
    } catch (err: any) {
      const message = err?.message || 'Failed to update title';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [title, experienceId, updateExperienceAsync, onSave, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Title</h3>
        <p className="mt-1 text-xs text-gray-600">Give your experience a compelling name</p>
      </div>

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Enter experience title"
        />
        <p className="mt-1 text-xs text-gray-500">
          {title.length}/100 characters
        </p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

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
