'use client';

import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { CategoryPicker } from './CategoryPicker';
import { DescriptionFields } from './DescriptionFields';
import { ExperienceLocationInput } from './ExperienceLocationInput';
import { ExperienceTitleInput } from './ExperienceTitleInput';
import { MeetingDetailsInput } from './MeetingDetailsInput';
import { PhotoUploader } from './PhotoUploader';
import { VisibilityPicker } from './VisibilityPicker';

interface AboutStepProps {
  formData: {
    photo: string | null;
    title: string;
    visibility: 'public' | 'private';
    description: string;
    whatsIncluded: string;
    whatsNotIncluded: string;
    location: string;
    meetingPoint: string;
    meetingTime: string | null;
    categories: string[];
  };
  errors: Record<string, string>;
  onFormDataChange: (data: Partial<typeof formData>) => void;
  onCancel: () => void;
  onSaveEdit: () => void;
  onSaveContinue: () => void;
  isSaving?: boolean;
}

export const AboutStep = ({
  formData,
  errors,
  onFormDataChange,
  onCancel,
  onSaveEdit,
  onSaveContinue,
  isSaving = false,
}: AboutStepProps) => {
  const handlePhotoChange = useCallback(
    (photo: string | null) => {
      onFormDataChange({ photo });
    },
    [onFormDataChange],
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      onFormDataChange({ title });
    },
    [onFormDataChange],
  );

  const handleVisibilityChange = useCallback(
    (visibility: 'public' | 'private') => {
      onFormDataChange({ visibility });
    },
    [onFormDataChange],
  );

  const handleDescriptionChange = useCallback(
    (description: string) => {
      onFormDataChange({ description });
    },
    [onFormDataChange],
  );

  const handleWhatsIncludedChange = useCallback(
    (whatsIncluded: string) => {
      onFormDataChange({ whatsIncluded });
    },
    [onFormDataChange],
  );

  const handleWhatsNotIncludedChange = useCallback(
    (whatsNotIncluded: string) => {
      onFormDataChange({ whatsNotIncluded });
    },
    [onFormDataChange],
  );

  const handleLocationChange = useCallback(
    (location: string) => {
      onFormDataChange({ location });
    },
    [onFormDataChange],
  );

  const handleMeetingPointChange = useCallback(
    (meetingPoint: string) => {
      onFormDataChange({ meetingPoint });
    },
    [onFormDataChange],
  );

  const handleMeetingTimeChange = useCallback(
    (meetingTime: string) => {
      onFormDataChange({ meetingTime });
    },
    [onFormDataChange],
  );

  const handleCategoriesChange = useCallback(
    (categories: string[]) => {
      onFormDataChange({ categories });
    },
    [onFormDataChange],
  );

  return (
    <div className="space-y-6">
      <PhotoUploader photoUrl={formData.photo} onPhotoChange={handlePhotoChange} error={errors.photo} />

      <ExperienceTitleInput value={formData.title} onChange={handleTitleChange} error={errors.title} />

      <VisibilityPicker value={formData.visibility} onChange={handleVisibilityChange} />

      <DescriptionFields
        description={formData.description}
        whatsIncluded={formData.whatsIncluded}
        whatsNotIncluded={formData.whatsNotIncluded}
        onDescriptionChange={handleDescriptionChange}
        onWhatsIncludedChange={handleWhatsIncludedChange}
        onWhatsNotIncludedChange={handleWhatsNotIncludedChange}
        descriptionError={errors.description}
      />

      <ExperienceLocationInput value={formData.location} onChange={handleLocationChange} error={errors.location} />

      <MeetingDetailsInput
        meetingPoint={formData.meetingPoint}
        meetingTime={formData.meetingTime}
        onMeetingPointChange={handleMeetingPointChange}
        onMeetingTimeChange={handleMeetingTimeChange}
      />

      <CategoryPicker selectedCategories={formData.categories} onChange={handleCategoriesChange} />

      <div className="flex gap-3 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-destructive hover:text-destructive/80"
        >
          Cancel
        </button>
        <div className="flex-1" />
        <Button
          type="button"
          onClick={onSaveEdit}
          variant="outline"
          disabled={isSaving}
          className="text-xs font-medium"
        >
          Save & Edit
        </Button>
        <Button type="button" onClick={onSaveContinue} disabled={isSaving} className="text-xs font-medium">
          Save & Continue
        </Button>
      </div>
    </div>
  );
};
