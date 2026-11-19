import { apiWithToken } from '@/services/apiService';
import type { TukaiConversation, TukaiConversationDetail } from '@/types/tukai';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

/**
 * The chats the server saved for this account (DEV-374/474/475). The TukAI
 * agent records every message as it goes, so a chat started on any device
 * is here; this only reads them back, and forgets one.
 */
export type TukaiConversationPage = { results: TukaiConversation[]; next: string | null };

export const TUKAI_CONVERSATIONS_PAGE_SIZE = 30;

/** Newest first. `search` matches the title and anything said in the chat. */
export async function fetchTukaiConversations({
  search,
  page = 1,
}: {
  search?: string;
  page?: number;
} = {}): Promise<TukaiConversationPage> {
  const api = await apiWithToken();
  const response = await api.get('/v1/tukai/conversations/', {
    params: {
      page,
      page_size: TUKAI_CONVERSATIONS_PAGE_SIZE,
      ...(search?.trim() ? { search: search.trim() } : {}),
    },
  });
  const data = parseSnakeToCamel(response.data);
  return { results: data?.results ?? [], next: data?.next ?? null };
}

/** One saved chat with its messages and recommendation cards. */
export async function fetchTukaiConversation(id: string): Promise<TukaiConversationDetail> {
  const api = await apiWithToken();
  const response = await api.get(`/v1/tukai/conversations/${id}/`);
  return parseSnakeToCamel(response.data) as TukaiConversationDetail;
}

export async function deleteTukaiConversation(id: string): Promise<void> {
  const api = await apiWithToken();
  await api.delete(`/v1/tukai/conversations/${id}/`);
}
