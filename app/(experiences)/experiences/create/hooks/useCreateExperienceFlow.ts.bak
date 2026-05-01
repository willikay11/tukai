import { useCallback, useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { InvitedMember } from '@/components/ui/invite-members';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useFetchSingleExperience } from '@/app/shared/hooks/useExperiences';
import { Community } from '@/types/community';
import type { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

export type ExperienceStepId = 'community' | 'about' | 'dates-tickets' | 'guests' | 'wallet';

export interface CommunityOption {
  id: string;
  name: string;
  imageUrl: string;
}

export interface FormData {
  dateType: {
    community: CommunityOption | null;
    experiencePricing: 'paid' | 'free';
    experienceType: 'one-time' | 'multi-day' | 'itinerary';
    isRecurring: boolean;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
  };
  about: {
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
}

const EXPERIENCE_STEPS: ExperienceStepId[] = [
  'community',
  'about',
  'dates-tickets',
  'guests',
  'wallet',
];

function parseExperienceStepId(step: string | null): ExperienceStepId | null {
  if (!step) {
    return null;
  }

  return EXPERIENCE_STEPS.includes(step as ExperienceStepId) ? (step as ExperienceStepId) : null;
}

const initialFormData: FormData = {
  dateType: {
    community: null,
    experiencePricing: 'paid',
    experienceType: 'one-time',
    isRecurring: false,
    date: null,
    startTime: null,
    endTime: null,
  },
  about: {
    photo: null,
    title: '',
    visibility: 'public',
    description: '',
    whatsIncluded: '',
    whatsNotIncluded: '',
    location: '',
    meetingPoint: '',
    meetingTime: null,
    categories: [],
  },
};

export const useCreateExperienceFlow = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const currentUserId = session?.user?.id ?? undefined;
  const experienceIdFromUrl = searchParams.get('experienceId');
  const stepFromUrl = parseExperienceStepId(searchParams.get('step'));

  const [activeStep, setActiveStep] = useState<ExperienceStepId>(stepFromUrl || 'community');
  const [experienceId, setExperienceId] = useState<string | null>(experienceIdFromUrl);
  const [hasUpdatedDates, setHasUpdatedDates] = useState(false);
  const [itineraryConfig, setItineraryConfig] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);
  const [invitedCommunities, setInvitedCommunities] = useState<Community[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [dateTypeErrors, setDateTypeErrors] = useState<Record<string, string>>({});
  const [aboutErrors, setAboutErrors] = useState<Record<string, string>>({});

  const { data: createdCommunitiesResponse, isLoading: isLoadingCreatedCommunities } =
    useGetCommunities({
      page: 1,
      enabled: sessionStatus === 'authenticated' && !!currentUserId,
      createdBy: currentUserId,
    });

  const { data: experienceResponse, isLoading: isLoadingExperience } = useFetchSingleExperience(
    experienceId || '',
    true,
  );

  const experience = experienceResponse?.data;
  const hasCreatedCommunity = (createdCommunitiesResponse?.data?.results?.length ?? 0) > 0;
  const isCheckingCommunityAccess =
    sessionStatus === 'loading' ||
    (sessionStatus === 'authenticated' && !!currentUserId && isLoadingCreatedCommunities);

  // Sync experienceId from URL
  useEffect(() => {
    setExperienceId(experienceIdFromUrl);
    setHasUpdatedDates(false);
    setItineraryConfig(null);
  }, [experienceIdFromUrl]);

  // Sync activeStep from URL
  useEffect(() => {
    if (stepFromUrl) {
      setActiveStep(stepFromUrl);
    }
  }, [stepFromUrl]);

  // Auto-show tickets panel if experience already has dates filled
  useEffect(() => {
    if (experience?.startDate && experience?.endDate) {
      setHasUpdatedDates(true);
    }
  }, [experience]);

  // Guard: Redirect to communities/create if no community
  useEffect(() => {
    if (sessionStatus !== 'authenticated' || isLoadingCreatedCommunities) {
      return;
    }

    if (!hasCreatedCommunity) {
      router.replace('/communities/create');
    }
  }, [hasCreatedCommunity, isLoadingCreatedCommunities, router, sessionStatus]);

  const replaceCreateUrlParams = (
    nextValues: Partial<{ experienceId: string | null; step: ExperienceStepId }>,
  ) => {
    const mergedExperienceId =
      nextValues.experienceId !== undefined ? nextValues.experienceId : experienceId;
    const mergedStep = nextValues.step !== undefined ? nextValues.step : activeStep;

    const params = new URLSearchParams(searchParams.toString());

    if (mergedExperienceId) {
      params.set('experienceId', mergedExperienceId);
    } else {
      params.delete('experienceId');
    }

    params.set('step', mergedStep);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const updateFormData = useCallback((data: Partial<FormData['dateType']>) => {
    setFormData((prev) => ({
      ...prev,
      dateType: { ...prev.dateType, ...data },
    }));
  }, []);

  const validateDateType = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.dateType.community) {
      errors.community = 'Community is required';
    }

    if (!formData.dateType.date) {
      errors.date = 'Date is required';
    }

    setDateTypeErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.dateType.community, formData.dateType.date]);

  const validateAbout = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.about.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.about.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.about.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!formData.about.photo) {
      errors.photo = 'At least one photo is required';
    }

    setAboutErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.about.title, formData.about.description, formData.about.location, formData.about.photo]);

  const handleStepChange = (step: ExperienceStepId) => {
    setActiveStep(step);
    replaceCreateUrlParams({ step });
  };

  const handleExperienceCreated = (createdExperienceId: string, step?: ExperienceStepId) => {
    setExperienceId(createdExperienceId);

    if (step) {
      setActiveStep(step);
    }

    replaceCreateUrlParams({ experienceId: createdExperienceId, step });
  };

  const handleDatesUpdatedSuccess = (nextStep?: ExperienceStepId) => {
    setHasUpdatedDates(true);

    if (nextStep) {
      setActiveStep(nextStep);
      replaceCreateUrlParams({ step: nextStep });
    }
  };

  const handleItineraryCustomise = (config: { startDate: string; endDate: string }) => {
    setItineraryConfig(config);
  };

  const handleInvitesChange = (members: InvitedMember[], communities: Community[]) => {
    setInvitedMembers(members);
    setInvitedCommunities(communities);
  };

  const resolveCommunityImageUrl = (community: Community): string => {
    const preferredPhoto =
      community?.photos?.find((photo: Photo) => photo.isCover) || community?.photos?.[0];

    return preferredPhoto?.photo || 'https://via.placeholder.com/32';
  };

  const communitiesForSelector = (createdCommunitiesResponse?.data?.results || []).map(
    (community: Community) => ({
      id: community.id,
      name: community.title,
      imageUrl: resolveCommunityImageUrl(community),
    }),
  );

  return {
    // State
    activeStep,
    experienceId,
    experience,
    isLoadingExperience,
    hasUpdatedDates,
    itineraryConfig,
    invitedMembers,
    invitedCommunities,
    formData,
    dateTypeErrors,
    aboutErrors,
    communitiesForSelector,

    // Computed
    hasCreatedCommunity,
    isCheckingCommunityAccess,

    // Functions
    updateFormData,
    validateDateType,
    validateAbout,

    // Handlers
    handlers: {
      handleStepChange,
      handleExperienceCreated,
      handleDatesUpdatedSuccess,
      handleItineraryCustomise,
      handleInvitesChange,
    },
  };
};
