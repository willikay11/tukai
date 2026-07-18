'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $getRoot, EditorState, SerializedEditorState } from 'lexical';
import moment from 'moment';
import * as z from 'zod';

import { FileUploadField } from '@/app/shared/components/Forms';
import { LocationAutocompleteField } from '@/app/shared/components/LocationPicker';
import { useGetInterestCategories } from '@/app/shared/hooks/useAuth';
import { useCreateExperience, useUpdateExperience } from '@/app/shared/hooks/useExperiences';
import { useGoogleMapsAutocomplete } from '@/app/shared/hooks/usePlaces';
import { toast } from '@/app/shared/hooks/useToast';
import { Editor } from '@/components/blocks/editor-00/editor';
import { Button } from '@/components/ui/button';
import { CategoryPill } from '@/components/ui/categoryPill';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { TimePicker } from '@/components/ui/time-picker';
import { Experience } from '@/types/experience';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';
import { Interest } from '@/types/interest';

const createExperienceSchema = (requirePhotos: boolean) =>
  z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    included: z.string().min(3, 'Please describe what is included'),
    notIncluded: z.string().min(1, 'Please describe what is not included'),
    location: z.string().min(3, 'Location is required'),
    meetingPoint: z.string().optional().default(''),
    meetingTime: z.string().optional().default(''),
    visibility: z.enum(['public', 'private']),
    selectedCategories: z.array(z.string()).min(1, 'Select at least one category'),
    uploadedFiles: requirePhotos
      ? z.array(z.instanceof(File)).min(1, {
          message: 'Please upload at least one experience poster.',
        })
      : z.array(z.instanceof(File)),
  });

type ExperienceFormValues = z.infer<ReturnType<typeof createExperienceSchema>>;

const toSerializedEditorState = (text: string): SerializedEditorState =>
  ({
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }) as unknown as SerializedEditorState;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const plainTextToHtml = (value: string) => {
  const escaped = escapeHtml(value || '');
  return `<p>${escaped.replace(/\n/g, '<br />')}</p>`;
};

const normalizeIncomingHtml = (value: string) => {
  if (!value) return '';

  const unescaped = value.replace(/\\"/g, '"').trim();
  const withoutWrappingQuotes =
    unescaped.startsWith('"') && unescaped.endsWith('"') ? unescaped.slice(1, -1) : unescaped;

  if (
    withoutWrappingQuotes.includes('&lt;') ||
    withoutWrappingQuotes.includes('&gt;') ||
    withoutWrappingQuotes.includes('&quot;')
  ) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = withoutWrappingQuotes;
    return textarea.value;
  }

  return withoutWrappingQuotes;
};

const htmlToPlainText = (value: string) => {
  if (!value) return '';
  if (!value.includes('<')) return value;

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  return (doc.body.textContent || '').trim();
};

const getRichTextValue = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string') {
      return value;
    }
  }

  return '';
};

interface CreateExperienceAboutProps {
  onSuccess?: (experienceId: string) => void;
  onClose?: () => void;
  experience?: Experience;
  showTitle?: boolean;
  cancelActionLabel?: string;
  saveAndExitActionLabel?: string;
  createSubmitActionLabel?: string;
  editSubmitActionLabel?: string;
  createPendingActionLabel?: string;
  editPendingActionLabel?: string;
  hideSaveAndExit?: boolean;
}

