import { useCallback, useEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import moment from 'moment';
import { RRule } from 'rrule';

import { buildRecurrenceRule } from '@/app/(experiences)/experiences/create/utils/buildRecurrenceRule';
import {
  useCreateBankWallet,
  useCreatePhoneWallet,
  useGetWallets,
  usePatchBankWallet,
  usePatchPhoneWallet,
} from '@/app/(experiences)/hooks/usePayment';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import {
  useAddExperiencePhotos,
  useAddGuestToExperience,
  useCreateExperience,
  useDeleteExperiencePhoto,
  useFetchSingleExperience,
  useFetchSlotTemplates,
  usePublishExperience,
  useUpdateExperience,
} from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { InvitedMember } from '@/components/ui/invite-members';
import {
  addExperiencePhotos,
  createSlotTemplate,
  deleteSlotTemplate,
  fetchSlotTemplates,
  updateSlotTemplate,
} from '@/services/experience';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Interest } from '@/types/interest';
import { Wallet } from '@/types/payment';
import { Photo } from '@/types/photo';
import { inferUIExperienceType } from '@/utils/date-utils';
import { parseApiError } from '@/utils/parseApiError';
import {
  SlotTemplateRecord,
  buildSlotTemplatePayload,
  calculateEndTime,
  diffSlotTemplates,
} from '@/utils/slot-template-utils';

export type ExperienceStepId = 'community' | 'about' | 'dates-tickets' | 'guests' | 'wallet';

const formatDateWithTime = (
  date: string,
  time: string | null = null,
  isEndOfDay: boolean = false,
): string => {
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
  const validSteps: ExperienceStepId[] = [
    'community',
    'about',
    'dates-tickets',
    'guests',
    'wallet',
  ];
  if (step && validSteps.includes(step as ExperienceStepId)) {
    return step as ExperienceStepId;
  }
  return null;
};

const mapCommission = (
  value: 'host' | 'customer' | 'split',
): 'host_pays' | 'customer_pays' | 'split' => {
  const map = { host: 'host_pays', customer: 'customer_pays', split: 'split' } as const;
  return map[value];
};

export interface CommunityOption {
  id: string;
  name: string;
  imageUrl: string;
}

