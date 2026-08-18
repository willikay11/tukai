import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  ExperiencesQueryParams,
  SlotTemplatePayload,
  TicketPurchasePayload,
  addExperiencePhotos,
  addGuestToExperience,
  bookmarkExperience,
  createExperience,
  createExperienceTicket,
  createItineraryDay,
  createSlotTemplate,
  deleteExperiencePhoto,
  deleteExperienceTicket,
  deleteItineraryDay,
  deleteSlotTemplate,
  fetchExperience,
  fetchExperienceOccurrences,
  fetchExperiences,
  fetchItineraryDays,
  fetchSlotTemplates,
  fetchTicketPurchases,
  publishExperience,
  purchaseExperienceTicket,
  purchaseExperienceTicketV2,
  searchUsers,
  updateExperience,
  updateExperienceTicket,
  updateItineraryDay,
  updateSlotTemplate,
} from '@/services/experience';
import { CreateExperience, CreateExperienceTicket } from '@/types/experience';
import { ItineraryDayPayload } from '@/types/itinerary';
import { PurchaserDetails } from '@/types/purchaser';

export const useExperiences = (params: ExperiencesQueryParams, enabled: boolean) => {
  return useQuery({
    queryKey: [
      'experiences',
      params.page,
      params.page_size,
      params.reserved_by,
      params.category,
      params.invited,
      params.date,
      params.bookmarked,
      params.hosted_by,
      params.search,
      // Without this, two calls differing only by status share a cache entry
      // and serve each other's results
      params.status,
    ],
    queryFn: async () => await fetchExperiences(params),
    enabled: enabled,
  });
};

export const useFetchSingleExperience = (id: string, withAuth: boolean = false) => {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: async () => await fetchExperience(id, withAuth),
    enabled: !!id,
  });
};

export const usePurchaseExperienceTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PurchaserDetails) => await purchaseExperienceTicket(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};

export const usePurchaseExperienceTicketV2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TicketPurchasePayload) => await purchaseExperienceTicketV2(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};

export const useFetchExperienceOccurrences = (experienceId: string | null) =>
  useQuery({
    queryKey: ['experience-occurrences', experienceId],
    queryFn: () => fetchExperienceOccurrences(experienceId!),
    enabled: !!experienceId,
  });

export const useTicketPurchases = (userId: string | undefined, enabled: boolean = true) =>
  useQuery({
    queryKey: ['ticket-purchases', userId],
    queryFn: () => fetchTicketPurchases({ user: userId!, page_size: 100 }),
    enabled: enabled && !!userId,
  });

// Host-facing counterpart of useTicketPurchases: every purchase made against
// one experience, which is what the creator's Sales tab lists
export const useExperienceTicketPurchases = (
  experienceId: string | undefined,
  enabled: boolean = true,
) =>
  useQuery({
    queryKey: ['ticket-purchases', 'experience', experienceId],
    queryFn: () => fetchTicketPurchases({ ticket__experience: experienceId!, page_size: 100 }),
    enabled: enabled && !!experienceId,
  });

export const useBookmarkExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => await bookmarkExperience(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};

export const useCreateExperience = () => {
  return useMutation({
    mutationKey: ['createExperience'],
    mutationFn: async (data: CreateExperience) => await createExperience(data),
  });
};

export const useUpdateExperience = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateExperience', id],
    mutationFn: async (data: Partial<CreateExperience>) => await updateExperience(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', id] });
    },
  });
};

export const useCreateExperienceTicket = (experienceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createExperienceTicket', experienceId],
    mutationFn: async (data: CreateExperienceTicket) =>
      await createExperienceTicket(experienceId, data),
    onSettled: () => {
      // Invalidate experience query to refetch updated experience details
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] });
    },
  });
};

