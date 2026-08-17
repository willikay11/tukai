import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import moment from 'moment';
import { RRule } from 'rrule';
import { v4 as uuidv4 } from 'uuid';

import { buildRecurrenceRule } from '@/app/(experiences)/experiences/create/utils/buildRecurrenceRule';
import {
  buildPreviewExperience,
  mapGeocodeResultToLocation,
} from '@/app/(experiences)/experiences/create/utils/preview-utils';
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
  useFetchItineraryDays,
  useFetchSingleExperience,
  useFetchSlotTemplates,
  usePublishExperience,
  useUpdateExperience,
} from '@/app/shared/hooks/useExperiences';
import { useGoogleMapsPlaceGeocode } from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { InvitedMember } from '@/components/ui/invite-members';
import {
  addExperiencePhotos,
  bulkUpdateItineraryDays,
  createItineraryDay,
  createSlotTemplate,
  deleteItineraryDay,
  deleteSlotTemplate,
  fetchItineraryDays,
  fetchSlotTemplates,
  updateSlotTemplate,
} from '@/services/experience';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Interest } from '@/types/interest';
import { ItineraryDayFormValue } from '@/types/itinerary';
import { Wallet } from '@/types/payment';
import { Photo } from '@/types/photo';
import { getDaysBetween, inferUIExperienceType } from '@/utils/date-utils';
import { parseApiError } from '@/utils/parseApiError';
import {
  SlotTemplateRecord,
  buildSlotTemplatePayload,
  calculateEndTime,
  diffSlotTemplates,
} from '@/utils/slot-template-utils';
import { parseSalesEndRelativeFromTicket } from '@/utils/ticket-utils';

export type ExperienceStepId =
  | 'dates-type'
  | 'about'
  | 'itinerary-days'
  | 'tickets'
  | 'guests'
  | 'wallet'
  | 'preview';

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
    'dates-type',
    'about',
    'itinerary-days',
    'tickets',
    'guests',
    'wallet',
    'preview',
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
    placeId: string | null;
    placeImageUrl: string | null;
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
      // Which recurring time slot the ticket belongs to. Set at save time for
      // recurring experiences only, so it stays optional.
      slotIndex?: number;
      // Which day of a multi-day run the ticket belongs to, in "each day" mode
      dayIndex?: number;
    }>;
  };
  invite: {
    invitedGuests: Experience['guests'];
    invitedCommunityIds: string[];
    // The invited communities themselves, kept alongside their ids. The invite
    // step lists communities the user follows while the rest of the flow knows
    // only the ones they created, so the preview cannot look these up by id.
    invitedCommunities: CommunityOption[];
  };
  wallet: {
    paymentMethod: 'phone' | 'bank';
    selectedWallet?: Wallet;
    phoneNumber: string;
  };
  itineraryDays: ItineraryDayFormValue[];
}

const generateItineraryDays = (startDate: string, endDate: string): ItineraryDayFormValue[] => {
  const days = getDaysBetween(startDate, endDate);
  return days.map((_, index) => ({
    id: uuidv4(),
    dayNumber: index + 1,
    title: '',
    description: '',
    activities: [],
  }));
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
    placeId: null,
    placeImageUrl: null,
    meetingPoint: '',
    meetingTime: null,
    categories: [],
  },
  tickets: {
    commission: 'host',
    // Matches the mode MultiDayTicketModePicker shows selected on first render.
    // Leaving this null made multi-day validation fail against a picker that
    // already looked answered.
    ticketMode: 'entire-period',
    items: [],
  },
  invite: {
    invitedGuests: [],
    invitedCommunityIds: [],
    invitedCommunities: [],
  },
  wallet: {
    selectedWallet: undefined,
    paymentMethod: 'phone',
    phoneNumber: '',
  },
  itineraryDays: [],
};

interface UseCreateExperienceFlowOptions {
  // The wizard requires a community; the listing that precedes it does not
  enforceCommunityGuard?: boolean;
}

