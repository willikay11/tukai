'use client';

import { useEffect, useState } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchTukaiConversations } from '@/services/tukaiConversations';
import type { TukaiConversation } from '@/types/tukai';

const SEARCH_DELAY_MS = 300;

/**
 * The account's saved chats from the server, newest first (DEV-474/475).
 * Searching asks the server, which matches titles and what was said, once
 * the person stops typing for a moment.
 */
export const useTukaiConversations = (query: string, enabled = true) => {
  const [search, setSearch] = useState(query.trim());

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const result = useInfiniteQuery({
    queryKey: ['tukai-conversations', search],
    queryFn: ({ pageParam }) => fetchTukaiConversations({ search, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.next ? pages.length + 1 : undefined),
    enabled,
  });

  const conversations: TukaiConversation[] =
    result.data?.pages.flatMap((page) => page.results) ?? [];

  return {
    conversations,
    /** The search the list was read for, which trails the typing */
    search,
    isLoading: result.isLoading,
    isError: result.isError,
    hasMore: Boolean(result.hasNextPage),
    isLoadingMore: result.isFetchingNextPage,
    loadMore: () => void result.fetchNextPage(),
  };
};
