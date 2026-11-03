import { useMemo } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteConversation, fetchMessages, markMessageRead, sendMessage } from '@/services/comm';
import { Message, isThreadUnread, toThreads } from '@/types/message';

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
 * Conversations still waiting on the reader, for the Messages badges. The
 * same query as the list, so opening the inbox costs nothing more.
 */
export const useUnreadConversationCount = (myId?: string, enabled = true) => {
  const { data: response } = useMessages(Boolean(myId) && enabled);

  return useMemo(() => {
    if (!myId) return 0;

    const payload = response?.data;
    const messages: Message[] = Array.isArray(payload) ? payload : (payload?.results ?? []);

    return toThreads(messages, myId).filter((thread) => isThreadUnread(thread, myId)).length;
  }, [response?.data, myId]);
};

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
