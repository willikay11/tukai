'use client';

import { useCallback, useState } from 'react';

import { useUpdateExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { formatDateForPreview, formatTimeForPreview } from '@/utils/date-utils';

import {
  EditCategoriesField,
  EditDescriptionField,
  EditExcludedField,
  EditIncludedField,
  EditLocationField,
  EditMeetingPointField,
  EditMeetingTimeField,
  EditPhotosPanel,
  EditTitleField,
  EditVisibilityField,
} from '../EditSections';
import { PreviewCommunitySection } from '../PreviewCommunitySection';
import { PreviewDateSection } from '../PreviewDateSection';
import { CreateExperienceAbout } from '../about';
import { CreateTickets } from '../createTickets';
import { ExperienceDates } from '../dates';
import { CreateExperienceInvites } from '../invites';
import { CreateExperienceWallet } from '../wallet';

// Wrapper component for Title editing
interface EditTitleFieldWithSaveProps {
  experienceId: string;
  currentTitle: string;
  onClose: () => void;
}

const EditTitleFieldWithSave = ({
  experienceId,
  currentTitle,
  onClose,
}: EditTitleFieldWithSaveProps) => {
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
      onClose();
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
  }, [title, experienceId, updateExperienceAsync, onClose, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Title</h3>
        <p className="mt-1 text-xs text-gray-600">Give your experience a compelling name</p>
      </div>

      <EditTitleField value={title} onChange={setTitle} error={error || undefined} />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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

// Wrapper component for Description editing
interface EditDescriptionFieldWithSaveProps {
  experienceId: string;
  currentDescription: string;
  onClose: () => void;
}

const EditDescriptionFieldWithSave = ({
  experienceId,
  currentDescription,
  onClose,
}: EditDescriptionFieldWithSaveProps) => {
  const [description, setDescription] = useState(currentDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        description,
      } as any);

      toast({
        title: 'Success',
        description: 'Experience details updated successfully',
        variant: 'success',
      });
      onClose();
    } catch (err: any) {
      console.error('[EditDescriptionFieldWithSave] Update failed:', err);
      const message = err?.message || 'Failed to update experience details';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [description, experienceId, updateExperienceAsync, onClose, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Description</h3>
        <p className="mt-1 text-xs text-gray-600">Update your experience details</p>
      </div>

      <div className="space-y-6">
        <EditDescriptionField
          value={description}
          onChange={setDescription}
          error={error || undefined}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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

// Wrapper component for Location editing
interface EditLocationFieldWithSaveProps {
  experienceId: string;
  currentLocation: string;
  currentPlaceId: string;
  onClose: () => void;
}

const EditLocationFieldWithSave = ({
  experienceId,
  currentLocation,
  currentPlaceId,
  onClose,
}: EditLocationFieldWithSaveProps) => {
  const [location, setLocation] = useState(currentLocation);
  const [placeId, setPlaceId] = useState(currentPlaceId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleLocationChange = useCallback((newLocation: string, newPlaceId?: string) => {
    setLocation(newLocation);
    setPlaceId(newPlaceId || '');
    setError(null);
  }, []);

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
          placeId,
        },
      } as any);

      toast({
        title: 'Success',
        description: 'Location updated successfully',
        variant: 'success',
      });
      onClose();
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
  }, [location, placeId, experienceId, updateExperienceAsync, onClose, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Location</h3>
        <p className="mt-1 text-xs text-gray-600">Update the experience location</p>
      </div>

      <EditLocationField
        value={location}
        placeId={placeId}
        onChange={handleLocationChange}
        error={error || undefined}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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

// Wrapper component for Meeting Point editing
interface EditMeetingPointFieldWithSaveProps {
  experienceId: string;
  currentMeetingPoint: string;
  onClose: () => void;
}

const EditMeetingPointFieldWithSave = ({
  experienceId,
  currentMeetingPoint,
  onClose,
}: EditMeetingPointFieldWithSaveProps) => {
  const [meetingPoint, setMeetingPoint] = useState(currentMeetingPoint);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        meetingPoint,
      } as any);

      toast({
        title: 'Success',
        description: 'Meeting point updated successfully',
        variant: 'success',
      });
      onClose();
    } catch (err: any) {
      const message = err?.message || 'Failed to update meeting point';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [meetingPoint, experienceId, updateExperienceAsync, onClose, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Meeting Point</h3>
        <p className="mt-1 text-xs text-gray-600">Update the meeting location</p>
      </div>

      <EditMeetingPointField
        value={meetingPoint}
        onChange={setMeetingPoint}
        error={error || undefined}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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

// Wrapper component for Meeting Time editing
interface EditMeetingTimeFieldWithSaveProps {
  experienceId: string;
  currentMeetingTime: string | null;
  onClose: () => void;
}

const EditMeetingTimeFieldWithSave = ({
  experienceId,
  currentMeetingTime,
  onClose,
}: EditMeetingTimeFieldWithSaveProps) => {
  const [meetingTime, setMeetingTime] = useState(currentMeetingTime || '');
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
      onClose();
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
  }, [meetingTime, experienceId, updateExperienceAsync, onClose, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Meeting Time</h3>
        <p className="mt-1 text-xs text-gray-600">Update the meeting time</p>
      </div>

      <EditMeetingTimeField
        value={meetingTime}
        onChange={setMeetingTime}
        error={error || undefined}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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

// Wrapper component for Visibility editing
interface EditVisibilityFieldWithSaveProps {
  experienceId: string;
  currentVisibility: 'public' | 'private';
  onClose: () => void;
}

const EditVisibilityFieldWithSave = ({
  experienceId,
  currentVisibility,
  onClose,
}: EditVisibilityFieldWithSaveProps) => {
  const [visibility, setVisibility] = useState(currentVisibility);
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
      onClose();
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
  }, [visibility, experienceId, updateExperienceAsync, onClose, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Visibility</h3>
        <p className="mt-1 text-xs text-gray-600">Make your experience public or private</p>
      </div>

      <EditVisibilityField value={visibility} onChange={setVisibility} error={error || undefined} />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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

// Wrapper component for Categories editing
interface EditCategoriesFieldWithSaveProps {
  experienceId: string;
  currentCategories: any[];
  onClose: () => void;
}

const EditCategoriesFieldWithSave = ({
  experienceId,
  currentCategories,
  onClose,
}: EditCategoriesFieldWithSaveProps) => {
  const [categories, setCategories] = useState(currentCategories);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        categoriesIds: categories.map((c: any) => c.id),
      } as any);

      toast({
        title: 'Success',
        description: 'Categories updated successfully',
        variant: 'success',
      });
      onClose();
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
  }, [categories, experienceId, updateExperienceAsync, onClose, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Categories</h3>
        <p className="mt-1 text-xs text-gray-600">Update experience categories</p>
      </div>

      <EditCategoriesField value={categories} onChange={setCategories} error={error || undefined} />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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

// Wrapper component for Included editing
interface EditIncludedFieldWithSaveProps {
  experienceId: string;
  currentIncluded: string;
  onClose: () => void;
}

const EditIncludedFieldWithSave = ({
  experienceId,
  currentIncluded,
  onClose,
}: EditIncludedFieldWithSaveProps) => {
  const [included, setIncluded] = useState(currentIncluded);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    if (!included.trim()) {
      setError('At least one item is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        whatsIncluded: included,
      } as any);

      toast({
        title: 'Success',
        description: 'Included items updated successfully',
        variant: 'success',
      });
      onClose();
    } catch (err: any) {
      const message = err?.message || 'Failed to update included items';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [included, experienceId, updateExperienceAsync, onClose, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit What's Included</h3>
        <p className="mt-1 text-xs text-gray-600">Update what's included in this experience</p>
      </div>

      <EditIncludedField value={included} onChange={setIncluded} error={error || undefined} />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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

// Wrapper component for Excluded editing
interface EditExcludedFieldWithSaveProps {
  experienceId: string;
  currentExcluded: string;
  onClose: () => void;
}

const EditExcludedFieldWithSave = ({
  experienceId,
  currentExcluded,
  onClose,
}: EditExcludedFieldWithSaveProps) => {
  const [excluded, setExcluded] = useState(currentExcluded);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    if (!excluded.trim()) {
      setError('At least one item is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        whatsNotIncluded: excluded,
      } as any);

      toast({
        title: 'Success',
        description: 'Excluded items updated successfully',
        variant: 'success',
      });
      onClose();
    } catch (err: any) {
      const message = err?.message || 'Failed to update excluded items';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [excluded, experienceId, updateExperienceAsync, onClose, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit What's NOT Included</h3>
        <p className="mt-1 text-xs text-gray-600">Update what's not included in this experience</p>
      </div>

      <EditExcludedField value={excluded} onChange={setExcluded} error={error || undefined} />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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

interface InlineEditPanelProps {
  activeEditSection:
    | 'about-title'
    | 'about-description'
    | 'about-location'
    | 'about-meeting-point'
    | 'about-meeting-time'
    | 'about-categories'
    | 'about-visibility'
    | 'about-included'
    | 'about-excluded'
    | 'about-community'
    | 'photos'
    | 'dates'
    | 'tickets'
    | 'invites'
    | 'wallet'
    | null;
  onClose: () => void;
  experienceId: string;
  experience: Experience;
  aboutPhotos?: Photo[];
  onPhotosChange?: (photos: Photo[]) => void;
}

export const InlineEditPanel = ({
  activeEditSection,
  onClose,
  experienceId,
  experience,
  aboutPhotos = [],
  onPhotosChange,
}: InlineEditPanelProps) => {
  if (!activeEditSection) {
    // Show placeholder with PhotoUploader if no photos
    if (!aboutPhotos || aboutPhotos.length === 0) {
      return (
        <div className="space-y-6 pb-24">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Add Photos</h3>
            <p className="mt-1 text-xs text-gray-600">Upload photos to preview your experience</p>
          </div>
          <EditPhotosPanel
            photos={[]}
            experienceId={experienceId}
            onPhotosChange={onPhotosChange}
            onClose={onClose}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-24">
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-300"
          >
            <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="4" />
            <path
              d="M45 50C45 45.58 48.58 42 53 42C57.42 42 61 45.58 61 50C61 54.42 57.42 58 53 58C48.58 58 45 54.42 45 50Z"
              fill="currentColor"
            />
            <path
              d="M35 68C35 63.58 40.82 60 48 60H68C75.18 60 81 63.58 81 68V88C81 92.42 77.42 96 73 96H39C34.58 96 31 92.42 31 88V72C31 69.79 32.79 68 35 68Z"
              fill="currentColor"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Select any section</p>
            <p className="text-xs text-gray-600">of the experience to edit here</p>
          </div>
        </div>

        {/* Host Community */}
        {experience.hostCommunity && (
          <PreviewCommunitySection
            communityName={experience.hostCommunity.title}
            communityImageUrl={experience.hostCommunity.photos?.[0]?.photo ?? null}
          />
        )}

        {/* Date of Experience */}
        {experience.startDate && (
          <PreviewDateSection
            mode="single"
            date={formatDateForPreview(experience.startDate)}
            startTime={formatTimeForPreview(experience.startDate)}
            endTime={formatTimeForPreview(experience.endDate)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {/* About sub-sections - focused editors */}
      {activeEditSection === 'about-title' && (
        <EditTitleFieldWithSave
          experienceId={experienceId}
          currentTitle={experience.title}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'about-description' && (
        <EditDescriptionFieldWithSave
          experienceId={experienceId}
          currentDescription={experience.description}
          currentIncluded={experience.whatsIncluded || ''}
          currentExcluded={experience.whatsNotIncluded || ''}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'about-location' && (
        <EditLocationFieldWithSave
          experienceId={experienceId}
          currentLocation={experience.location?.formattedAddress || ''}
          currentPlaceId={experience.location?.placeId || ''}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'about-meeting-point' && (
        <EditMeetingPointFieldWithSave
          experienceId={experienceId}
          currentMeetingPoint={experience.meetingPoint || ''}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'about-meeting-time' && (
        <EditMeetingTimeFieldWithSave
          experienceId={experienceId}
          currentMeetingTime={experience.meetingTime}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'about-categories' && (
        <EditCategoriesFieldWithSave
          experienceId={experienceId}
          currentCategories={experience.categories || []}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'about-visibility' && (
        <EditVisibilityFieldWithSave
          experienceId={experienceId}
          currentVisibility={experience.isPublic ? 'public' : 'private'}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'about-included' && (
        <EditIncludedFieldWithSave
          experienceId={experienceId}
          currentIncluded={experience.whatsIncluded || ''}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'about-excluded' && (
        <EditExcludedFieldWithSave
          experienceId={experienceId}
          currentExcluded={experience.whatsNotIncluded || ''}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'about-community' && (
        <div className="space-y-4 pb-24">
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <p className="text-sm font-medium text-gray-900">Community editing</p>
            <p className="text-xs text-gray-600">Coming soon</p>
          </div>
        </div>
      )}

      {/* Full form sections for complex edits */}
      {activeEditSection === 'photos' && onPhotosChange && (
        <EditPhotosPanel
          photos={aboutPhotos || []}
          experienceId={experienceId}
          onPhotosChange={onPhotosChange}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'dates' && (
        <ExperienceDates
          experienceId={experienceId}
          experience={experience}
          onDatesUpdatedSuccess={onClose}
          onCancel={onClose}
          hideSaveAndExit
          submitActionLabel="Save Changes"
        />
      )}
      {activeEditSection === 'tickets' && (
        <CreateTickets experienceId={experienceId} experience={experience} />
      )}
      {activeEditSection === 'invites' && (
        <CreateExperienceInvites
          experienceId={experienceId}
          experience={experience}
          hideSaveAndExit
          nextActionLabel="Save Changes"
        />
      )}
      {activeEditSection === 'wallet' && (
        <CreateExperienceWallet
          hideSaveAndExit
          cancelActionLabel="Cancel"
          previewAndPublishActionLabel="Save Changes"
        />
      )}
    </>
  );
};
