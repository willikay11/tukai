'use client';

import { useMoments } from '@/app/shared/hooks/useMoments';
import { Moment } from '@/types/moment';

/**
 * The reader's own moments.
 *
 * ⚠️ `GET /moments/` has no author filter, so this reads one page of the
 * whole feed and keeps only what the reader posted. A moment posted further
 * back than this page will not show up here until the API grows a filter -
 * this is a known gap, not a deliberate limit.
 */
const PAGE_SIZE = 60;

export const useMyMoments = (userId?: string | null) => {
  const { data, isLoading } = useMoments({ page: 1, page_size: PAGE_SIZE }, Boolean(userId));

  const all: Moment[] = data?.data?.results ?? [];
  const mine = all.filter((moment) => moment.author?.id === userId);

  return { isLoading, moments: mine };
};
