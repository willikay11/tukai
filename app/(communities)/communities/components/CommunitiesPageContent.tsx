'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { CommunityDiscoverCard } from '@/app/(experiences)/components/CommunityDiscoverCard';
import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { PageContainer } from '@/app/shared/components/Layout';
import { PillTabs } from '@/app/shared/components/Tabs';
import { useGetInterestCategories } from '@/app/shared/hooks/useAuth';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Community } from '@/types/community';
import { Interest } from '@/types/interest';

import { CommunityTypeFilter } from './CommunityTypeFilter';
import { CreateCommunityCta } from './CreateCommunityCta';
import { FollowingTab } from './FollowingTab';
import { MyCommunitiesTab } from './MyCommunitiesTab';
import { COMMUNITY_GRID } from './grid';

type View = 'discover' | 'following' | 'mine';

const VIEWS: View[] = ['discover', 'following', 'mine'];

const TABS = [
  { value: 'discover', label: 'Discover', icon: 'Location01Icon' },
  { value: 'following', label: 'Following', icon: 'UserGroupIcon' },
  { value: 'mine', label: 'My Communities', icon: 'UserMultipleIcon' },
];

// The grid is four wide from xl, so this is the first row — what a reader sees
// before scrolling. Fetched without waiting for the lazy-load observer.
const EAGER_CARDS = 4;

const GridSkeleton = () => (
  <div className={COMMUNITY_GRID}>
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <div className="h-[180px] w-full animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

export const CommunitiesPageContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // The tab lives in the URL rather than in state: it makes each one linkable,
  // it survives a refresh, and the main bottom navigation — which only sees the
  // route — can step aside for the create button on "My Communities".
  const requested = searchParams.get('tab') as View | null;
  const view: View = requested && VIEWS.includes(requested) ? requested : 'discover';

  const setView = (next: View) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'discover') params.delete('tab');
    else params.set('tab', next);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const { data: session, status } = useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const { openSignInWithCallback } = useAuthDialog();

  const { data: categories, isLoading: isLoadingCategories } = useGetInterestCategories();

  // Discover is browsable signed out, so the list is never gated on a session.
  // `recommended` is deliberately absent: signed out it is a 500 — there is
  // nobody to recommend for — and signed in it narrows to a handful, where
  // this tab is meant to be everything there is to join.
  const { data, isLoading, isFetching, refetch } = useGetCommunities({
    page: 1,
    enabled: view === 'discover',
    category: categoryId ? [categoryId] : undefined,
  });

  // `getCommunities` catches its own errors and resolves with `success: false`
  // rather than throwing, so React Query reports the query as successful and
  // `isError` is never true. Without reading the flag, a throttled or failed
  // request renders as "there are no communities" — which is what a 429 from
  // the API looked like on this page.
  const hasFailed = data?.success === false;
  const communities: Community[] = data?.data?.results ?? [];
  const selectedCategory = ((categories as Interest[]) ?? []).find(
    (category) => category.id === categoryId,
  );

  return (
    <PageContainer className="py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Phones reach this page from the bottom nav with nothing above it;
              on a wider screen the main navigation is already on screen */}
          <span className="md:hidden">
            <BackToExplore href="/" label="Back" variant="icon" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Communities</h1>
        </div>

        {/* The phone gets the floating version inside the tab instead */}
        {view === 'mine' && isSignedIn && <CreateCommunityCta className="hidden md:flex" />}
      </div>

      <div className="-mx-4 mt-5 overflow-x-auto px-4 scrollbar-hide md:mx-0 md:px-0">
        <PillTabs
          tabs={TABS}
          value={view}
          onChange={(next) => setView(next as View)}
          className="w-fit"
        />
      </div>

      {view === 'following' && <FollowingTab isSignedIn={isSignedIn} />}
      {view === 'mine' && <MyCommunitiesTab isSignedIn={isSignedIn} />}

      {view === 'discover' && (
        <>
          <div className="mt-6">
            <CommunityTypeFilter
              categories={(categories as Interest[]) ?? []}
              selectedId={categoryId}
              onSelect={setCategoryId}
              isLoading={isLoadingCategories}
            />
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategory ? selectedCategory.name : 'All Communities'}
            </h2>

            <div className="mt-4">
              {isLoading || status === 'loading' ? (
                <GridSkeleton />
              ) : hasFailed ? (
                <div className="flex flex-col items-center gap-4 py-16">
                  <NoData message="Communities could not load" />
                  <p className="max-w-sm text-center text-sm text-gray-400">
                    {data?.message || 'Something went wrong. Please try again.'}
                  </p>
                  <Button
                    onClick={() => refetch()}
                    isLoading={isFetching}
                    className="rounded-full px-6"
                  >
                    Try again
                  </Button>
                </div>
              ) : communities.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16">
                  <NoData
                    message={
                      selectedCategory
                        ? `No communities under ${selectedCategory.name} yet`
                        : 'No communities right now'
                    }
                  />
                  {selectedCategory ? (
                    <Button onClick={() => setCategoryId(null)} className="rounded-full px-6">
                      Show all communities
                    </Button>
                  ) : (
                    <Button onClick={() => router.push('/')} className="rounded-full px-6">
                      Back to Discover
                    </Button>
                  )}
                </div>
              ) : (
                <div className={COMMUNITY_GRID}>
                  {communities.map((community, index) => (
                    <CommunityDiscoverCard
                      key={community.id}
                      community={community}
                      // The card is sized for the Discover scroll row by default
                      className="w-full"
                      // The list endpoint returns only the owner, so the
                      // facepile would otherwise be a single face
                      showMemberAvatars
                      priority={index < EAGER_CARDS}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {!isSignedIn && status !== 'loading' && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-sm text-gray-600">Sign in to follow communities and join in</p>
              <Button
                onClick={() => openSignInWithCallback(() => undefined)}
                className="flex-shrink-0 rounded-full px-6"
              >
                Sign in
              </Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};
