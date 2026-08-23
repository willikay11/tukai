'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { PageContainer } from '@/app/shared/components/Layout';
import { PillTabs } from '@/app/shared/components/Tabs';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { Community } from '@/types/community';
import { buildCommunityGroups } from '@/utils/community-grouping';

import { CommunityCategoryGroup } from './CommunityCategoryGroup';

type View = 'mine' | 'recommended';

const TABS = [
  { value: 'mine', label: 'My Communities' },
  { value: 'recommended', label: 'Recommended' },
];

const GroupsSkeleton = () => (
  <div className="space-y-12">
    {Array.from({ length: 2 }).map((_, group) => (
      <div key={group}>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, card) => (
            <div key={card} className="space-y-3">
              <div className="h-[180px] w-full animate-pulse rounded-2xl bg-gray-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const CommunitiesPageContent = () => {
  const router = useRouter();
  const [view, setView] = useState<View>('mine');

  const isMine = view === 'mine';

  // One endpoint, two flags. `following` is the user's own memberships;
  // `recommended` is the suggestion feed. Both are auth-only — anonymously the
  // API raises rather than returning 401, but this page is behind AuthGuard.
  const { data, isLoading } = useGetCommunities({
    page: 1,
    enabled: true,
    following: isMine,
    recommendedCommunities: !isMine,
  });

  const communities: Community[] = data?.data?.results ?? [];
  const groups = useMemo(() => buildCommunityGroups(communities), [communities]);

  return (
    <PageContainer className="py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
          <p className="mt-1 text-sm text-gray-400">The crews that make every adventure better</p>
        </div>

        <div className="sm:flex-shrink-0">
          <PillTabs tabs={TABS} value={view} onChange={(next) => setView(next as View)} />
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <GroupsSkeleton />
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <NoData
              message={
                isMine ? "You haven't joined any communities yet" : 'No recommendations right now'
              }
            />
            {isMine ? (
              <Button onClick={() => setView('recommended')} className="rounded-full px-6">
                Browse recommendations
              </Button>
            ) : (
              <Button onClick={() => router.push('/')} className="rounded-full px-6">
                Back to Discover
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <CommunityCategoryGroup key={group.categoryId} group={group} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
