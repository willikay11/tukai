import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteConversation, fetchMessages, markMessageRead, sendMessage } from '@/services/comm';

const MESSAGES = ['messages'];

/**
 * Every message the reader is party to. One query, because the API has no
 * threads - the conversations are grouped from this list.
 */
export const useMessages = (enabled = true) =>
  useQuery({
    queryKey: MESSAGES,
    queryFn: async () => await fetchMessages({ page: 1, page_size: 200 }),
    enabled,
  });

/**
 * Sending to one person.
 *
 * The one place a message is sent from, so the conversation composer and the
 * dialog on a host's page cannot drift apart.
 */
export const useSendMessageTo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string; recipientId: string }) => await sendMessage(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MESSAGES }),
  });
};

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => markMessageRead(messageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MESSAGES }),
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ senderId, recipientId }: { senderId: string; recipientId: string }) =>
      deleteConversation(senderId, recipientId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MESSAGES }),
  });
};
