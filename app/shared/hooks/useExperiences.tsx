import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CreateSlotTemplateData,
  ExperiencesQueryParams,
  addExperiencePhotos,
  addGuestToExperience,
  bookmarkExperience,
  createExperience,
  createExperienceTicket,
  createSlotTemplate,
  deleteExperiencePhoto,
  deleteExperienceTicket,
  deleteSlotTemplate,
  fetchExperience,
  fetchExperiences,
  publishExperience,
  purchaseExperienceTicket,
  searchUsers,
  updateExperience,
  updateExperienceTicket,
} from '@/services/experience';
import { CreateExperience, CreateExperienceTicket } from '@/types/experience';
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
    mutationFn: async (data: CreateExperience) => await updateExperience(id, data),
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

export const useCreateSlotTemplate = (experienceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createSlotTemplate', experienceId],
    mutationFn: async (data: CreateSlotTemplateData) =>
      await createSlotTemplate(experienceId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] });
    },
  });
};

export const useDeleteSlotTemplate = (experienceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteSlotTemplate', experienceId],
    mutationFn: async (templateId: string) => await deleteSlotTemplate(experienceId, templateId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] });
    },
  });
};
