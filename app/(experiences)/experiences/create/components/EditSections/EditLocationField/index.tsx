'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useUpdateExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { ExperienceLocationInput } from '../../ExperienceLocationInput';

interface EditLocationFieldProps {
  experienceId: string;
  currentLocation?: string;
  currentPlaceId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export const EditLocationField = ({
  experienceId,
  currentLocation = '',
  currentPlaceId = '',
  onSave,
  onCancel,
}: EditLocationFieldProps) => {
  const [location, setLocation] = useState(currentLocation);
  const [locationPlaceId, setLocationPlaceId] = useState(currentPlaceId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleLocationChange = useCallback(
    (newLocation: string, placeId?: string) => {
      setLocation(newLocation);
      setLocationPlaceId(placeId || '');
      setError(null);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        location: {
          formattedAddress: location,
          placeId: locationPlaceId,
        },
      } as any);

      toast({
        title: 'Success',
        description: 'Location updated successfully',
        variant: 'success',
      });
      onSave();
    } catch (err: any) {
      const message = err?.message || 'Failed to update location';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [location, locationPlaceId, experienceId, updateExperienceAsync, onSave, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Location</h3>
        <p className="mt-1 text-xs text-gray-600">Update the experience location</p>
      </div>

      <ExperienceLocationInput
        value={location}
        placeId={locationPlaceId}
        onChange={handleLocationChange}
        error={error || undefined}
      />

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
