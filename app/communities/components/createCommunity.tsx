'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import CategoryPill from '@/components/ui/categoryPill';
import CommunityCreatedSuccessDialog from '@/components/ui/createSuccessDialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InviteCommunities } from '@/components/ui/invite-communities';
import { InviteMembers, InvitedMember } from '@/components/ui/invite-members';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { Textarea } from '@/components/ui/textarea';
import { useGetInterestCategories, useGetUsers } from '@/hooks/auth';
import { useCreateCommunity, useGetCommunities } from '@/hooks/communities';
import { useGoogleMapsAutocomplete } from '@/hooks/places';
import { toast } from '@/hooks/use-toast';
import { Community } from '@/types/community';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';
import { Interest } from '@/types/interest';

import FileUploadField from '../../components/fileUploadField';
import IconComponent from '../../components/iconComponent';
import LocationAutocompleteField from '../../components/locationAutocompleteField';

const createCommunitySchema = z.object({
  communityName: z.string().min(2, { message: 'Community name is required.' }),
  city: z.string().min(1, { message: 'Please select a city.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  selectedCategories: z.array(z.string()).min(1, { message: 'Select at least one category.' }),
  visibility: z.enum(['public', 'private']),
  uploadedFiles: z.array(z.instanceof(File)).min(1, {
    message: 'Please upload at least one community poster.',
  }),
});

type CreateCommunityFormValues = z.infer<typeof createCommunitySchema>;

export default function CreateCommunity() {
  const uploadId = useId();
  const cityInputRef = useRef<HTMLDivElement>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [invitedCommunities, setInvitedCommunities] = useState<Community[]>([]);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [createdCommunityId, setCreatedCommunityId] = useState<string | null>(null);

  const { data: categories } = useGetInterestCategories();

  const { data: userCommunities, isFetching: isFetchingCommunities } = useGetCommunities({
    page: 1,
    enabled: true,
    following: true,
  });

  const availableCommunities = useMemo<Community[]>(() => {
    if (!userCommunities?.data) {
      return [];
    }

    return userCommunities?.data?.results?.map((community: any) => ({
      id: community.id,
      title: community.title,
      photos: community.photos,
      members: community.members,
    }));
  }, [userCommunities]);

  const normalizedMemberQuery = memberSearchQuery.trim();
  const { data: users = [], isFetching: isSearchingUsers } = useGetUsers(
    1,
    10,
    normalizedMemberQuery.length > 0 ? normalizedMemberQuery : undefined,
  );

  const memberSearchResults = useMemo<InvitedMember[]>(() => {
    if (!normalizedMemberQuery) {
      return [];
    }

    return users
      .map((user: any) => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          id: user.id,
          name: user.displayName || fullName || user.email || 'User',
          email: user.email,
          image: user.picture,
        } as InvitedMember;
      })
      .filter((user: InvitedMember) => !invitedMembers.some((member) => member.id === user.id));
  }, [users, invitedMembers, normalizedMemberQuery]);

  const { data: googlePlaces, isFetching: isFetchingGooglePlaces } = useGoogleMapsAutocomplete(
    cityInput,
    cityInput.length > 2,
  );

  const { mutate: createCommunity, isPending: isCreatingCommunity } = useCreateCommunity();

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
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      communityName: '',
      city: '',
      description: '',
      selectedCategories: [],
      visibility: 'public',
      uploadedFiles: [],
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
    const memberIds = invitedMembers
      .filter((member) => !member.email?.includes('@') || member.id.startsWith('user-'))
      .map((member) => member.id);

    const emails = invitedMembers
      .filter((member) => member.email && member.id.startsWith('email-'))
      .map((member) => member.email!);

    createCommunity(
      {
        title: values.communityName,
        description: values.description,
        categoriesIds: values.selectedCategories,
        isPublic: values.visibility === 'public',
        googleMapPlaceId: values.city,
        newPhotos: values.uploadedFiles,
        invitedMemberIds: memberIds,
        invitedCommunityIds: invitedCommunities.map((c) => c.id),
        invitedEmails: emails,
      },
      {
        onSuccess: (response: any) => {
          const communityId = response?.data?.id || null;
          setCreatedCommunityId(communityId);
          setIsSuccessDialogOpen(true);
          form.reset();
          setSelectedCategories([]);
          setCityInput('');
          setUploadedFiles([]);
          setInvitedMembers([]);
          setInvitedCommunities([]);
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
    <div className="mx-auto w-full py-6">
      <CommunityCreatedSuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        viewCommunityHref={
          createdCommunityId ? `/communities/${createdCommunityId}` : '/communities'
        }
        createExperienceHref="/experiences/create"
      />

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
          Think of having a Community as your website, business, social media page or even a
          WhatsApp group. Having community will help you manage your experiences and keep members
          connected between experiences.
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-5">
            <FormField
              control={form.control}
              name="uploadedFiles"
              render={() => (
                <FormItem>
                  <FormControl>
                    <FileUploadField
                      id={uploadId}
                      label="Upload a community poster (Dimensions: 1024*1024, Max 15 Mbs)"
                      accept="image/*"
                      excludedMimeTypes={['image/svg+xml']}
                      multiple
                      minImageWidth={1024}
                      minImageHeight={1024}
                      maxImageWidth={4096}
                      maxImageHeight={4096}
                      maxFileSizeMb={15}
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
                        setUploadedFiles(files);
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
                  <p className="text-xs font-medium text-gray-600">
                    Community type (who can see or join the community)
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

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LocationAutocompleteField
                      containerRef={cityInputRef}
                      value={cityInput}
                      showSuggestions={showCitySuggestions}
                      isLoading={isFetchingGooglePlaces}
                      suggestions={googlePlaces?.data || []}
                      onValueChange={(value) => {
                        setCityInput(value);
                        setShowCitySuggestions(true);
                      }}
                      onFocus={() => setShowCitySuggestions(true)}
                      onSelectSuggestion={(place: GoogleMapsAutocompletePrediction) => {
                        field.onChange(place.place_id);
                        setCityInput(place.description);
                        setShowCitySuggestions(false);
                      }}
                    />
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
                      className="rounded-[10px]"
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

            <InviteMembers
              invitedMembers={invitedMembers}
              onMembersChange={setInvitedMembers}
              searchResults={memberSearchResults}
              isSearching={isSearchingUsers}
              onSearch={(query) => {
                setMemberSearchQuery(query);
              }}
              debounceMs={500}
              className="mt-3"
            />

            <p className="mt-6 text-xs font-semibold text-gray-800">Your communities</p>
            <p className="mt-2 text-xs text-gray-700">
              Select your communities you would like to invite:
            </p>

            <InviteCommunities
              invitedCommunities={invitedCommunities}
              onCommunitiesChange={setInvitedCommunities}
              availableCommunities={availableCommunities}
              isLoading={isFetchingCommunities}
            />
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
                disabled={!form.formState.isValid || isCreatingCommunity}
                className="h-9 rounded-full px-4 text-xs text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {isCreatingCommunity ? 'Creating Community...' : 'Create Community'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
