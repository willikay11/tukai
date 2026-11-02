'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { PageContainer } from '@/app/shared/components/Layout';

import { CommunityPageTabs } from './CommunityPageTabs';
import { CreateCommunityCta } from './CreateCommunityCta';
import { DiscoverTab } from './DiscoverTab';
import { FollowingTab } from './FollowingTab';
import { MyCommunitiesTab } from './MyCommunitiesTab';

type View = 'discover' | 'following' | 'mine';

const VIEWS: View[] = ['discover', 'following', 'mine'];

const TABS = [
  { value: 'discover', label: 'Discover', icon: 'Compass01Icon' },
  { value: 'following', label: 'Following', icon: 'UserIcon' },
  { value: 'mine', label: 'My Communities', icon: 'UserGroupIcon' },
];

export const CommunitiesPageContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The tab lives in the URL rather than in state: it makes each one linkable,
  // it survives a refresh, and the main bottom navigation - which only sees the
  // route - can step aside for the create button on "My Communities".
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
        <CommunityPageTabs tabs={TABS} value={view} onChange={(next) => setView(next as View)} />
      </div>

      {view === 'discover' && status !== 'loading' && <DiscoverTab isSignedIn={isSignedIn} />}
      {view === 'following' && (
        <FollowingTab isSignedIn={isSignedIn} onDiscover={() => setView('discover')} />
      )}
      {view === 'mine' && <MyCommunitiesTab isSignedIn={isSignedIn} />}
    </PageContainer>
  );
};
