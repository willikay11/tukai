'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { mostRecentPastOffset, useMyCalendar, useMyReviews } from '@/app/(profile)/hooks';
import { PageContainer } from '@/app/shared/components/Layout';
import { useMyProfile } from '@/app/shared/hooks/useAuth';
import { Button } from '@/components/ui/button';

import {
  BucketListsTab,
  CommunitiesTab,
  EditProfileDrawer,
  MomentsTab,
  OverviewTab,
  ProfileCard,
  ProfileTabs,
  ReviewsTab,
  SettingsTab,
  type ProfileTabId,
} from './components';
import { MyProfile } from './profile';

/**
 * A reader's own profile: the "You" destination.
 *
 * Everything on the card comes off `GET /accounts/users/{id}/`. The tabs pull
 * from several real but separate endpoints - there is no single "profile
 * overview" response - see each hook in `app/(profile)/hooks/` for which one
 * and what it leaves out.
 */
export const ProfilePageContent = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabId>('overview');

  const { data: response, isLoading } = useMyProfile(userId);
  const profile: MyProfile | undefined = response?.success ? response.data : undefined;

  const calendar = useMyCalendar(userId);
  const reviews = useMyReviews(calendar.attended, userId);

  if (status === 'loading' || (userId && isLoading)) {
    return (
      <PageContainer className="py-6">
        <div className="h-40 animate-pulse rounded-3xl bg-gray-100" />
      </PageContainer>
    );
  }

  if (!userId) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">Sign in to see your profile.</p>
        <Link href="/auth/sign-in" className="mt-4 inline-flex">
          <Button className="rounded-full px-6">Sign in</Button>
        </Link>
      </PageContainer>
    );
  }

  const interests = profile?.interests ?? [];

  const onAttendedClick = () => {
    const offset = mostRecentPastOffset(calendar.days);
    if (offset != null) calendar.onSelectOffset(offset);
    setActiveTab('overview');
  };

  return (
    <PageContainer className="pb-10">
      <ProfileTabs active={activeTab} onChange={setActiveTab} reviewsCount={reviews.written.length} />

      <div className="flex flex-wrap items-start gap-7 pt-[18px]">
        <ProfileCard
          profile={profile}
          sessionName={session?.user?.name}
          sessionImage={session?.user?.image}
          followingDisplayName={session?.user?.displayName}
          attendedCount={calendar.attended.length}
          onAttendedClick={onAttendedClick}
        />

        <div className="min-w-0 flex-[999_1_560px]">
          {activeTab === 'overview' && (
            <OverviewTab
              userId={userId}
              calendar={calendar}
              written={reviews.written}
              interests={interests}
            />
          )}
          {activeTab === 'communities' && <CommunitiesTab userId={userId} />}
          {activeTab === 'moments' && <MomentsTab userId={userId} />}
          {activeTab === 'lists' && <BucketListsTab userId={userId} />}
          {activeTab === 'reviews' && (
            <ReviewsTab toReview={reviews.toReview} written={reviews.written} />
          )}
          {activeTab === 'settings' && <SettingsTab onEditProfile={() => setIsEditOpen(true)} />}
        </div>
      </div>

      {!profile && (
        <p className="mt-4 text-13 text-ink-subtle">
          Some of your profile could not be loaded. What is shown comes from this session.
        </p>
      )}

      <EditProfileDrawer
        profile={profile}
        userId={userId}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </PageContainer>
  );
};