export const CreateExperienceAbout = ({
  onSuccess,
  onClose,
  experience,
  showTitle = true,
  cancelActionLabel = 'Cancel',
  saveAndExitActionLabel = 'Save & Exit',
  createSubmitActionLabel = 'Continue',
  editSubmitActionLabel = 'Save Changes',
  createPendingActionLabel = 'Creating...',
  editPendingActionLabel = 'Saving...',
  hideSaveAndExit = false,
}: CreateExperienceAboutProps) => {
  const { data: categories } = useGetInterestCategories();
  const isEditMode = !!experience?.id;
  const hasExistingPhotos = (experience?.photos?.length ?? 0) > 0;
  const experienceSchema = useMemo(
    () => createExperienceSchema(!hasExistingPhotos),
    [hasExistingPhotos],
  );
  const { mutate: createExperience, isPending: isCreatingExperience } = useCreateExperience();
  const { mutate: updateExperience, isPending: isUpdatingExperience } = useUpdateExperience(
    experience?.id ?? '',
  );
  const isSaving = isCreatingExperience || isUpdatingExperience;
  const locationInputRef = useRef<HTMLDivElement>(null);
  const meetingPointInputRef = useRef<HTMLDivElement>(null);
  const [locationInput, setLocationInput] = useState('');
  const [meetingPointInput, setMeetingPointInput] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showMeetingPointSuggestions, setShowMeetingPointSuggestions] = useState(false);
  const [editorHydrationSeed, setEditorHydrationSeed] = useState(0);
  const [editorHtmlValues, setEditorHtmlValues] = useState({
    description: '',
    included: '',
    notIncluded: '',
  });

  const { data: googlePlaces, isFetching: isFetchingGooglePlaces } = useGoogleMapsAutocomplete(
    locationInput,
    locationInput.length > 2,
  );

  const { data: googleMeetingPointPlaces, isFetching: isFetchingMeetingPointPlaces } =
    useGoogleMapsAutocomplete(meetingPointInput, meetingPointInput.length > 2);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }

      if (
        meetingPointInputRef.current &&
        !meetingPointInputRef.current.contains(event.target as Node)
      ) {
        setShowMeetingPointSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: '',
      description: '',
      included: '',
      notIncluded: '',
      location: '',
      meetingPoint: '',
      meetingTime: '',
      visibility: 'public',
      selectedCategories: [],
      uploadedFiles: [],
    },
  });

  useEffect(() => {
    if (experience) {
      const experienceData = experience as unknown as Record<string, unknown>;
      const pulledDescription = normalizeIncomingHtml(experience.description || '');
      const pulledIncluded = normalizeIncomingHtml(
        getRichTextValue(experienceData, ['included', 'whatsIncluded']),
      );
      const pulledNotIncluded = normalizeIncomingHtml(
        getRichTextValue(experienceData, ['notIncluded', 'not_included', 'whatsNotIncluded']),
      );

      form.reset({
        title: experience.title || '',
        description: htmlToPlainText(pulledDescription),
        included: htmlToPlainText(pulledIncluded),
        notIncluded: htmlToPlainText(pulledNotIncluded),
        location: experience.location?.id || '',
        meetingPoint: '',
        meetingTime: '',
        visibility: experience.isPublic ? 'public' : 'private',
        selectedCategories: experience.categories?.map((cat) => cat.id) || [],
        uploadedFiles: [],
      });
      if (experience.location?.formattedAddress) {
        setLocationInput(experience.location.formattedAddress);
      }
      setMeetingPointInput('');

      setEditorHtmlValues({
        description: pulledDescription
          ? pulledDescription.includes('<')
            ? pulledDescription
            : plainTextToHtml(pulledDescription)
          : '',
        included: pulledIncluded
          ? pulledIncluded.includes('<')
            ? pulledIncluded
            : plainTextToHtml(pulledIncluded)
          : '',
        notIncluded: pulledNotIncluded
          ? pulledNotIncluded.includes('<')
            ? pulledNotIncluded
            : plainTextToHtml(pulledNotIncluded)
          : '',
      });

      setEditorHydrationSeed((prev) => prev + 1);
    }
  }, [experience, form]);

  const handleCategoryToggle = (categoryId: string) => {
    const current = form.getValues('selectedCategories');
    const next = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    form.setValue('selectedCategories', next, { shouldValidate: true });
  };

  const onSubmit = (values: z.infer<typeof experienceSchema>) => {
    const now = moment();
    const today = now.toISOString();
    const endOfDay = now.add(1, 'day').clone().endOf('day').toDate();

    const payload = {
      title: values.title,
      description: editorHtmlValues.description || plainTextToHtml(values.description),
      googleMapPlaceId: values.location || 'ChIJkYb7L8EXLxgRWogSMeTPg8M',
      startDate: today,
      endDate: endOfDay.toISOString(),
      recurrence_rule: '',
      categoriesIds: values.selectedCategories,
      isPublic: values.visibility === 'public',
      newPhotos: values.uploadedFiles,
      invitedCommunityIds: [],
      invitedGuestsEmails: [],
    };

    const handleSuccess = (experienceId?: string) => {
      toast({
        title: 'Success',
        description: isEditMode
          ? 'Experience updated successfully.'
          : 'Experience created successfully.',
        variant: 'success',
      });
      if (experienceId) {
        onSuccess?.(experienceId);
      }
      if (isEditMode) {
        onClose?.();
      }
    };

    const handleError = (error: any) => {
      toast({
        title: 'Error',
        description:
          error?.message ||
          (isEditMode ? 'Failed to update experience.' : 'Failed to create experience.'),
        variant: 'destructive',
      });
    };

    if (isEditMode) {
      updateExperience(payload, {
        onSuccess: () => handleSuccess(experience?.id),
        onError: handleError,
      });
    } else {
      createExperience(payload, {
        onSuccess: (response: any) => handleSuccess(response?.data?.id),
        onError: handleError,
      });
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          {showTitle && <h1 className="text-xl font-bold text-gray-900">Create Experience</h1>}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Upload Photo */}
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-800">
                Add details about the experience
              </p>
              <FormField
                control={form.control}
                name="uploadedFiles"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <FileUploadField
                        id="experience-poster"
                        label=" Upload a experience poster (Dimensions: 1024*1024, Max 15 Mbs)"
                        buttonText="Add Photo(s)"
                        accept="image/*"
                        excludedMimeTypes={['image/svg+xml']}
                        multiple
                        minImageWidth={1024}
                        minImageHeight={1024}
                        maxImageWidth={4096}
                        maxImageHeight={4096}
                        initialUrls={experience?.photos?.map((p) => p.photo) ?? []}
                        onValidationError={(errors) => {
                          const message = errors[0] || 'Please upload a valid image file.';
                          form.setError('uploadedFiles', {
                            type: 'manual',
                            message,
                          });
                          toast({
                            title: 'Invalid image upload',
                            description: message,
                            variant: 'destructive',
                          });
                        }}
                        onFilesChange={(files) => {
                          form.clearErrors('uploadedFiles');
                          form.setValue('uploadedFiles', files, { shouldValidate: true });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Experience Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="title" className="block text-xs font-medium text-gray-800">
                    Experience Title
                  </label>
                  <FormControl>
                    <Input id="title" type="text" placeholder="Experience Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience Visibility */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <p className="text-xs font-medium text-gray-800">
                    Experience type (who can see or access the experience)
                  </p>
                  <FormControl>
                    <PillRadioGroup
                      options={[
                        { value: 'public', label: 'Public (Everyone)' },
                        { value: 'private', label: 'Private (Only invited people)' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Add your experience description
                  </label>
                  <FormControl>
                    <Editor
                      key={`description-${experience?.id || 'new'}-${editorHydrationSeed}`}
                      editorSerializedState={toSerializedEditorState(field.value || '')}
                      onChange={(editorState: EditorState, editor) => {
                        editorState.read(() => {
                          field.onChange($getRoot().getTextContent());
                          const html = $generateHtmlFromNodes(editor, null);
                          setEditorHtmlValues((prev) => ({ ...prev, description: html }));
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* What's Included */}
            <FormField
              control={form.control}
              name="included"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="included" className="block text-sm font-semibold text-gray-800">
                    What's included
                  </label>
                  <FormControl>
                    <Editor
                      key={`included-${experience?.id || 'new'}-${editorHydrationSeed}`}
                      editorSerializedState={toSerializedEditorState(field.value || '')}
                      onChange={(editorState: EditorState, editor) => {
                        editorState.read(() => {
                          field.onChange($getRoot().getTextContent());
                          const html = $generateHtmlFromNodes(editor, null);
                          setEditorHtmlValues((prev) => ({ ...prev, included: html }));
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* What's NOT Included */}
            <FormField
              control={form.control}
              name="notIncluded"
              render={({ field }) => (
                <FormItem>
                  <label
                    htmlFor="notIncluded"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    What's NOT included
                  </label>
                  <FormControl>
                    <Editor
                      key={`notIncluded-${experience?.id || 'new'}-${editorHydrationSeed}`}
                      editorSerializedState={toSerializedEditorState(field.value || '')}
                      onChange={(editorState: EditorState, editor) => {
                        editorState.read(() => {
                          field.onChange($getRoot().getTextContent());
                          const html = $generateHtmlFromNodes(editor, null);
                          setEditorHtmlValues((prev) => ({ ...prev, notIncluded: html }));
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-800">
                    Where will the experience take place?
                  </label>
                  <FormControl>
                    <LocationAutocompleteField
                      containerRef={locationInputRef}
                      value={locationInput}
                      placeholder="Add location/name of the place..."
                      showSuggestions={showLocationSuggestions}
                      isLoading={isFetchingGooglePlaces}
                      suggestions={googlePlaces?.data || []}
                      onValueChange={(value) => {
                        setLocationInput(value);
                        setShowLocationSuggestions(true);
                      }}
                      onFocus={() => setShowLocationSuggestions(true)}
                      onSelectSuggestion={(place: GoogleMapsAutocompletePrediction) => {
                        field.onChange(place.place_id);
                        setLocationInput(place.description);
                        setShowLocationSuggestions(false);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meeting Details */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Meeting Details (optional)
              </label>

              <FormField
                control={form.control}
                name="meetingPoint"
                render={({ field }) => (
                  <FormItem className="mb-3">
                    <FormControl>
                      <LocationAutocompleteField
                        containerRef={meetingPointInputRef}
                        value={meetingPointInput}
                        placeholder="Meeting/Pick-up Point"
                        showSuggestions={showMeetingPointSuggestions}
                        isLoading={isFetchingMeetingPointPlaces}
                        suggestions={googleMeetingPointPlaces?.data || []}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setMeetingPointInput(value);
                          setShowMeetingPointSuggestions(true);
                        }}
                        onFocus={() => setShowMeetingPointSuggestions(true)}
                        onSelectSuggestion={(place: GoogleMapsAutocompletePrediction) => {
                          field.onChange(place.description);
                          setMeetingPointInput(place.description);
                          setShowMeetingPointSuggestions(false);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select meeting time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categories */}
            <FormField
              control={form.control}
              name="selectedCategories"
              render={() => (
                <FormItem className="mt-4">
                  <p className="text-xs font-bold text-gray-800">
                    Select a category the experience falls under, e.g. Hiking, Safari, etc.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories?.map((category: Interest) => (
                      <CategoryPill
                        key={category.id}
                        category={category}
                        onClick={handleCategoryToggle}
                        isSelected={form.watch('selectedCategories').includes(category.id)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <Button
                variant="destructive"
                type="button"
                onClick={onClose}
                className="bg-white p-0 text-sm text-red-500 hover:bg-white hover:text-red-600"
              >
                {cancelActionLabel}
              </Button>
              <div className="flex gap-3">
                {!hideSaveAndExit && (
                  <Button
                    type="button"
                    variant="outline-primary"
                    className="text-xs font-semibold"
                  >
                    {saveAndExitActionLabel}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="gradient"
                  className="rounded-full px-6 text-xs font-semibold text-white"
                  disabled={isSaving}
                >
                  {isSaving
                    ? isEditMode
                      ? editPendingActionLabel
                      : createPendingActionLabel
                    : isEditMode
                      ? editSubmitActionLabel
                      : createSubmitActionLabel}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
