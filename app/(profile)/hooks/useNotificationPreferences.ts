'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchEmailPreferences, updateEmailPreferences } from '@/services/comm';
import { NotificationPreferences } from '@/types/notification';

export const useNotificationPreferences = (enabled = true) =>
  useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => fetchEmailPreferences(),
    enabled,
  });

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<Omit<NotificationPreferences, 'id' | 'email'>> }) =>
      updateEmailPreferences(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
};
