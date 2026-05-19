import { useCallback, useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { InvitedMember } from '@/components/ui/invite-members';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { parseApiError } from '@/utils/parseApiError';
import {
  useFetchSingleExperience,
  useCreateExperience,
  useUpdateExperience,
  useAddExperiencePhotos,
  useDeleteExperiencePhoto,
  useAddGuestToExperience,
  usePublishExperience,
} from '@/app/shared/hooks/useExperiences';
import { Community } from '@/types/community';
import { Interest } from '@/types/interest';
import { Photo } from '@/types/photo';

import {
  useCreateBankWallet,
  useCreatePhoneWallet,
  useGetWallets,
  usePatchBankWallet,
  usePatchPhoneWallet,
} from '@/app/(experiences)/hooks/usePayment';
import { Wallet } from '@/types/payment';
export type ExperienceStepId = 'community' | 'about' | 'dates-tickets' | 'guests' | 'wallet';


const formatDateWithTime = (date: string, time: string | null = null, isEndOfDay: boolean = false): string => {
  if (!date) return '';
  // Date format is assumed to be ISO string (YYYY-MM-DD)
  // Time format is assumed to be HH:mm (24-hour format)
  if (time) {
    return `${date}T${time}:00`;
  }
  if (isEndOfDay) {
    return `${date}T23:59:59`;
  } else {
    return `${date}T00:00:00`;
  }
};

const parseExperienceStepId = (step: string | null): ExperienceStepId | null => {
  const validSteps: ExperienceStepId[] = ['community', 'about', 'dates-tickets', 'guests', 'wallet'];
  if (step && validSteps.includes(step as ExperienceStepId)) {
    return step as ExperienceStepId;
  }
  return null;
};

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
    recurringDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
    recurrenceStartDate: string | null;
    recurrenceEndDate: string | null;
    timeSlots: { startTime: string | null; endTime: string | null }[];
    multiDayStartDate: string | null;
    multiDayStartTime: string | null;
    multiDayEndDate: string | null;
    multiDayEndTime: string | null;
  };
  about: {
    photos: string[];
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
  tickets: {
    commission: 'host' | 'customer' | 'split';
    ticketMode: 'entire-period' | 'each-day' | null;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      amount: number;
      salesStartDate: string | null;
      salesStartTime: string | null;
      salesEndDate: string | null;
      salesEndTime: string | null;
      acceptPartialPayment: boolean;
      salesStartRelative: { amount: number; unit: 'hour' | 'day' | 'week'; anchor: 'start' | 'end' } | null;
      salesEndRelative: { amount: number; unit: 'hour' | 'day' | 'week'; anchor: 'start' | 'end' } | null;
      duplicateForEntirePeriod: boolean;
    }>;
  };
  invite: {
    invitedGuests: InvitedMember[];
    invitedCommunityIds: string[];
  };
  wallet: {
    selectedWalletId: string | null;
    paymentMethod: 'mpesa' | 'bank_account';
    mpesaPhoneNumber: string;
  };
};

const initialFormData: FormData = {
  dateType: {
    community: null,
    experiencePricing: 'paid',
    experienceType: 'one-time',
    isRecurring: false,
    date: null,
    startTime: null,
    endTime: null,
    recurringDays: [],
    recurrenceStartDate: null,
    recurrenceEndDate: null,
    timeSlots: [{ startTime: null, endTime: null }],
    multiDayStartDate: null,
    multiDayStartTime: null,
    multiDayEndDate: null,
    multiDayEndTime: null,
  },
  about: {
    photos: [],
    title: '',
    visibility: 'public',
    description: '',
    whatsIncluded: '',
    whatsNotIncluded: '',
    location: '',
    locationPlaceId: '',
    meetingPoint: '',
    meetingTime: null,
    categories: [],
  },
  tickets: {
    commission: 'host',
    ticketMode: null,
    items: [],
  },
  invite: {
    invitedGuests: [],
    invitedCommunityIds: [],
  },
  wallet: {
    selectedWalletId: null,
    paymentMethod: 'mpesa',
    mpesaPhoneNumber: '',
  },
};

