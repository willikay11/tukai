'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { RRule } from 'rrule';
import * as z from 'zod';

import FileUploadField from '@/app/components/fileUploadField';
import IconComponent from '@/app/components/iconComponent';
import LocationAutocompleteField from '@/app/components/locationAutocompleteField';
import { Button } from '@/components/ui/button';
import CategoryPill from '@/components/ui/categoryPill';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { TimePicker } from '@/components/ui/time-picker';
import { useGetInterestCategories } from '@/hooks/auth';
import { useCreateExperience } from '@/hooks/experiences';
import { useGoogleMapsAutocomplete } from '@/hooks/places';
import { toast } from '@/hooks/use-toast';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';
import { Interest } from '@/types/interest';

const experienceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  included: z.string().min(3, 'Please describe what is included'),
  notIncluded: z.string().min(1, 'Please describe what is not included'),
  location: z.string().min(3, 'Location is required'),
  meetingPoint: z.string().optional().default(''),
  meetingTime: z.string().optional().default(''),
  visibility: z.enum(['public', 'private']),
  selectedCategories: z.array(z.string()).min(1, 'Select at least one category'),
  uploadedFiles: z.array(z.instanceof(File)).min(1, {
    message: 'Please upload at least one experience poster.',
  }),
});

export default function CreateExperienceAbout({
  onSuccess,
}: {
  onSuccess?: (experienceId: string) => void;
}) {
  const { data: categories } = useGetInterestCategories();
  const { mutate: createExperience, isPending: isCreatingExperience } = useCreateExperience();
  const locationInputRef = useRef<HTMLDivElement>(null);
  const [locationInput, setLocationInput] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const { data: googlePlaces, isFetching: isFetchingGooglePlaces } = useGoogleMapsAutocomplete(
    locationInput,
    locationInput.length > 2,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const form = useForm<z.infer<typeof experienceSchema>>({
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

    const rule = new RRule({
      freq: RRule.WEEKLY,
      interval: 5,
      byweekday: [RRule.MO, RRule.FR],
      dtstart: now.toDate(),
      until: endOfDay,
    });

    createExperience(
      {
        title: values.title,
        description: values.description,
        googleMapPlaceId: values.location,
        startDate: today,
        endDate: '2026-03-27T18:39:20.886Z',
        recurrence_rule: rule.toString(),
        categoriesIds: values.selectedCategories,
        isPublic: values.visibility === 'public',
        newPhotos: values.uploadedFiles,
        invitedCommunityIds: [],
        invitedGuestsEmails: [],
      },
      {
        onSuccess: (response: any) => {
          const experienceId = response?.data?.id;
          toast({
            title: 'Success',
            description: 'Experience created successfully.',
            variant: 'success',
          });
          if (experienceId) {
            onSuccess?.(experienceId);
          }
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error?.message || 'Failed to create experience.',
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <div className="w-full">
      <div className="bg-white">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Create Experience</h1>
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
                    <textarea
                      id="description"
                      placeholder="Grab people's attention with a detailed description about the experience..."
                      {...field}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                      rows={4}
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
                    <textarea
                      id="included"
                      placeholder="Add what is included in this experience..."
                      {...field}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                      rows={3}
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
                    <textarea
                      id="notIncluded"
                      placeholder="Add what is NOT included in this experience..."
                      {...field}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                      rows={3}
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
                      <div className="relative">
                        <Input type="text" placeholder="Meeting/Pick-up Point" {...field} />
                        <IconComponent
                          iconName="LocationIcon"
                          size={18}
                          color="currentColor"
                          className="absolute right-3 top-2.5 text-gray-400"
                        />
                      </div>
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
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <button type="button" className="text-sm text-red-500 hover:text-red-600">
                Cancel
              </button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full text-xs font-semibold"
                >
                  Save & Exit
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="rounded-full px-6 text-xs font-semibold text-white"
                  disabled={isCreatingExperience}
                >
                  {isCreatingExperience ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
