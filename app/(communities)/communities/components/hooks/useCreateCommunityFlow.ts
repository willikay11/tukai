import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useGetInterestCategories, useGetUsers } from '@/app/shared/hooks/useAuth';
import { useCreateCommunity, useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useGoogleMapsAutocomplete } from '@/app/shared/hooks/usePlaces';
import { toast } from '@/app/shared/hooks/useToast';
import { InvitedMember } from '@/components/ui/invite-members';
import { Community } from '@/types/community';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';
import { Interest } from '@/types/interest';

const createCommunitySchema = z.object({
  communityName: z.string().min(2, { message: 'Community name is required.' }),
  city: z.string().min(1, { message: 'Please select a city.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  selectedCategories: z.array(z.string()).min(1, { message: 'Select at least one category.' }),
  visibility: z.enum(['public', 'private']),
  photos: z.array(z.any()).min(1, {
    message: 'Please upload at least one community poster.',
  }),
  invitedGuests: z.array(z.any()).default([]),
  invitedCommunities: z.array(z.string()).default([]),
});

export type CreateCommunityFormValues = z.infer<typeof createCommunitySchema>;

export const useCreateCommunityFlow = () => {
  const uploadId = useId();
  const cityInputRef = useRef<HTMLDivElement>(null);

  // Form state
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
      photos: [],
      invitedGuests: [],
      invitedCommunities: [],
    },
  });

  // UI state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [invitedCommunities, setInvitedCommunities] = useState<Community[]>([]);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [createdCommunityId, setCreatedCommunityId] = useState<string | null>(null);

  // Data fetching hooks
  const { data: categories } = useGetInterestCategories();

  const { data: userCommunities, isFetching: isFetchingCommunities } = useGetCommunities({
    page: 1,
    enabled: true,
    following: true,
  });

  const normalizedMemberQuery = memberSearchQuery.trim();
  const { data: users = [], isFetching: isSearchingUsers } = useGetUsers(
    1,
    10,
    normalizedMemberQuery.length > 0 ? normalizedMemberQuery : undefined,
  );

  const { data: googlePlaces, isFetching: isFetchingGooglePlaces } = useGoogleMapsAutocomplete(
    cityInput,
    cityInput.length > 2,
  );

  const { mutate: createCommunity, isPending: isCreatingCommunity } = useCreateCommunity();

  // Computed values
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

  // Effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const toggleCategory = (category: Interest) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(category.id)
        ? prev.filter((item) => item !== category.id)
        : [...prev, category.id];

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
        newPhotos: values.photos
          .filter((photo: any) => photo.file)
          .map((photo: any) => photo.file),
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

  return {
    // IDs and refs
    uploadId,
    cityInputRef,

    // Form
    form,
    createCommunitySchema,

    // UI State
    selectedCategories,
    uploadedFiles,
    cityInput,
    showCitySuggestions,
    invitedMembers,
    memberSearchQuery,
    invitedCommunities,
    isSuccessDialogOpen,
    createdCommunityId,

    // State setters
    setSelectedCategories,
    setUploadedFiles,
    setCityInput,
    setShowCitySuggestions,
    setInvitedMembers,
    setMemberSearchQuery,
    setInvitedCommunities,
    setIsSuccessDialogOpen,

    // Data from APIs
    categories,
    availableCommunities,
    memberSearchResults,
    googlePlaces: googlePlaces?.data || [],

    // Loading states
    isFetchingCommunities,
    isSearchingUsers,
    isFetchingGooglePlaces,
    isCreatingCommunity,

    // Handlers
    handlers: {
      toggleCategory,
      onSubmit,
    },
  };
};