export const useCreateExperienceFlow = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
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
  const [ticketsErrors, setTicketsErrors] = useState<Record<string, string>>({});
  const [walletErrors, setWalletErrors] = useState<Record<string, string>>({});

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

  // Wallet hooks
  const { data: walletsResponse, isLoading: isWalletsLoading } = useGetWallets();
  const { mutate: createBankWallet, isPending: isCreatingBankWallet } = useCreateBankWallet();
  const { mutate: createPhoneWallet, isPending: isCreatingPhoneWallet } = useCreatePhoneWallet();
  const { mutate: patchBankWallet, isPending: isPatchingBankWallet } = usePatchBankWallet();
  const { mutate: patchPhoneWallet, isPending: isPatchingPhoneWallet } = usePatchPhoneWallet();

  // Experience API hooks
  const { mutateAsync: createExperienceAsync } = useCreateExperience();
  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId || '');
  const { mutateAsync: addPhotosAsync } = useAddExperiencePhotos(experienceId || '');
  const { mutateAsync: deletePhotoAsync } = useDeleteExperiencePhoto(experienceId || '');
  const { mutateAsync: addGuestAsync } = useAddGuestToExperience(experienceId || '');
  const { mutateAsync: publishAsync } = usePublishExperience(experienceId || '');

  const [isSavingExperience, setIsSavingExperience] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const experience = experienceResponse?.data;
  const wallets: Wallet[] = walletsResponse?.data?.results ?? [];
  const hasSavedWallets = wallets.length > 0;
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

  const updateAboutFormData = useCallback((data: Partial<FormData['about']>) => {
    console.log("[updateAboutFormData] Updating about with data:", data);
    setFormData((prev) => {
      const updated = {
        ...prev,
        about: { ...prev.about, ...data },
      };
      console.log("[updateAboutFormData] New formData.about:", updated.about);
      return updated;
    });
  }, []);


  const updateWalletFormData = useCallback((data: Partial<FormData['wallet']>) => {
    setFormData((prev) => ({
      ...prev,
      wallet: { ...prev.wallet, ...data },
    }));
  }, []);

  const validateDateType = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.dateType.community) {
      errors.community = 'Community is required';
    }

    if (formData.dateType.experienceType === 'multi-day') {
      if (!formData.dateType.multiDayStartDate) {
        errors.multiDayStartDate = 'Start date is required';
      }

      if (!formData.dateType.multiDayStartTime) {
        errors.multiDayStartTime = 'Start time is required';
      }

      if (!formData.dateType.multiDayEndDate) {
        errors.multiDayEndDate = 'End date is required';
      }

      if (!formData.dateType.multiDayEndTime) {
        errors.multiDayEndTime = 'End time is required';
      }

      if (
        formData.dateType.multiDayStartDate &&
        formData.dateType.multiDayEndDate &&
        formData.dateType.multiDayStartDate > formData.dateType.multiDayEndDate
      ) {
        errors.multiDayEndDate = 'End date must be after start date';
      }
    } else if (formData.dateType.isRecurring) {
      if (formData.dateType.recurringDays.length === 0) {
        errors.recurringDays = 'At least one day must be selected';
      }

      if (!formData.dateType.recurrenceStartDate) {
        errors.recurrenceStartDate = 'Start date is required';
      }

      if (!formData.dateType.recurrenceEndDate) {
        errors.recurrenceEndDate = 'End date is required';
      }

      if (
        formData.dateType.recurrenceStartDate &&
        formData.dateType.recurrenceEndDate &&
        formData.dateType.recurrenceStartDate > formData.dateType.recurrenceEndDate
      ) {
        errors.recurrenceEndDate = 'End date must be after start date';
      }

      if (formData.dateType.timeSlots.length === 0) {
        errors.timeSlots = 'At least one time slot is required';
      }

      formData.dateType.timeSlots.forEach((slot, index) => {
        if (!slot.startTime) {
          errors[`slots.${index}.startTime`] = 'Start time is required';
        }
        if (!slot.endTime) {
          errors[`slots.${index}.endTime`] = 'End time is required';
        }
        if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
          errors[`slots.${index}.endTime`] = 'End time must be after start time';
        }
      });
    } else {
      if (!formData.dateType.date) {
        errors.date = 'Date is required';
      }

      if (!formData.dateType.startTime) {
        errors.startTime = 'Start time is required';
      }

      if (!formData.dateType.endTime) {
        errors.endTime = 'End time is required';
      }

      if (formData.dateType.startTime && formData.dateType.endTime && formData.dateType.startTime >= formData.dateType.endTime) {
        errors.endTime = 'End time must be after start time';
      }
    }

    setDateTypeErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.dateType]);

  const updateTicketsFormData = useCallback((data: Partial<FormData['tickets']>) => {
    console.log("[updateTicketsFormData] Updating tickets with data:", data);
    setFormData((prev) => {
      const updated = {
        ...prev,
        tickets: { ...prev.tickets, ...data },
      };
      console.log("[updateTicketsFormData] New formData.tickets:", updated.tickets);
      return updated;
    });
  }, []);

  const validateAbout = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    console.log("[validateAbout] Starting validation for about form");
    console.log("[validateAbout] formData.about:", formData.about);

    if (!formData.about.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.about.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.about.location.trim()) {
      errors.location = 'Location is required';
    }

    if (formData.about.photos.length === 0) {
      errors.photos = 'At least one photo is required';
    }

    setAboutErrors(errors);
    console.log("[validateAbout] Errors found:", errors);
    console.log("[validateAbout] Is valid:", Object.keys(errors).length === 0);
    return Object.keys(errors).length === 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.about.title, formData.about.description, formData.about.location, formData.about.photos]);

  const validateTickets = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (formData.tickets.items.length === 0) {
      errors.items = 'At least one ticket is required';
      setTicketsErrors(errors);
      return false;
    }

    if (formData.dateType.experienceType === 'multi-day' && !formData.tickets.ticketMode) {
      errors.ticketMode = 'Please select how you want to create tickets';
      setTicketsErrors(errors);
      return false;
    }

    formData.tickets.items.forEach((ticket, index) => {
      if (!ticket.name.trim()) {
        errors[`tickets.${index}.name`] = 'Ticket name is required';
      }

      if (ticket.quantity === null || ticket.quantity === undefined || ticket.quantity <= 0) {
        errors[`tickets.${index}.quantity`] = 'Quantity must be greater than 0';
      }

      if (formData.dateType.experiencePricing === 'paid') {
        if (ticket.amount === null || ticket.amount === undefined || ticket.amount <= 0) {
          errors[`tickets.${index}.amount`] = 'Amount must be greater than 0';
        }
      }

      if (formData.dateType.isRecurring) {
        if (!ticket.salesStartRelative) {
          errors[`tickets.${index}.salesStartRelative`] = 'Sales start validity is required';
        }
        if (!ticket.salesEndRelative) {
          errors[`tickets.${index}.salesEndRelative`] = 'Sales end validity is required';
        }
      } else if (formData.dateType.experienceType === 'multi-day') {
        if (!ticket.salesStartDate) {
          errors[`tickets.${index}.salesStartDate`] = 'Start date is required';
        }
        if (!ticket.salesEndDate) {
          errors[`tickets.${index}.salesEndDate`] = 'End date is required';
        }
        if (ticket.salesStartDate && ticket.salesEndDate && ticket.salesStartDate > ticket.salesEndDate) {
          errors[`tickets.${index}.salesEndDate`] = 'End date must be after start date';
        }
      } else {
        if (!ticket.salesStartDate) {
          errors[`tickets.${index}.salesStartDate`] = 'Start date is required';
        }
        if (!ticket.salesEndDate) {
          errors[`tickets.${index}.salesEndDate`] = 'End date is required';
        }
        if (ticket.salesStartDate && ticket.salesEndDate && ticket.salesStartDate > ticket.salesEndDate) {
          errors[`tickets.${index}.salesEndDate`] = 'End date must be after start date';
        }
      }
    });

    setTicketsErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.dateType.isRecurring, formData.dateType.experiencePricing, formData.dateType.experienceType, formData.tickets.items, formData.tickets.ticketMode]);

  const validateWallet = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!wallets.length && !formData.wallet.selectedWalletId && !formData.wallet.mpesaPhoneNumber) {
      errors.wallet = 'Please set up a payment method before continuing.';
    }
    setWalletErrors(errors);
    return Object.keys(errors).length === 0;
  }, [wallets.length, formData.wallet.selectedWalletId, formData.wallet.mpesaPhoneNumber]);

  const updateInviteFormData = useCallback((data: Partial<FormData['invite']>) => {
    setFormData((prev) => ({
      ...prev,
      invite: { ...prev.invite, ...data },
    }));
  }, []);

  const handleStepChange = (step: ExperienceStepId) => {
    console.log("[handleStepChange] Changing step from", activeStep, "to", step);
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

  const handleSaveAbout = useCallback(async () => {
    setIsSavingExperience(true);
    setApiError(null);
    try {
      const payload = {
        title: formData.about.title,
        description: formData.about.description,
        googleMapPlaceId: formData.about.locationPlaceId || 'ChIJkYb7L8EXLxgRWogSMeTPg8M',
        startDate: formatDateWithTime(formData.dateType.date || '', formData.dateType.startTime || null),
        endDate: formatDateWithTime(formData.dateType.date || '', formData.dateType.endTime || null, true),
        recurrence_rule: '',
        categoriesIds: formData.about.categories.map((c) => c.id),
        isPublic: formData.about.visibility === 'public',
        newPhotos: [],
        invitedCommunityIds: [],
        invitedGuestsEmails: [],
      };

      if (experienceId) {
        await updateExperienceAsync(payload);
      } else {
        const response = await createExperienceAsync(payload);
        handleExperienceCreated(response.data?.id || '');
      }

      setActiveStep('dates-tickets');
      replaceCreateUrlParams({ step: 'dates-tickets' });
    } catch (error: any) {
      const message = parseApiError(error, 'Failed to save experience');
      setApiError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('[handleSaveAbout] Error:', error);
    } finally {
      setIsSavingExperience(false);
    }
  }, [formData.about, formData.dateType, experienceId, createExperienceAsync, updateExperienceAsync, toast]);

  const handleAddPhotos = useCallback(async (photos: File[]) => {
    setIsSavingExperience(true);
    setApiError(null);
    try {
      if (!experienceId) {
        throw new Error('Experience ID is required to add photos');
      }
      await addPhotosAsync(photos);
    } catch (error: any) {
      const message = parseApiError(error, 'Failed to add photos');
      setApiError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('[handleAddPhotos] Error:', error);
    } finally {
      setIsSavingExperience(false);
    }
  }, [experienceId, addPhotosAsync, toast]);

  const handleDeletePhoto = useCallback(async (photoId: string) => {
    setIsSavingExperience(true);
    setApiError(null);
    try {
      if (!experienceId) {
        throw new Error('Experience ID is required to delete photos');
      }
      await deletePhotoAsync(photoId);
    } catch (error: any) {
      const message = parseApiError(error, 'Failed to delete photo');
      setApiError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('[handleDeletePhoto] Error:', error);
    } finally {
      setIsSavingExperience(false);
    }
  }, [experienceId, deletePhotoAsync, toast]);

  const handleAddGuest = useCallback(async (guestEmail: string) => {
    setIsSavingExperience(true);
    setApiError(null);
    try {
      if (!experienceId) {
        throw new Error('Experience ID is required to add guests');
      }
      await addGuestAsync(guestEmail);
    } catch (error: any) {
      const message = parseApiError(error, 'Failed to add guest');
      setApiError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('[handleAddGuest] Error:', error);
    } finally {
      setIsSavingExperience(false);
    }
  }, [experienceId, addGuestAsync, toast]);

  const handlePublish = useCallback(async () => {
    setIsSavingExperience(true);
    setApiError(null);
    try {
      if (!experienceId) {
        throw new Error('Experience ID is required to publish');
      }
      await publishAsync();
    } catch (error: any) {
      const message = parseApiError(error, 'Failed to publish experience');
      setApiError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('[handlePublish] Error:', error);
    } finally {
      setIsSavingExperience(false);
    }
  }, [experienceId, publishAsync, toast]);

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
    ticketsErrors,
    communitiesForSelector,

    // Computed
    hasCreatedCommunity,
    isCheckingCommunityAccess,

    // Functions
    updateFormData,
    updateAboutFormData,
    updateTicketsFormData,
    updateInviteFormData,
    validateDateType,
    validateAbout,
    validateTickets,

    // Handl,

    // Wallet state and mutations
    wallets,
    isWalletsLoading,
    hasSavedWallets,
    walletErrors,
    validateWallet,
    updateWalletFormData,
    isSavingExperience,
    apiError,

    walletMutations: {
      createBankWallet,
      isCreatingBankWallet,
      createPhoneWallet,
      isCreatingPhoneWallet,
      patchBankWallet,
      isPatchingBankWallet,
      patchPhoneWallet,
      isPatchingPhoneWallet,
    },

    handlers: {
      handleStepChange,
      handleExperienceCreated,
      handleDatesUpdatedSuccess,
      handleItineraryCustomise,
      handleInvitesChange,
      handleSaveAbout,
      handleAddPhotos,
      handleDeletePhoto,
      handleAddGuest,
      handlePublish,
    },
  };
};
