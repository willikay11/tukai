'use client';

import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Interest } from '@/types/interest';

import { CategoryPicker } from '../CategoryPicker';
import { DescriptionFields } from '../DescriptionFields';
import { ExperienceLocationInput } from '../ExperienceLocationInput';
import { ExperienceTitleInput } from '../ExperienceTitleInput';
import { MeetingDetailsInput } from '../MeetingDetailsInput';
import { PhotoUploader } from '../PhotoUploader';
import { VisibilityPicker } from '../VisibilityPicker';

type FormPhoto = {
  id: string;
  url: string;
  file?: File;
  isTempId?: boolean;
};

type AboutFormData = {
  photos: FormPhoto[];
  title: string;
  visibility: 'public' | 'private';
  description: string;
  whatsIncluded: string;
  whatsNotIncluded: string;
  location: string;
  locationPlaceId: string;
  meetingPoint: string;
  meetingTime: string | null;
  categories: Interest[];
};

interface AboutStepProps {
  formData: AboutFormData;
  errors: Record<string, string>;
  onFormDataChange: (data: Partial<AboutFormData>) => void;
  onCancel: () => void;
  onSaveEdit: () => void;
  onSaveContinue: () => void;
  isSaving?: boolean;
  onPreview?: () => void;
}

export const AboutStep = ({
  formData,
  errors,
  onFormDataChange,
  onCancel,
  onSaveEdit,
  onSaveContinue,
  isSaving = false,
  onPreview,
}: AboutStepProps) => {
  const handlePhotoChange = useCallback(
    (photo: FormPhoto | null) => {
      if (photo) {
        // Add photo to the array if not already present
        const photos = formData.photos.find(p => p.id === photo.id)
          ? formData.photos
          : [...formData.photos, photo];
        onFormDataChange({ photos });
      }
    },
    [onFormDataChange, formData.photos],
  );

  const handlePhotoFilesChange = useCallback(
    (photos: FormPhoto[]) => {
      onFormDataChange({ photos });
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
    (location: string, placeId?: string) => {
      onFormDataChange({ location, locationPlaceId: placeId || '' });
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
    (categories: Interest[]) => {
      onFormDataChange({ categories });
    },
    [onFormDataChange],
  );

  return (
    <div className="space-y-6">
      <p className="mb-2 text-sm font-semibold text-gray-800">Add details about the experience</p>

      <PhotoUploader
        photos={formData.photos}
        onPhotoChange={handlePhotoChange}
        onPhotoFilesChange={handlePhotoFilesChange}
        onPhotoDelete={(photoId: string) => {
          // Remove from form data when deleted
          onFormDataChange({
            photos: formData.photos.filter((p) => p.id !== photoId),
          });
        }}
        error={errors.photos}
      />

      <ExperienceTitleInput
        value={formData.title}
        onChange={handleTitleChange}
        error={errors.title}
      />

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

      <ExperienceLocationInput
        value={formData.location}
        placeId={formData.locationPlaceId}
        onChange={handleLocationChange}
        error={errors.location}
      />

      <MeetingDetailsInput
        meetingPoint={formData.meetingPoint}
        meetingTime={formData.meetingTime}
        onMeetingPointChange={handleMeetingPointChange}
        onMeetingTimeChange={handleMeetingTimeChange}
      />

      <CategoryPicker selectedCategories={formData.categories} onChange={handleCategoriesChange} />

      <div className="flex gap-2 pt-6 lg:gap-3">
        <button
          type="button"
          onClick={() => {
            console.log('[AboutStep] Cancel clicked');
            onCancel();
          }}
          className="text-xs font-medium text-destructive hover:text-destructive/80"
        >
          Cancel
        </button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            console.log('[AboutStep] Save & Edit clicked');
            onSaveEdit();
          }}
          disabled={isSaving}
          className="rounded-[50px] text-xs font-medium"
        >
          Save & Exit
        </Button>
        <Button
          type="button"
          onClick={onPreview}
          variant="outline"
          className="text-xs font-medium lg:hidden"
        >
          Preview
        </Button>
        <Button
          type="button"
          onClick={() => {
            console.log('[AboutStep] Save & Continue clicked', { formData, errors });
            onSaveContinue();
          }}
          variant="gradient"
          disabled={isSaving}
          className="rounded-[50px] text-xs font-medium"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
};
