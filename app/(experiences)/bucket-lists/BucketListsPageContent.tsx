'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PageContainer } from '@/app/shared/components/Layout';
import { PageTab, PageTabs, pageTabId, pageTabPanelId } from '@/app/shared/components/Tabs';
import { useMyBucketListMembership } from '@/app/shared/hooks/useBucketLists';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { useBucketListDrawer } from '@/context/BucketListDrawerContext';
import { BucketListMember } from '@/types/bucket-list';

import { DiscoverTab, FollowingTab, InviteBanner, MyBucketListsTab } from './components';

type View = 'discover' | 'following' | 'mine';

const VIEWS: View[] = ['discover', 'following', 'mine'];
const TAB_IDS = 'bucket-lists';

/**
 * The Bucket lists page: Discover (public lists), Following (lists you joined,
 * and an invite when one is waiting) and My bucket lists (lists you made).
 *
 * The tab lives in the URL, as on the Communities page, so it survives a
 * refresh and every view is linkable. Following is the default. An invite
 * arrives the same way, as `?invite={listId}` from the invite's own link.
 */
export const BucketListsPageContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { needAuth } = useAuthDialog();
  const drawer = useBucketListDrawer();

  const requested = searchParams.get('tab') as View | null;
  const view: View = requested && VIEWS.includes(requested) ? requested : 'following';
  const inviteListId = userId ? searchParams.get('invite') : null;

  const setParams = (change: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    change(params);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setView = (next: View) =>
    setParams((params) => {
      if (next === 'following') params.delete('tab');
      else params.set('tab', next);
    });

  // Same query the banner makes, so the badge and the banner agree
  const { data: membershipResponse } = useMyBucketListMembership(
    inviteListId ?? '',
    Boolean(inviteListId),
  );
  const hasInvite =
    Boolean(inviteListId) &&
    (membershipResponse?.data as BucketListMember | undefined)?.status === 'pending';

  const tabs: PageTab[] = [
    { value: 'discover', label: 'Discover', icon: 'CompassIcon' },
    {
      value: 'following',
      label: 'Following',
      icon: 'ShoppingBasket02Icon',
      badge: hasInvite ? { count: 1, label: '1 invite waiting' } : undefined,
    },
    { value: 'mine', label: 'My bucket lists', icon: 'ShoppingBasketAdd02Icon' },
  ];

  const openCreate = () => {
    const create = () => drawer?.openCreateBucketList();
    if (userId) create();
    else needAuth('lists', create);
  };

  return (
    <PageContainer className="pb-14 pt-[30px]">
      <h1 className="text-[30px] font-bold tracking-[-0.6px] text-brand-ink">Bucket lists</h1>

      <PageTabs
        tabs={tabs}
        value={view}
        onChange={(next) => setView(next as View)}
        ariaLabel="Bucket lists"
        idPrefix={TAB_IDS}
        className="-mx-4 mt-5 px-4 md:mx-0 md:px-0"
      />

      <div
        role="tabpanel"
        id={pageTabPanelId(TAB_IDS, view)}
        aria-labelledby={pageTabId(TAB_IDS, view)}
      >
        {view === 'following' && inviteListId && (
          <InviteBanner
            bucketListId={inviteListId}
            onAccepted={() => setParams((params) => params.delete('invite'))}
            onDismissed={() => setParams((params) => params.delete('invite'))}
          />
        )}

        {view === 'discover' && <DiscoverTab userId={userId} />}
        {view === 'following' && (
          <FollowingTab
            userId={userId}
            hasInvite={hasInvite}
            onDiscover={() => setView('discover')}
          />
        )}
        {view === 'mine' && <MyBucketListsTab userId={userId} onCreate={openCreate} />}
      </div>
    </PageContainer>
  );
};
