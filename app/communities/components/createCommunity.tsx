'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import CategoryPill from '@/components/ui/categoryPill';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
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

const invitedMembers = [
  { id: 'm1', name: 'Brooklyn...', image: '/images/one.jpg' },
  { id: 'm2', name: 'Kimberly...', image: '/images/two.jpg' },
  { id: 'm3', name: 'Marvin...', image: '/images/three.jpg' },
  { id: 'm4', name: 'gralak@gmail...', image: '' },
  { id: 'm5', name: 'Marvin...', image: '/images/four.jpg' },
  { id: 'm6', name: 'Eleanor...', image: '/images/five.jpg' },
];

const invitedCommunities = [
  { id: 'c1', name: 'Let’s Drift', image: '/images/seven.jpg' },
  { id: 'c2', name: 'The Mara Nomads', image: '/images/eight.jpg' },
  { id: 'c3', name: 'A Longer Communities Name', image: '/images/santorini.webp' },
  { id: 'c4', name: 'Let’s Drift', image: '/images/seven.jpg' },
  { id: 'c5', name: 'The Mara Nomads', image: '/images/eight.jpg' },
];

export default function CreateCommunity() {
  const uploadId = useId();
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
              name="visibility"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <p className="text-xs font-medium text-gray-600">Community type (who can see or join the community)</p>
                  <FormControl>
                    <PillRadioGroup
                      options={[
                        { value: 'public', label: 'Public experience' },
                        { value: 'private', label: 'Private experience' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
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
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
                                onClick={() => {
                                  field.onChange(place.place_id);
                                  setCityInput(place.description);
                                  setShowCitySuggestions(false);
                                }}
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                  <IconComponent
                                    iconName="Location01Icon"
                                    color="#10B981"
                                    size={20}
                                  />
                                </div>
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

          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-800">
              Invite your friends or members of other communities
            </p>
            <p className="mt-2 text-xs text-gray-700">
              You can share invites individually or invite members of a given Communities that you
              own or are a member of.
            </p>

            <div className="relative mt-3">
              <Input
                placeholder="Search by user name or add their email"
                className="h-[56px] rounded-2xl border-gray-300 pr-12 placeholder:text-gray-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                <IconComponent iconName="Search01Icon" size={22} color="gray" />
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {invitedMembers.map((member) => (
                <div
                  key={member.id}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-2"
                >
                  <Avatar className="h-6 w-6">
                    {member.image ? <AvatarImage src={member.image} alt={member.name} /> : null}
                    <AvatarFallback className="bg-gray-200 text-gray-500">
                      <IconComponent iconName="UserIcon" size={14} color="gray" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[112px] truncate text-xs text-gray-700">{member.name}</span>
                  <button
                    type="button"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-400"
                  >
                    <IconComponent iconName="Cancel01Icon" size={12} color="white" />
                  </button>
                </div>
              ))}
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-emerald-100 px-2 text-xs font-semibold text-emerald-700">
                +34
              </span>
            </div>

            <p className="mt-6 text-xs font-semibold text-gray-800">Your communities</p>
            <p className="mt-2 text-xs text-gray-700">Select your communities you would like to invite:</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {invitedCommunities.map((community) => (
                <div
                  key={community.id}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-3"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={community.image} alt={community.name} />
                    <AvatarFallback />
                  </Avatar>
                  <span className="max-w-[180px] truncate text-xs text-gray-700">{community.name}</span>
                </div>
              ))}
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-emerald-100 px-2 text-xs font-semibold text-emerald-700">
                +12
              </span>
            </div>
          </div>

          

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
                {isCreatingCommunity || isUploadingPhotos ? 'Creating Community...' : 'Create Community'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
