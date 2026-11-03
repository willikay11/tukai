import { useMemo } from 'react';

import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteConversation,
  fetchConversation,
  fetchMessages,
  markMessageRead,
  sendMessage,
} from '@/services/comm';
import { Message, isThreadUnread, mergeMessages, otherParty, toThreads } from '@/types/message';

const MESSAGES = ['messages'];

type MessagesResponse = Awaited<ReturnType<typeof fetchMessages>>;

// How often an open conversation looks for new messages. The API has no push
// for the web, so this is how the other side's replies arrive while it is open.
const OPEN_CONVERSATION_POLL_MS = 15_000;

/**
 * Every message the reader is party to. One query, because the API has no
 * threads - the conversations are grouped from this list.
 */
export const useMessages = (enabled = true, refetchInterval: number | false = false) =>
  useQuery({
    queryKey: MESSAGES,
    queryFn: async () => await fetchMessages({ page: 1, page_size: 200 }),
    enabled,
    refetchInterval,
  });

const messageList = (payload?: Message[] | { results?: Message[] } | null): Message[] =>
  Array.isArray(payload) ? payload : (payload?.results ?? []);

/**
 * The cached answer with its list changed, keeping its shape - for updating
 * before the server confirms. Hands back what was there, to put back if the
 * server refuses.
 */
const editCache = async (queryClient: QueryClient, edit: (messages: Message[]) => Message[]) => {
  await queryClient.cancelQueries({ queryKey: MESSAGES });

  const previous = queryClient.getQueryData<MessagesResponse>(MESSAGES);
  const payload = previous?.data;

  if (previous && payload) {
    queryClient.setQueryData<MessagesResponse>(MESSAGES, {
      ...previous,
      data: Array.isArray(payload)
        ? edit(payload)
        : { ...payload, results: edit(messageList(payload)) },
    });
  }

  return previous;
};

const restoreCache = (queryClient: QueryClient, previous?: MessagesResponse) => {
  if (previous) queryClient.setQueryData(MESSAGES, previous);
};

/**
 * Conversations still waiting on the reader, for the Messages badges. The
 * same query as the list, so opening the inbox costs nothing more.
 */
export const useUnreadConversationCount = (myId?: string, enabled = true) => {
  const { data: response } = useMessages(Boolean(myId) && enabled);

  return useMemo(() => {
    if (!myId) return 0;

    return toThreads(messageList(response?.data), myId).filter((thread) =>
      isThreadUnread(thread, myId),
    ).length;
  }, [response?.data, myId]);
};

/**
 * One conversation, all of it, kept fresh while it is open so the other
 * side's replies show up at the bottom. With no person, nothing is open and
 * nothing polls.
 *
 * Read from the conversation's own endpoint: the inbox list is one page of
 * every message, so a conversation built from it alone loses its earlier
 * messages. What the list holds is merged in too, so a message just sent shows
 * at once and something just read stays read.
 */
export const useConversation = (myId?: string, personId?: string | null) => {
  const isOpen = Boolean(myId && personId);
  const poll = isOpen ? OPEN_CONVERSATION_POLL_MS : false;

  const { data: list } = useMessages(isOpen, poll);
  const { data: history, isLoading } = useQuery({
    // Under MESSAGES, so whatever refreshes the list refreshes this too
    queryKey: [...MESSAGES, 'between', myId, personId],
    queryFn: async () => await fetchConversation(myId as string, personId as string),
    enabled: isOpen,
    refetchInterval: poll,
  });

  const thread = useMemo(() => {
    if (!myId || !personId) return null;

    const fromList = messageList(list?.data).filter(
      (one) => otherParty(one, myId)?.id === personId,
    );
    const fromHistory = history?.success ? (history.data as Message[]) : [];

    return (
      toThreads(mergeMessages(fromHistory, fromList), myId).find(
        (candidate) => candidate.personId === personId,
      ) ?? null
    );
  }, [list?.data, history, myId, personId]);

  return { thread, isLoading };
};

/**
 * Sending to one person.
 *
 * The one place a message is sent from, so the conversation composer and the
 * dialog on a host's page cannot drift apart. With `senderId`, the message
 * shows in the conversation at once, before the server answers.
 */
export const useSendMessageTo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string; recipientId: string; senderId?: string }) => {
      const response = await sendMessage({ content: data.content, recipientId: data.recipientId });
      // The service reports a refusal in its own result rather than throwing;
      // thrown here, so the message shown early is taken back
      if (data.senderId && response?.success === false) {
        throw new Error(response.message ?? 'Please try again.');
      }

      return response;
    },
    onMutate: async ({ content, recipientId, senderId }) => {
      if (!senderId) return undefined;

      const pending: Message = {
        // The prefix is what `mergeMessages` knows a not-yet-sent one by
        id: `pending-${Date.now()}`,
        sender: { id: senderId },
        recipient: { id: recipientId },
        content,
        isRead: true,
        dateCreated: new Date().toISOString(),
      };

      return editCache(queryClient, (messages) => [pending, ...messages]);
    },
    onError: (_error, _data, previous) => restoreCache(queryClient, previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: MESSAGES }),
  });
};

/** Read at once, so the tab count and the account menu badge drop together. */
export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => markMessageRead(messageId),
    onMutate: (messageId) =>
      editCache(queryClient, (messages) =>
        messages.map((one) => (one.id === messageId ? { ...one, isRead: true } : one)),
      ),
    onError: (_error, _id, previous) => restoreCache(queryClient, previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: MESSAGES }),
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ senderId, recipientId }: { senderId: string; recipientId: string }) =>
      deleteConversation(senderId, recipientId),
    // Gone from the list at once, so going Back does not show it again
    onMutate: ({ senderId, recipientId }) =>
      editCache(queryClient, (messages) =>
        messages.filter((one) => otherParty(one, senderId)?.id !== recipientId),
      ),
    onError: (_error, _data, previous) => restoreCache(queryClient, previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: MESSAGES }),
  });
};
