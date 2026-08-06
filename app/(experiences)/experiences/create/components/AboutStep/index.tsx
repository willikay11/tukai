'use client';

import { useCallback, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Interest } from '@/types/interest';

import { CategoryPicker } from '../CategoryPicker';
import { DescriptionFields } from '../DescriptionFields';
import { AddPlaceModal } from '../AddPlaceModal';
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
  placeId: string | null;
  placeImageUrl: string | null;
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
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  const handlePhotoChange = useCallback(
    (photo: FormPhoto | null) => {
      if (photo) {
        // Add photo to the array if not already present
        const photos = formData.photos.find((p) => p.id === photo.id)
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

  const handlePlaceSelected = useCallback(
    (place: {
      id: string;
      name: string;
      imageUrl: string | null;
      city: string | null;
      source: 'tukai' | 'google';
    }) => {
      if (place.source === 'google') {
        // Google pick — submitted as google_map_place_id (current behaviour)
        onFormDataChange({
          location: place.name,
          locationPlaceId: place.id,
          placeId: null,
          placeImageUrl: null,
        });
      } else {
        // Tukai place — submitted as place_id
        onFormDataChange({
          location: [place.name, place.city].filter(Boolean).join(', '),
          placeId: place.id,
          placeImageUrl: place.imageUrl ?? null,
          locationPlaceId: '',
        });
      }
      setIsPlaceModalOpen(false);
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

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-900">
          Where will the experience take place?
        </label>
        <button
          type="button"
          onClick={() => setIsPlaceModalOpen(true)}
          className="flex h-[50px] w-full items-center gap-2 rounded-[10px] border border-gray-700 border-input px-3 text-left focus:border-primary focus:outline-none"
        >
          <IconComponent iconName="Location01Icon" size={18} className="text-gray-600" />
          <span
            className={`flex-1 truncate text-xs ${formData.location ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {formData.location || 'Select a place'}
          </span>
          <IconComponent iconName="ArrowRight01Icon" size={16} className="text-gray-400" />
        </button>
        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      <AddPlaceModal
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
        onSelect={handlePlaceSelected}
        selectedPlaceIds={formData.placeId ? [formData.placeId] : []}
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
          variant="outline-primary"
          onClick={() => {
            console.log('[AboutStep] Save & Edit clicked');
            onSaveEdit();
          }}
          disabled={isSaving}
          className="text-xs font-semibold"
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