export interface FormPhoto {
  id: string; // Either 'temp-{timestamp}' or real ID from DB
  url: string; // Photo URL or data URI
  file?: File; // Optional, only for new photos
  isTempId?: boolean; // Flag to know if we need to replace ID after save
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
    itineraryStartDate: string | null;
    itineraryEndDate: string | null;
  };
  about: {
    photos: FormPhoto[];
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
      apiId?: string;
      name: string;
      quantity: number;
      amount: number;
      // Ticket slot time (when the ticket/experience runs) — for multi-day in "entire-period" mode
      startTime: string | null;
      endTime: string | null;
      // Sales validity (when people can purchase)
      salesStartDate: string | null;
      salesStartTime: string | null;
      salesEndDate: string | null;
      salesEndTime: string | null;
      acceptPartialPayment: boolean;
      // Relative validity for recurring
      salesStartRelative: {
        amount: number;
        unit: 'hour' | 'day' | 'week';
        anchor: 'start' | 'end';
      } | null;
      salesEndRelative: {
        amount: number;
        unit: 'hour' | 'day' | 'week';
        anchor: 'start' | 'end';
      } | null;
      duplicateForEntirePeriod: boolean;
    }>;
  };
  invite: {
    invitedGuests: Experience['guests'];
    invitedCommunityIds: string[];
  };
  wallet: {
    paymentMethod: 'phone' | 'bank';
    selectedWallet?: Wallet;
    phoneNumber: string;
  };
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
    recurringDays: [],
    recurrenceStartDate: null,
    recurrenceEndDate: null,
    timeSlots: [{ startTime: null, endTime: null }],
    multiDayStartDate: null,
    multiDayStartTime: null,
    multiDayEndDate: null,
    multiDayEndTime: null,
    itineraryStartDate: null,
    itineraryEndDate: null,
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
    selectedWallet: undefined,
    paymentMethod: 'phone',
    phoneNumber: '',
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
  const [slotTemplateRecords, setSlotTemplateRecords] = useState<SlotTemplateRecord[]>([]);

  const hasHydrated = useRef(false);

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

  // Slot template hooks
  const { data: slotTemplatesResponse, isLoading: isLoadingSlotTemplates } =
    useFetchSlotTemplates(experienceId);

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
  const { mutateAsync: deletePhotoAsync } = useDeleteExperiencePhoto();
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
    setFormData((prev) => ({
      ...prev,
      about: { ...prev.about, ...data },
    }));
  }, []);

  // Populate form when experience is loaded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!experience || !experienceId || hasHydrated.current) {
      return;
    }
    hasHydrated.current = true;

    // Parse dates from ISO format (extract without timezone conversion)
    const startDate = experience.startDate?.split('T')[0];
    const startTime = experience.startDate
      ? (experience.startDate.split('T')[1]?.substring(0, 5) ?? null)
      : null;
    const endTime = experience.endDate
      ? (experience.endDate.split('T')[1]?.substring(0, 5) ?? null)
      : null;

    // Update about form
    updateAboutFormData({
      title: experience.title,
      description: experience.description,
      visibility: experience.isPublic ? 'public' : 'private',
      photos:
        experience.photos?.map((photo: Photo) => ({
          id: photo.id,
          url: photo.photo,
          isTempId: false,
        })) || [],
      categories: experience.categories || [],
      location: experience.location?.formattedAddress || experience.location?.city || '',
      locationPlaceId: experience.location?.googleMapPlaceId ?? '',
      meetingPoint: experience.meetingPlace || '',
      meetingTime: experience.meetingTime || null,
      whatsIncluded: experience.whatsIncluded ?? '',
      whatsNotIncluded: experience.whatsNotIncluded ?? '',
    });

    // Check if experience is recurring and parse recurrence rule
    const hasRecurrenceRule = !!experience.recurrenceRule;

    // Infer the UI experience type from API response and dates
    const apiExperienceType = (experience as any).experience_type ?? 'standard';
    const uiExperienceType = inferUIExperienceType(
      apiExperienceType,
      experience.startDate ?? null,
      experience.endDate ?? null,
    );

    let dateTypeUpdate: any = {
      community: experience.hostCommunity
        ? {
            id: experience.hostCommunity.id,
            name: experience.hostCommunity.title,
            imageUrl: experience.hostCommunity.photos?.[0]?.photo ?? null,
          }
        : null,
      experiencePricing: experience.isPaid ? 'paid' : 'free',
      experienceType: uiExperienceType,
      date: startDate,
      startTime,
      endTime,
    };

    // For multi-day experiences, also populate the multi-day date/time fields
    if (uiExperienceType === 'multi-day') {
      const endDate = experience.endDate?.split('T')[0];
      const endTime = experience.endDate
        ? (experience.endDate.split('T')[1]?.substring(0, 5) ?? null)
        : null;

      dateTypeUpdate.multiDayStartDate = startDate;
      dateTypeUpdate.multiDayStartTime = startTime;
      dateTypeUpdate.multiDayEndDate = endDate;
      dateTypeUpdate.multiDayEndTime = endTime;
    }

    // If recurring, parse the recurrence rule using RRule
    if (hasRecurrenceRule) {
      const options = RRule.parseString(experience.recurrenceRule);
      const rule = new RRule(options);

      try {
        const records: { id: string; name?: string; startTime: string; durationMinutes: number }[] =
          slotTemplatesResponse?.data?.results ?? [];

        // Store slot template records for sync operations
        const recordsForState: SlotTemplateRecord[] = records.map((record, index) => ({
          uiId: `slot-${index}`,
          templateId: record.id,
          startTime: record.startTime,
          endTime: calculateEndTime(record.startTime, record.durationMinutes),
          name: record.name,
        }));
        setSlotTemplateRecords(recordsForState);

        dateTypeUpdate = {
          ...dateTypeUpdate,
          isRecurring: true,
          recurringDays: rule.options.byweekday?.map((day) => {
            const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            return days[day];
          }) as any,
          recurrenceStartDate: moment(rule.options.dtstart).format('YYYY-MM-DD'),
          recurrenceEndDate: moment(rule.options.until).format('YYYY-MM-DD'),
          // date: null,
          timeSlots: records.map((record) => ({
            startTime: record.startTime,
            endTime: calculateEndTime(record.startTime, record.durationMinutes),
          })),
        };
      } catch (error) {
        console.error('Error parsing recurrence rule:', error);
      }
    }

    // Update date type form with community
    updateFormData(dateTypeUpdate);

    // Load tickets from saved experience
    if (experience.tickets && experience.tickets.length > 0) {
      const savedTickets = experience.tickets.map((ticket: any) => {
        // Extract date and time from ISO datetime strings
        const extractDateTime = (isoString: string | null) => {
          if (!isoString) return { date: null, time: null };
          const date = isoString.split('T')[0];
          const time = isoString.split('T')[1]?.substring(0, 5) ?? null;
          return { date, time };
        };

        const salesStartDateTime = extractDateTime(
          ticket.salesStartDate || ticket.sales_start_date,
        );
        const salesEndDateTime = extractDateTime(ticket.salesEndDate || ticket.sales_end_date);

        // Map API relative validity fields to form format
        let salesEndRelative = null;

        console.log('[Hydration] Ticket:', {
          name: ticket.name,
          ticket_sales_closing_duration: ticket.ticket_sales_closing_duration,
          ticket_sales_closing_unit: ticket.ticket_sales_closing_unit,
          ticket_sales_closing_condition: ticket.ticket_sales_closing_condition,
        });

        if (
          ticket.ticket_sales_closing_duration &&
          ticket.ticket_sales_closing_unit &&
          ticket.ticket_sales_closing_condition
        ) {
          // Convert API format to form format
          let unit: 'hour' | 'day' | 'week' = 'day';
          if (ticket.ticket_sales_closing_unit === 'hours') unit = 'hour';
          else if (ticket.ticket_sales_closing_unit === 'days')
            unit = ticket.ticket_sales_closing_duration > 7 ? 'week' : 'day';
          else if (ticket.ticket_sales_closing_unit === 'minutes') unit = 'hour';

          // Convert days to weeks if divisible by 7
          let amount = ticket.ticket_sales_closing_duration;
          if (unit === 'day' && amount % 7 === 0 && amount > 7) {
            unit = 'week';
            amount = amount / 7;
          }

          const anchor = ticket.ticket_sales_closing_condition === 'before_start' ? 'start' : 'end';

          salesEndRelative = {
            amount,
            unit,
            anchor,
          };

          console.log('[Hydration] Converted to salesEndRelative:', salesEndRelative);
        }

        // For recurring experiences, find the slot index from the slot_template ID
        let slotIndex: number | undefined;
        if (hasRecurrenceRule && (ticket.slot_template || ticket.slotTemplate)) {
          const slotTemplateId = ticket.slot_template || ticket.slotTemplate;
          const records: {
            id: string;
            name?: string;
            startTime: string;
            durationMinutes: number;
          }[] = slotTemplatesResponse?.data?.results ?? [];
          slotIndex = records.findIndex((r) => r.id === slotTemplateId);
          if (slotIndex === -1) slotIndex = undefined; // Not found, leave as undefined
        }

        return {
          id: `ticket-${Date.now()}-${Math.random()}`,
          apiId: ticket.id,
          name: ticket.name,
          quantity: ticket.availableQuantity || ticket.quantity,
          amount: Number(ticket.price),
          salesStartDate: salesStartDateTime.date,
          salesStartTime: salesStartDateTime.time,
          salesEndDate: salesEndDateTime.date,
          salesEndTime: salesEndDateTime.time,
          acceptPartialPayment: false,
          salesStartRelative: null,
          salesEndRelative,
          duplicateForEntirePeriod: false,
          ...(slotIndex !== undefined ? { slotIndex } : {}),
        };
      });
      setFormData((prev) => ({
        ...prev,
        tickets: { ...prev.tickets, items: savedTickets },
      }));
    }
  }, [experience?.id, experienceId, slotTemplatesResponse, updateAboutFormData, updateFormData]);

  // Sync photo IDs after photos are uploaded (replace temp IDs with real IDs)
  useEffect(() => {
    if (!experience?.photos || formData.about.photos.length === 0) {
      return;
    }

    // Check if there are any temp IDs that need to be replaced
    const hasTempIds = formData.about.photos.some((p) => p.isTempId);
    if (!hasTempIds) {
      return;
    }

    // Replace temp IDs with real IDs from the experience photos
    const updatedPhotos = formData.about.photos.map((photo, index) => {
      if (photo.isTempId) {
        // Find the corresponding photo in the experience by order
        const serverPhoto = experience.photos?.find((p: any) => p.order === index);
        if (serverPhoto) {
          return {
            ...photo,
            id: serverPhoto.id,
            isTempId: false,
          };
        }
      }
      return photo;
    });

    // Only update if IDs actually changed
    if (updatedPhotos.some((p, i) => p.id !== formData.about.photos[i].id)) {
      updateAboutFormData({ photos: updatedPhotos });
    }
  }, [experience?.photos, formData.about.photos, updateAboutFormData]);

  const updateWalletFormData = useCallback((data: Partial<FormData['wallet']>) => {
    setFormData((prev) => ({
      ...prev,
      wallet: { ...prev.wallet, ...data },
    }));
  }, []);

  useEffect(() => {
    updateWalletFormData({
      selectedWallet: wallets.find((w) => w.isActive),
      paymentMethod: wallets.find((w) => w.isActive)?.walletType,
    });
  }, [wallets.length]);

  const validateDateType = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.dateType.community) {
      errors.community = 'Community is required';
    }

    if (formData.dateType.experienceType === 'itinerary') {
      if (!formData.dateType.itineraryStartDate) {
        errors.itineraryStartDate = 'Please select a start date';
      }
      if (!formData.dateType.itineraryEndDate) {
        errors.itineraryEndDate = 'Please select an end date';
      }
      if (
        formData.dateType.itineraryStartDate &&
        formData.dateType.itineraryEndDate &&
        formData.dateType.itineraryStartDate > formData.dateType.itineraryEndDate
      ) {
        errors.itineraryEndDate = 'End date must be after start date';
      }
    } else if (formData.dateType.experienceType === 'multi-day') {
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

      if (
        formData.dateType.startTime &&
        formData.dateType.endTime &&
        formData.dateType.startTime >= formData.dateType.endTime
      ) {
        errors.endTime = 'End time must be after start time';
      }
    }

    setDateTypeErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.dateType]);

  const updateTicketsFormData = useCallback((data: Partial<FormData['tickets']>) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        tickets: { ...prev.tickets, ...data },
      };
      return updated;
    });
  }, []);

  const validateAbout = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    console.log('[validateAbout] Starting validation for about form');
    console.log('[validateAbout] formData.about:', formData.about);

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
    console.log('[validateAbout] Errors found:', errors);
    console.log('[validateAbout] Is valid:', Object.keys(errors).length === 0);
    return Object.keys(errors).length === 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.about.title,
    formData.about.description,
    formData.about.location,
    formData.about.photos,
  ]);

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
        if (
          ticket.salesStartDate &&
          ticket.salesEndDate &&
          ticket.salesStartDate > ticket.salesEndDate
        ) {
          errors[`tickets.${index}.salesEndDate`] = 'End date must be after start date';
        }
      } else {
        if (!ticket.salesStartDate) {
          errors[`tickets.${index}.salesStartDate`] = 'Start date is required';
        }
        if (!ticket.salesEndDate) {
          errors[`tickets.${index}.salesEndDate`] = 'End date is required';
        }
        if (
          ticket.salesStartDate &&
          ticket.salesEndDate &&
          ticket.salesStartDate > ticket.salesEndDate
        ) {
          errors[`tickets.${index}.salesEndDate`] = 'End date must be after start date';
        }
      }
    });

    setTicketsErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    formData.dateType.isRecurring,
    formData.dateType.experiencePricing,
    formData.dateType.experienceType,
    formData.tickets.items,
    formData.tickets.ticketMode,
  ]);

  const validateWallet = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!wallets.length && !formData.wallet.selectedWallet && !formData.wallet.phoneNumber) {
      errors.wallet = 'Please set up a payment method before continuing.';
    }
    setWalletErrors(errors);
    return Object.keys(errors).length === 0;
  }, [wallets.length, formData.wallet.selectedWallet, formData.wallet.phoneNumber]);

  const updateInviteFormData = useCallback((data: Partial<FormData['invite']>) => {
    setFormData((prev) => ({
      ...prev,
      invite: { ...prev.invite, ...data },
    }));
  }, []);

  const handleStepChange = useCallback(
    (step: ExperienceStepId) => {
      setActiveStep(step);
      replaceCreateUrlParams({ experienceId, step });
    },
    [experienceId],
  );

  const handleExperienceCreated = useCallback(
    (createdExperienceId: string, step?: ExperienceStepId) => {
      setExperienceId(createdExperienceId);

      if (step) {
        setActiveStep(step);
      }

      replaceCreateUrlParams({ experienceId: createdExperienceId, step });
    },
    [],
  );

  const handleDatesUpdatedSuccess = useCallback((nextStep?: ExperienceStepId) => {
    setHasUpdatedDates(true);

    if (nextStep) {
      setActiveStep(nextStep);
      replaceCreateUrlParams({ step: nextStep });
    }
  }, []);

  const handleItineraryCustomise = useCallback((config: { startDate: string; endDate: string }) => {
    setItineraryConfig(config);
  }, []);

  const handleInvitesChange = useCallback((members: InvitedMember[], communities: Community[]) => {
    setInvitedMembers(members);
    setInvitedCommunities(communities);
  }, []);

  const syncSlotTemplates = async (
    experienceId: string,
    currentSlots: { startTime: string; endTime: string }[],
    recurrenceRule: string | null,
  ): Promise<void> => {
    const { toCreate, toUpdate, toDelete } = diffSlotTemplates(currentSlots, slotTemplateRecords);

    const newRecords = [...slotTemplateRecords];

    // Delete removed slots
    await Promise.all(
      toDelete.map(async (record) => {
        await deleteSlotTemplate(experienceId, record.templateId);
        // Remove from local records
        const idx = newRecords.findIndex((r) => r.templateId === record.templateId);
        if (idx !== -1) newRecords.splice(idx, 1);
      }),
    );

    // Update changed slots
    await Promise.all(
      toUpdate.map(async ({ record, startTime, endTime }) => {
        await updateSlotTemplate(
          experienceId,
          record.templateId,
          buildSlotTemplatePayload({ startTime, endTime }, recurrenceRule),
        );
        // Update local record
        const idx = newRecords.findIndex((r) => r.templateId === record.templateId);
        if (idx !== -1) {
          newRecords[idx] = {
            ...newRecords[idx],
            startTime,
            endTime,
          };
        }
      }),
    );

    // Create new slots
    await Promise.all(
      toCreate.map(async (slot) => {
        const response = await createSlotTemplate(
          experienceId,
          buildSlotTemplatePayload(slot, recurrenceRule),
        );
        newRecords.push({
          uiId: `slot-${Date.now()}-${Math.random()}`,
          templateId: response.data.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }),
    );

    setSlotTemplateRecords(newRecords);
  };

  const handleSaveAbout = useCallback(async () => {
    setIsSavingExperience(true);
    setApiError(null);
    try {
      const photoFiles = formData.about.photos.filter((p) => p.file).map((p) => p.file!);

      // Determine which date/time fields to use based on experience type
      const isMultiDay = formData.dateType.experienceType === 'multi-day';
      const isRecurring = formData.dateType.isRecurring;
      const isItinerary = formData.dateType.experienceType === 'itinerary';

      let startDateValue = '';
      let endDateValue = '';
      let startTime: string | null = null;
      let endTime: string | null = null;

      if (isItinerary) {
        // Itinerary uses its own dedicated date fields (no times)
        startDateValue = formData.dateType.itineraryStartDate || '';
        endDateValue = formData.dateType.itineraryEndDate || '';
        startTime = null;
        endTime = null;
      } else if (isMultiDay) {
        // Multi-day uses its own dedicated date + time fields
        startDateValue = formData.dateType.multiDayStartDate || '';
        endDateValue = formData.dateType.multiDayEndDate || '';
        startTime = formData.dateType.multiDayStartTime || null;
        endTime = formData.dateType.multiDayEndTime || null;
      } else if (isRecurring) {
        // Recurring uses recurrence start/end date range with first time slot
        startDateValue = formData.dateType.recurrenceStartDate || '';
        endDateValue = formData.dateType.recurrenceEndDate || '';
        startTime = formData.dateType.timeSlots?.[0]?.startTime || null;
        endTime = formData.dateType.timeSlots?.[0]?.endTime || null;
      } else {
        // Single-day uses single date with start/end times
        startDateValue = formData.dateType.date || '';
        endDateValue = formData.dateType.date || '';
        startTime = formData.dateType.startTime || null;
        endTime = formData.dateType.endTime || null;
      }

      // Validate that all required date/time fields are populated (skip time validation for itinerary)
      if (!startDateValue || !endDateValue) {
        setApiError('Please set start and end dates before continuing.');
        setIsSavingExperience(false);
        return;
      }

      if (!isItinerary && (!startTime || !endTime)) {
        setApiError(
          'Please set a start date, end date, start time and end time before continuing.',
        );
        setIsSavingExperience(false);
        return;
      }

      const payload = {
        title: formData.about.title,
        description: formData.about.description,
        ...(formData.about.locationPlaceId
          ? { googleMapPlaceId: formData.about.locationPlaceId }
          : {}),
        startDate: formatDateWithTime(startDateValue, startTime),
        endDate: formatDateWithTime(endDateValue, endTime, true),
        recurrence_rule: buildRecurrenceRule(formData.dateType),
        categoriesIds: formData.about.categories.map((c) => c.id),
        isPublic: formData.about.visibility === 'public',
        isPaid: formData.dateType.experiencePricing === 'paid',
        invitedCommunityIds: [],
        invitedGuestsEmails: [],
        hostCommunityId: formData.dateType.community?.id ?? '',
        whatsIncluded: formData.about.whatsIncluded?.trim() || '',
        whatsNotIncluded: formData.about.whatsNotIncluded?.trim() || '',
        feesAllocation: mapCommission(formData.tickets.commission),
        meetingPlace: formData.about.meetingPoint?.trim() || null,
        meetingTime: formData.about.meetingTime?.trim() || null,
        ...(isItinerary && {
          experienceType: 'itinerary',
        }),
      };

      if (experienceId) {
        console.log('[handleSaveAbout] Calling updateExperienceAsync with payload:', payload);
        await updateExperienceAsync(payload);
        console.log('[handleSaveAbout] updateExperienceAsync completed');

        // Upload photos separately if present
        if (photoFiles && photoFiles.length > 0) {
          try {
            console.log(
              '[handleSaveAbout] Uploading',
              photoFiles.length,
              'photos to experience',
              experienceId,
            );
            const photoResponse = await addExperiencePhotos(experienceId, photoFiles);
            console.log('[handleSaveAbout] Photos uploaded successfully, response:', photoResponse);
          } catch (photoError: any) {
            console.error('[handleSaveAbout] Photo upload failed:', photoError);
            toast({
              title: 'Warning',
              description: 'Photos failed to upload. You can add them again from the review page.',
              variant: 'default',
            });
          }
        }

        // Sync slot templates for recurring experiences
        if (formData.dateType.isRecurring) {
          const validSlots = (formData.dateType.timeSlots ?? []).filter(
            (s) => s.startTime && s.endTime,
          ) as { startTime: string; endTime: string }[];

          if (validSlots.length > 0 || slotTemplateRecords.length > 0) {
            try {
              await syncSlotTemplates(
                experienceId,
                validSlots,
                buildRecurrenceRule(formData.dateType),
              );
            } catch (slotError) {
              console.error('[handleSaveAbout] Slot sync failed:', slotError);
              toast({
                description:
                  'Experience saved but time slots failed to update. Please try editing them again.',
                variant: 'default',
              });
              // Non-blocking — experience was already saved
            }
          }
        }
      } else {
        const response = await createExperienceAsync(payload);
        const newExperienceId = response.data?.id || '';

        if (!newExperienceId) {
          throw new Error('Failed to create experience: No ID returned from server');
        }

        // Upload photos separately if present
        if (photoFiles && photoFiles.length > 0) {
          try {
            await addExperiencePhotos(newExperienceId, photoFiles);
          } catch (photoError: any) {
            console.error('[handleSaveAbout] Photo upload failed:', photoError);
            toast({
              title: 'Warning',
              description:
                'Experience saved but photos failed to upload. You can add them again from the review page.',
              variant: 'default',
            });
            // Don't block advancement - experience was already created
          }
        }

        // Create slot templates for recurring experiences
        if (formData.dateType.isRecurring) {
          const timeSlots = (formData.dateType.timeSlots ?? []).filter(
            (slot) => slot.startTime !== null && slot.endTime !== null,
          ) as { startTime: string; endTime: string }[];

          if (timeSlots.length > 0) {
            try {
              const slotResults = await Promise.all(
                timeSlots.map((slot, index) =>
                  createSlotTemplate(
                    newExperienceId,
                    buildSlotTemplatePayload(slot, formData.dateType.recurrenceRule ?? null),
                  ),
                ),
              );

              const records: SlotTemplateRecord[] = timeSlots.map((slot, i) => ({
                uiId: `slot-${i}`,
                templateId: slotResults[i].data.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
              }));
            } catch (slotError) {
              console.error('[handleSaveAbout] Slot template creation failed:', slotError);
              toast({
                description:
                  'Experience saved but time slots failed to save. You can re-add them later.',
                variant: 'default',
              });
              // Non-blocking — experience was already created
            }
          }
        }

        handleExperienceCreated(newExperienceId, 'dates-tickets');
      }

      setActiveStep('dates-tickets');
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
  }, [
    formData.about,
    formData.dateType,
    experienceId,
    createExperienceAsync,
    updateExperienceAsync,
    toast,
  ]);

  const handleAddPhotos = useCallback(
    async (photos: File[]) => {
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
    },
    [experienceId, addPhotosAsync, toast],
  );

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
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
    },
    [experienceId, deletePhotoAsync, toast],
  );

  const handleAddGuest = useCallback(
    async (guestEmail: string) => {
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
    },
    [experienceId, addGuestAsync, toast],
  );

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

  const handleUpdateFeesAllocation = useCallback(async () => {
    if (!experienceId || !experience) {
      return;
    }

    try {
      const payload = {
        title: experience.title,
        description: experience.description,
        ...(experience.location?.googleMapPlaceId
          ? { googleMapPlaceId: experience.location.googleMapPlaceId }
          : {}),
        startDate: experience.startDate,
        endDate: experience.endDate,
        recurrence_rule: '',
        categoriesIds: experience.categories?.map((c: any) => c.id) || [],
        isPublic: experience.isPublic,
        isPaid: experience.isPaid,
        invitedCommunityIds: [],
        invitedGuestsEmails: [],
        hostCommunityId: experience.hostCommunity?.id || '',
        whatsIncluded: experience.whatsIncluded || '',
        whatsNotIncluded: experience.whatsNotIncluded || '',
        feesAllocation: mapCommission(formData.tickets.commission),
        meetingPlace: experience.meetingPoint || null,
        meetingTime: experience.meetingTime || null,
      };

      await updateExperienceAsync(payload);
    } catch (error: any) {
      console.warn('[handleUpdateFeesAllocation] Failed to update fees allocation:', error);
    }
  }, [experienceId, experience, formData.tickets.commission, updateExperienceAsync]);

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

    slotTemplateRecords,

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
      handleUpdateFeesAllocation,
    },
  };
};
