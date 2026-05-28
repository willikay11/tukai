'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useUpdateExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { CategoryPicker } from '../../CategoryPicker';
import { Interest } from '@/types/interest';

interface EditCategoriesFieldProps {
  experienceId: string;
  currentCategories?: Interest[];
  onSave: () => void;
  onCancel: () => void;
}

export const EditCategoriesField = ({
  experienceId,
  currentCategories = [],
  onSave,
  onCancel,
}: EditCategoriesFieldProps) => {
  const [categories, setCategories] = useState<Interest[]>(currentCategories);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    if (categories.length === 0) {
      setError('Select at least one category');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        categories,
      } as any);

      toast({
        title: 'Success',
        description: 'Categories updated successfully',
        variant: 'success',
      });
      onSave();
    } catch (err: any) {
      const message = err?.message || 'Failed to update categories';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [categories, experienceId, updateExperienceAsync, onSave, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Categories</h3>
        <p className="mt-1 text-xs text-gray-600">Select what type of experience this is</p>
      </div>

      <CategoryPicker
        selectedCategories={categories}
        onChange={(newCategories) => {
          setCategories(newCategories);
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