export const useUpdateExperienceTicket = (experienceId: string, ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateExperienceTicket', experienceId, ticketId],
    mutationFn: async (data: CreateExperienceTicket) =>
      await updateExperienceTicket(experienceId, ticketId, data),
    onSettled: () => {
      // Invalidate experience query to refetch updated experience details
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] });
    },
  });
};

export const useDeleteExperienceTicket = (experienceId: string, ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteExperienceTicket', experienceId, ticketId],
    mutationFn: async () => await deleteExperienceTicket(experienceId, ticketId),
    onSettled: () => {
      // Invalidate experience query to refetch updated experience details
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] });
    },
  });
};

export const useAddGuestToExperience = (experienceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['addGuestToExperience', experienceId],
    mutationFn: async (guestEmail: string) => await addGuestToExperience(experienceId, guestEmail),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] });
    },
  });
};

export const usePublishExperience = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['publishExperience', id],
    mutationFn: async () => await publishExperience(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', id] });
    },
  });
};

export const useAddExperiencePhotos = (experienceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['addExperiencePhotos', experienceId],
    mutationFn: async (photos: File[]) => await addExperiencePhotos(experienceId, photos),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] });
    },
  });
};

export const useDeleteExperiencePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteExperiencePhoto'],
    mutationFn: async (photoId: string) => await deleteExperiencePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};

export const useSearchUsers = () => {
  return useQuery({
    queryKey: ['searchUsers'],
    queryFn: async () => {
      return { data: [] };
    },
    enabled: false,
  });
};

export const useSearchUsersDebounced = () => {
  return useMutation({
    mutationFn: async (query: string) => await searchUsers(query),
  });
};

export const useCreateSlotTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ experienceId, data }: { experienceId: string; data: SlotTemplatePayload }) =>
      createSlotTemplate(experienceId, data),
    onSuccess: (_, { experienceId }) => {
      queryClient.invalidateQueries({
        queryKey: ['slot-templates', experienceId],
      });
    },
  });
};

export const useFetchSlotTemplates = (experienceId: string | null) =>
  useQuery({
    queryKey: ['slot-templates', experienceId],
    queryFn: () => fetchSlotTemplates(experienceId!),
    enabled: !!experienceId,
  });

export const useUpdateSlotTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      experienceId,
      templateId,
      data,
    }: {
      experienceId: string;
      templateId: string;
      data: Partial<SlotTemplatePayload>;
    }) => updateSlotTemplate(experienceId, templateId, data),
    onSuccess: (_, { experienceId }) => {
      queryClient.invalidateQueries({
        queryKey: ['slot-templates', experienceId],
      });
    },
  });
};

export const useDeleteSlotTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ experienceId, templateId }: { experienceId: string; templateId: string }) =>
      deleteSlotTemplate(experienceId, templateId),
    onSuccess: (_, { experienceId }) => {
      queryClient.invalidateQueries({
        queryKey: ['slot-templates', experienceId],
      });
    },
  });
};

export const useCreateItineraryDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ experienceId, data }: { experienceId: string; data: ItineraryDayPayload[] }) =>
      createItineraryDay(experienceId, data),
    onSuccess: (_, { experienceId }) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary-days', experienceId],
      });
    },
  });
};

export const useUpdateItineraryDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      experienceId,
      data,
    }: {
      experienceId: string;
      data: Partial<ItineraryDayPayload[]>;
    }) => updateItineraryDay(experienceId, data),
    onSuccess: (_, { experienceId }) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary-days', experienceId],
      });
    },
  });
};

export const useDeleteItineraryDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ experienceId, dayId }: { experienceId: string; dayId: string }) =>
      deleteItineraryDay(experienceId, dayId),
    onSuccess: (_, { experienceId }) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary-days', experienceId],
      });
    },
  });
};

export const useFetchItineraryDays = (experienceId: string | null) =>
  useQuery({
    queryKey: ['itinerary-days', experienceId],
    queryFn: () => fetchItineraryDays(experienceId!),
    enabled: !!experienceId,
  });