export const useCreateExperienceFlow = ({
  enforceCommunityGuard = true,
}: UseCreateExperienceFlowOptions = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const currentUserId = session?.user?.id ?? undefined;
  const experienceIdFromUrl = searchParams.get('experienceId');
  const stepFromUrl = parseExperienceStepId(searchParams.get('step'));

  const [activeStep, setActiveStep] = useState<ExperienceStepId>(stepFromUrl || 'dates-type');
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
  const {
    data: slotTemplatesResponse,
    isLoading: isLoadingSlotTemplates,
    isFetching: isFetchingSlotTemplates,
  } = useFetchSlotTemplates(experienceId);

  // Itinerary days hooks
  const { data: itineraryDaysResponse, isLoading: isLoadingItineraryDays } =
    useFetchItineraryDays(experienceId);

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

  // Track pending debounced saves in ItineraryDayPill components
  const pendingFlushersRef = useRef<Map<string, () => { title?: string; description?: string }>>(
    new Map(),
  );

  const registerFlusher = useCallback(
    (dayId: string, flusher: () => { title?: string; description?: string }) => {
      pendingFlushersRef.current.set(dayId, flusher);
      return () => {
        pendingFlushersRef.current.delete(dayId);
      };
    },
    [],
  );

  const flushAllPendingSaves = useCallback((): Record<
    string,
    { title?: string; description?: string }
  > => {
    const flushed: Record<string, { title?: string; description?: string }> = {};
    pendingFlushersRef.current.forEach((fn, dayId) => {
      flushed[dayId] = fn();
    });
    return flushed;
  }, []);

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

  // Guard: Redirect to communities/create if no community.
  // Disabled while the pre-wizard listing is showing — that screen is visible
  // to every creator, and only proceeding into the wizard requires a community.
  useEffect(() => {
    if (!enforceCommunityGuard) {
      return;
    }

    if (sessionStatus !== 'authenticated' || isLoadingCreatedCommunities) {
      return;
    }

    if (!hasCreatedCommunity) {
      router.replace('/communities/create');
    }
  }, [
    enforceCommunityGuard,
    hasCreatedCommunity,
    isLoadingCreatedCommunities,
    router,
    sessionStatus,
  ]);

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

    // For recurring experiences, time slots are hydrated from the slot-templates
    // query. With staleTime: 0 the query serves a (possibly incomplete) cached
    // result immediately and refetches in the background, so committing here too
    // early drops slots. Wait until the query has settled to fresh data before
    // marking hydration done — the effect re-runs when isFetching flips to false.
    if (!!experience.recurrenceRule && (isLoadingSlotTemplates || isFetchingSlotTemplates)) {
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
      location:
        experience.place?.title ??
        (experience.location?.formattedAddress || experience.location?.city || ''),
      locationPlaceId: experience.location?.googleMapPlaceId ?? '',
      placeId: experience.place?.id ?? null,
      placeImageUrl:
        experience.place?.photos?.find((photo: Photo) => photo.isCover)?.photo ??
        experience.place?.photos?.[0]?.photo ??
        null,
      meetingPoint: experience.meetingPlace || '',
      meetingTime: experience.meetingTime || null,
      whatsIncluded: experience.whatsIncluded ?? '',
      whatsNotIncluded: experience.whatsNotIncluded ?? '',
    });

    // Check if experience is recurring and parse recurrence rule
    const hasRecurrenceRule = !!experience.recurrenceRule;

    // Infer the UI experience type from API response and dates
    const apiExperienceType = experience.experienceType;
    const uiExperienceType = inferUIExperienceType(
      apiExperienceType,
      experience.startDate ?? null,
      experience.endDate ?? null,
      hasRecurrenceRule,
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

    // For itinerary experiences, populate the itinerary date fields
    if (uiExperienceType === 'itinerary') {
      const endDate = experience.endDate?.split('T')[0];
      dateTypeUpdate.itineraryStartDate = startDate;
      dateTypeUpdate.itineraryEndDate = endDate;
    }

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

        // Map API relative validity fields to form format. The experience is
        // fetched through parseSnakeToCamel, so the fields arrive camelCased;
        // keep the snake_case names as a fallback for any un-transformed payload.
        const salesEndRelative = parseSalesEndRelativeFromTicket(
          ticket.ticketSalesClosingDuration ?? ticket.ticket_sales_closing_duration,
          ticket.ticketSalesClosingUnit ?? ticket.ticket_sales_closing_unit,
          ticket.ticketSalesClosingCondition ?? ticket.ticket_sales_closing_condition,
        );

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
  }, [
    experience?.id,
    experienceId,
    slotTemplatesResponse,
    isLoadingSlotTemplates,
    isFetchingSlotTemplates,
    updateAboutFormData,
    updateFormData,
  ]);

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

  // Hydrate itinerary days from API when loading a draft itinerary experience
  useEffect(() => {
    if (
      formData.dateType.experienceType === 'itinerary' &&
      itineraryDaysResponse?.data &&
      experienceId
    ) {
      const apiDays = itineraryDaysResponse.data.results || [];

      if (apiDays.length > 0) {
        const hydrationDays: ItineraryDayFormValue[] = apiDays.map((day: any, index: number) => ({
          id: uuidv4(),
          apiId: day.id,
          dayNumber: index + 1,
          title: day.title || '',
          description: day.description || '',
          activities: (day.activities ?? []).map((a: any) => ({
            id: uuidv4(),
            activityApiId: a.id,
            title: a.title ?? '',
            description: a.description ?? '',
            // The API nests the rich place object under `place`; `location`
            // is only the location uuid
            placeId: a.place?.id ?? null,
            placeName: a.place?.title ?? null,
            placeImageUrl:
              a.place?.photos?.find((photo: any) => photo.isCover)?.photo ??
              a.place?.photos?.[0]?.photo ??
              null,
            placeCity: a.place?.location?.city ?? null,
            locationId:
              (typeof a.location === 'string' ? a.location : a.location?.id) ??
              a.place?.location?.id ??
              null,
            startTime: a.startTime ?? null,
            endTime: a.endTime ?? null,
          })),
        }));

        updateItineraryDays(hydrationDays);
      }
    }
  }, [
    itineraryDaysResponse?.data?.results?.length,
    experienceId,
    formData.dateType.experienceType,
  ]);

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

  // ─── Preview step ────────────────────────────────────────────────────────
  // The form stores only a Google place id for the location; the detail view
  // renders a map, so resolve coordinates when the preview is actually open
  const { data: geocodeResponse } = useGoogleMapsPlaceGeocode(
    formData.about.locationPlaceId || null,
    activeStep === 'preview',
  );

  const geocodedLocation = useMemo(
    () => mapGeocodeResultToLocation(geocodeResponse?.data),
    [geocodeResponse?.data],
  );

  // Derived from formData, so editing any earlier step and returning to the
  // Preview step shows the change without a refetch
  const previewExperience = useMemo(
    () =>
      buildPreviewExperience(formData, {
        experienceId,
        hostCommunity: formData.dateType.community,
        currentUser: session?.user,
        geocodedLocation,
      }),
    [formData, experienceId, session?.user, geocodedLocation],
  );

  const updateItineraryDays = useCallback((days: ItineraryDayFormValue[]) => {
    setFormData((prev) => ({
      ...prev,
      itineraryDays: days,
    }));
  }, []);

  // Generate itinerary days when start/end dates change
  // useEffect(() => {
  //   if (
  //     formData.dateType.experienceType === 'itinerary' &&
  //     formData.dateType.itineraryStartDate &&
  //     formData.dateType.itineraryEndDate
  //   ) {
  //     const days = generateItineraryDays(
  //       formData.dateType.itineraryStartDate,
  //       formData.dateType.itineraryEndDate,
  //     );
  //     // Only regenerate if day count changed
  //     if (days.length !== formData.itineraryDays.length) {
  //       updateItineraryDays(days);
  //     }
  //   }
  // }, [
  //   formData.dateType.itineraryStartDate,
  //   formData.dateType.itineraryEndDate,
  //   formData.dateType.experienceType,
  //   formData.itineraryDays.length,
  //   updateItineraryDays,
  // ]);

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

      // Only meaningful on a single day — across days an earlier end time is fine
      if (
        formData.dateType.multiDayStartDate &&
        formData.dateType.multiDayStartDate === formData.dateType.multiDayEndDate &&
        formData.dateType.multiDayStartTime &&
        formData.dateType.multiDayEndTime &&
        formData.dateType.multiDayStartTime >= formData.dateType.multiDayEndTime
      ) {
        errors.multiDayEndTime = 'End time must be after start time';
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

      // Ticket sales validity is hidden in TicketForm for now, so a host can
      // reach this step with nothing to check — restore alongside that section.
      //
      // if (formData.dateType.isRecurring) {
      //   // Recurring tickets only capture a sales-closing (end) validity — there is
      //   // no start-relative field in the form or the API payload, so don't require it.
      //   if (!ticket.salesEndRelative) {
      //     errors[`tickets.${index}.salesEndRelative`] = 'Sales end validity is required';
      //   }
      // } else if (formData.dateType.experienceType === 'multi-day') {
      //   if (!ticket.salesStartDate) {
      //     errors[`tickets.${index}.salesStartDate`] = 'Start date is required';
      //   }
      //   if (!ticket.salesEndDate) {
      //     errors[`tickets.${index}.salesEndDate`] = 'End date is required';
      //   }
      //   if (
      //     ticket.salesStartDate &&
      //     ticket.salesEndDate &&
      //     ticket.salesStartDate > ticket.salesEndDate
      //   ) {
      //     errors[`tickets.${index}.salesEndDate`] = 'End date must be after start date';
      //   }
      // } else {
      //   if (!ticket.salesStartDate) {
      //     errors[`tickets.${index}.salesStartDate`] = 'Start date is required';
      //   }
      //   if (!ticket.salesEndDate) {
      //     errors[`tickets.${index}.salesEndDate`] = 'End date is required';
      //   }
      //   if (
      //     ticket.salesStartDate &&
      //     ticket.salesEndDate &&
      //     ticket.salesStartDate > ticket.salesEndDate
      //   ) {
      //     errors[`tickets.${index}.salesEndDate`] = 'End date must be after start date';
      //   }
      // }
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

  const createItineraryDaysForExperience = async (
    experienceId: string,
    startDate: string,
    endDate: string,
  ): Promise<void> => {
    const days = getDaysBetween(startDate, endDate);

    // Create the itinerary days
    await createItineraryDay(
      experienceId,
      days.map((_, index) => ({
        day_number: index + 1,
        title: '',
        description: '',
      })),
    );

    // Fetch the created days from GET to get the API IDs
    const fetchResponse = await fetchItineraryDays(experienceId);
    const apiDays = fetchResponse.data?.results || [];

    // Map API response to form state with correct apiIds.
    // fetchItineraryDays camel-cases the response, so day_number arrives as
    // dayNumber — reading only the snake key left dayNumber undefined, which
    // cascaded into Invalid Date crashes in the itinerary preview
    const itineraryDays: ItineraryDayFormValue[] = apiDays.map((day: any, index: number) => ({
      id: uuidv4(),
      apiId: day.id,
      dayNumber: day.dayNumber ?? day.day_number ?? index + 1,
      title: day.title || '',
      description: day.description || '',
      activities: [],
      placeId: null,
      placeName: null,
    }));

    updateItineraryDays(itineraryDays);
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
        return false;
      }

      if (!isItinerary && (!startTime || !endTime)) {
        setApiError(
          'Please set a start date, end date, start time and end time before continuing.',
        );
        setIsSavingExperience(false);
        return false;
      }

      const basePayload = {
        title: formData.about.title,
        description: formData.about.description,
        ...(formData.about.placeId
          ? { placeId: formData.about.placeId }
          : formData.about.locationPlaceId
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
      };

      const payload = isItinerary
        ? {
            ...basePayload,
            experienceType: 'itinerary' as const,
            itineraryMode: 'fixed' as const, // this should be removed when the API is updated
            itineraryDurationDays: moment(endDateValue).diff(moment(startDateValue), 'days') + 1,
          }
        : basePayload;

      console.log('[handleSaveAbout] Prepared payload for API:', payload);

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
                timeSlots.map((slot) =>
                  createSlotTemplate(
                    newExperienceId,
                    buildSlotTemplatePayload(slot, buildRecurrenceRule(formData.dateType)),
                  ),
                ),
              );

              // Store the created records so later syncs can diff against them
              setSlotTemplateRecords(
                timeSlots.map((slot, i) => ({
                  uiId: `slot-${i}`,
                  templateId: slotResults[i].data.id,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })),
              );
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

        // Create itinerary days for itinerary experiences
        if (isItinerary) {
          const startDate = formData.dateType.itineraryStartDate;
          const endDate = formData.dateType.itineraryEndDate;

          // Only create if days don't already have apiIds (first time creation)
          const alreadyHasDays = formData.itineraryDays.some((d) => d.apiId != null);

          if (startDate && endDate && !alreadyHasDays) {
            try {
              await createItineraryDaysForExperience(newExperienceId, startDate, endDate);
            } catch (error) {
              // Non-blocking — experience already created
              // User can still proceed and add days later
              console.error('[handleSaveAbout] Itinerary days creation failed:', error);
              toast({
                description:
                  'Experience saved but itinerary days failed to create. You can add them in the next step.',
                variant: 'default',
              });
            }
          }
        }

        const nextStep = isItinerary ? 'itinerary-days' : 'tickets';

        handleExperienceCreated(newExperienceId, nextStep);
      }

      const nextStep =
        formData.dateType.experienceType === 'itinerary' ? 'itinerary-days' : 'tickets';

      setActiveStep(nextStep);
      return true;
    } catch (error: any) {
      const message = parseApiError(error, 'Failed to save experience');
      setApiError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('[handleSaveAbout] Error:', error);
      return false;
    } finally {
      setIsSavingExperience(false);
    }
  }, [
    formData.about,
    formData.dateType,
    formData.itineraryDays,
    formData.tickets.commission,
    experienceId,
    createExperienceAsync,
    updateExperienceAsync,
    handleExperienceCreated,
    syncSlotTemplates,
    slotTemplateRecords,
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

  const handleSaveItineraryDays = useCallback(async () => {
    if (!experienceId) return;

    setIsSavingExperience(true);
    try {
      // Flush all pending debounced saves synchronously before making API calls
      const flushed = flushAllPendingSaves();

      // Merge flushed values into the days
      const daysWithLatestData = formData.itineraryDays.map((day) => {
        const pending = day.apiId ? flushed[day.apiId] : undefined;
        return {
          ...day,
          title: pending?.title ?? day.title,
          description: pending?.description ?? day.description,
        };
      });

      const daysToBeCreated = daysWithLatestData.filter((day) => !day.apiId);
      const daysToBeUpdated = daysWithLatestData.filter((day) => day.apiId != null);

      // POST new days one by one
      const createdDays = await Promise.all(
        daysToBeCreated.map(async (day) => {
          const response = await createItineraryDay(experienceId, {
            day_number: day.dayNumber,
            title: day.title,
            description: day.description,
          });
          return {
            ...day,
            apiId: response.data.id,
          };
        }),
      );

      // Bulk PATCH existing days with correct payload shape (array of objects with id field)
      if (daysToBeUpdated.length > 0) {
        await bulkUpdateItineraryDays(
          experienceId,
          daysToBeUpdated.map((day) => ({
            id: day.apiId!,
            day_number: day.dayNumber,
            title: day.title,
            description: day.description,
          })),
        );
      }

      // Update formData with any new apiIds and latest values
      updateItineraryDays(
        [...createdDays, ...daysToBeUpdated].sort((a, b) => a.dayNumber - b.dayNumber),
      );

      // Advance to tickets step
      handleStepChange('tickets');
      return true;
    } catch (error: any) {
      const message = parseApiError(error, 'Failed to save itinerary days');
      setApiError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSavingExperience(false);
    }
  }, [
    experienceId,
    formData.itineraryDays,
    handleStepChange,
    toast,
    flushAllPendingSaves,
    updateItineraryDays,
  ]);

  const handleDeleteItineraryDay = useCallback(
    async (dayId: string): Promise<boolean> => {
      const day = formData.itineraryDays.find((d) => d.id === dayId);
      if (!day) return false;

      const remainingDays = formData.itineraryDays
        .filter((d) => d.id !== dayId)
        .map((d, index) => ({ ...d, dayNumber: index + 1 }));

      // Days that were never persisted only exist in form state
      if (!day.apiId) {
        updateItineraryDays(remainingDays);
        return true;
      }

      // A saved day with no experience to delete it from is not recoverable
      // here; dropping it locally would orphan the row
      if (!experienceId) {
        console.error('[handleDeleteItineraryDay] Missing experienceId for a persisted day');
        return false;
      }

      setApiError(null);
      try {
        await deleteItineraryDay(experienceId, day.apiId);

        // The renumbering has to land after the delete — patching survivors
        // first would push a day_number onto the value the doomed row still
        // holds, which the API rejects as a duplicate
        const persistedDays = remainingDays.filter((d) => d.apiId);
        if (persistedDays.length > 0) {
          await bulkUpdateItineraryDays(
            experienceId,
            persistedDays.map((d) => ({
              id: d.apiId,
              day_number: d.dayNumber,
              title: d.title,
              description: d.description,
            })),
          );
        }

        updateItineraryDays(remainingDays);
        return true;
      } catch (error: any) {
        const message = parseApiError(error, 'Failed to delete day');
        setApiError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        return false;
      }
    },
    [experienceId, formData.itineraryDays, updateItineraryDays, toast],
  );

  // Resolves true so the Preview step knows to show the success modal
  const handlePublish = useCallback(async (): Promise<boolean> => {
    setIsSavingExperience(true);
    setApiError(null);
    try {
      if (!experienceId) {
        throw new Error('Experience ID is required to publish');
      }
      await publishAsync();
      return true;
    } catch (error: any) {
      const message = parseApiError(error, 'Failed to publish experience');
      setApiError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('[handlePublish] Error:', error);
      return false;
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
    updateItineraryDays,
    validateDateType,
    validateAbout,
    validateTickets,

    // Wallet state and mutations
    wallets,
    isWalletsLoading,
    hasSavedWallets,
    walletErrors,
    validateWallet,
    updateWalletFormData,
    isSavingExperience,
    apiError,

    // Itinerary flusher for syncing pending saves
    registerFlusher,

    // Form-derived Experience for the Preview step
    previewExperience,

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
      handleSaveItineraryDays,
      handleDeleteItineraryDay,
      handleAddPhotos,
      handleDeletePhoto,
      handleAddGuest,
      handlePublish,
      handleUpdateFeesAllocation,
    },
  };
};
