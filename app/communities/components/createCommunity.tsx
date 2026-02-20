'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import CategoryPill from '@/components/ui/categoryPill';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useGetInterestCategories } from '@/hooks/auth';
import { useCreateCommunity, useCreateCommunityPhotos } from '@/hooks/communities';
import { useGoogleMapsAutocomplete } from '@/hooks/places';
import { toast } from '@/hooks/use-toast';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';
import { Interest } from '@/types/interest';

import FileUploadField from '../../components/fileUploadField';
import IconComponent from '../../components/iconComponent';

const createCommunitySchema = z.object({
  communityName: z.string().min(2, { message: 'Community name is required.' }),
  city: z.string().min(1, { message: 'Please select a city.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  selectedCategories: z.array(z.string()).min(1, { message: 'Select at least one category.' }),
  visibility: z.enum(['public', 'private']),
});

type CreateCommunityFormValues = z.infer<typeof createCommunitySchema>;

export default function CreateCommunity() {
  const uploadId = useId();
  const visibilityId = useId();
  const cityInputRef = useRef<HTMLDivElement>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const { data: categories } = useGetInterestCategories();
  const { data: googlePlaces } = useGoogleMapsAutocomplete(cityInput, cityInput.length > 2);

  const { mutate: createCommunity, isPending: isCreatingCommunity } = useCreateCommunity();
  const { mutate: uploadPhotos, isPending: isUploadingPhotos } = useCreateCommunityPhotos();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const form = useForm<CreateCommunityFormValues>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      communityName: '',
      city: '',
      description: '',
      selectedCategories: [],
      visibility: 'public',
    },
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category];

      form.setValue('selectedCategories', next, { shouldValidate: true });
      return next;
    });
  };

  const onSubmit = (values: CreateCommunityFormValues) => {
    createCommunity(
      {
        title: values.communityName,
        description: values.description,
        categoriesIds: values.selectedCategories,
        isPublic: values.visibility === 'public',
        googleMapPlaceId: values.city,
        newPhotos: uploadedFiles,
        invitedMemberIds: [],
        invitedCommunityIds: [],
        invitedEmails: [],
      },
      {
        onSuccess: (response: any) => {
          const communityId = response?.data?.id;

          if (communityId && uploadedFiles.length > 0) {
            uploadPhotos(
              { communityId, photos: uploadedFiles },
              {
                onSuccess: () => {
                  toast({
                    title: 'Success',
                    description: 'Community created with photos successfully',
                    variant: 'success',
                  });
                  form.reset();
                  setSelectedCategories([]);
                  setUploadedFiles([]);
                  setCityInput('');
                },
                onError: () => {
                  toast({
                    title: 'Warning',
                    description: 'Community created, but failed to upload photos',
                    variant: 'default',
                  });
                },
              },
            );
          } else {
            toast({
              title: 'Success',
              description: 'Community created successfully',
              variant: 'success',
            });
            form.reset();
            setSelectedCategories([]);
            setCityInput('');
          }
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to create community',
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Create Community</h1>
          <p className="mt-1 text-xs text-gray-800">
            Before you create an experience, please ensure you create a community
          </p>
        </div>
      </div>

      <div className="mt-4 inline-flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <span className="mt-0.5 shrink-0">
          <IconComponent iconName="UserMultipleIcon" color="#3B82F6" size={16} />
        </span>
        <span className="text-xs text-gray-800">
          Think of Community as your website, business, social media page or even a WhatsApp group.
          Having community will help you manage your experiences and keep members connected between
          experiences.
        </span>
      </div>

      <div className="mt-5">
        <FileUploadField
          id={uploadId}
          label="Upload a community poster (Dimensions: 540*540, Max 15 Mbs)"
          multiple
          onFilesChange={setUploadedFiles}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-4 space-y-3">
            <FormField
              control={form.control}
              name="communityName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Community Name" className="h-[55px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div ref={cityInputRef} className="relative">
                      <Input
                        placeholder="City e.g. Nairobi, Watamu..."
                        className="h-[55px]"
                        value={cityInput}
                        onChange={(e) => {
                          setCityInput(e.target.value);
                          setShowCitySuggestions(true);
                        }}
                        onFocus={() => setShowCitySuggestions(true)}
                      />
                      {showCitySuggestions &&
                        cityInput.length > 2 &&
                        googlePlaces?.data &&
                        googlePlaces.data.length > 0 && (
                          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                            {googlePlaces.data.map((place: GoogleMapsAutocompletePrediction) => (
                              <button
                                key={place.place_id}
                                type="button"
                                className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm hover:bg-gray-50"
                                onClick={() => {
                                  field.onChange(place.place_id);
                                  setCityInput(place.description);
                                  setShowCitySuggestions(false);
                                }}
                              >
                                <span className="mt-0.5 shrink-0">
                                  <IconComponent
                                    iconName="Location01Icon"
                                    color="#6B7280"
                                    size={16}
                                  />
                                </span>
                                <span className="text-gray-700">{place.description}</span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <p className="mb-2 text-xs font-bold text-gray-800">
                    Add your community description
                  </p>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Grab people's attention with a detailed description about the community..."
                      className="rounded-[10px] text-sm placeholder:text-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="selectedCategories"
            render={() => (
              <FormItem className="mt-4">
                <p className="text-xs font-bold text-gray-800">
                  Select a category the community falls under, e.g. Hiking, Safari, etc.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories?.map((category: Interest) => (
                    <CategoryPill key={category.id} category={category} onClick={toggleCategory} />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem className="mt-4">
                <p className="text-xs font-medium text-gray-600">What type of community is this?</p>
                <FormControl>
                  <RadioGroup className="mt-2" value={field.value} onValueChange={field.onChange}>
                    <label
                      htmlFor={`${visibilityId}-public`}
                      className="flex cursor-pointer items-start gap-3 text-xs text-gray-700"
                    >
                      <RadioGroupItem
                        value="public"
                        id={`${visibilityId}-public`}
                        className="mt-0.5 h-4 w-4 shrink-0 border-emerald-500 text-emerald-600"
                      />
                      <span className="leading-relaxed">
                        <span className="font-medium">Public</span> (Anyone can view the community and join)
                      </span>
                    </label>
                    <label
                      htmlFor={`${visibilityId}-private`}
                      className="flex cursor-pointer items-start gap-3 text-xs text-gray-700"
                    >
                      <RadioGroupItem
                        value="private"
                        id={`${visibilityId}-private`}
                        className="mt-0.5 h-4 w-4 shrink-0 border-emerald-500 text-emerald-600"
                      />
                      <span className="leading-relaxed">
                        <span className="font-medium">Private</span> (Only invited guests or members of a given communities can view and join)
                      </span>
                    </label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="text" className="text-xs text-red-500">
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-full border-primary px-4 text-xs text-primary"
              >
                Save &amp; Exit
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={isCreatingCommunity || isUploadingPhotos}
                className="h-9 rounded-full px-4 text-xs text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {isCreatingCommunity || isUploadingPhotos ? 'Creating...' : 'Create Community'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
