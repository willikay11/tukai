'use client';

import { useMemo } from 'react';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { Share } from '@/app/shared/components/Share';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { useScrollSpy } from '@/app/shared/hooks/useScrollSpy';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment } from '@/types/moment';

import { CommunityAnchorTabs } from './CommunityAnchorTabs';
import { JoinCommunityPanel } from './JoinCommunityPanel';
import {
  AboutSection,
  ExperiencesSection,
  MembersSection,
  MomentsSection,
  PlacesSection,
  ReviewsSection,
} from './sections';

const SECTION_IDS = ['about', 'experiences', 'members', 'places', 'moments', 'reviews'];

export const CommunityDetailContent = ({
  community,
  currentUserId,
}: {
  community: Community;
  currentUserId: string;
}) => {
  // Matches the sticky navbar (65px) plus the pill row above the content, so a
  // section becomes current as its heading clears them rather than while it is
  // still hidden behind
  const { activeId, scrollTo } = useScrollSpy(SECTION_IDS, 128);

  // `community` is the only filter the experiences list honours —
  // `host_community` and `hosted_by_community` are ignored by the API
  const { data: experiencesResponse, isLoading: isLoadingExperiences } = useExperiences(
    { community: community.id, page: 1, page_size: 10 },
    true,
  );
  const experiences: Experience[] = experiencesResponse?.data?.results ?? [];

  const { data: momentsResponse, isLoading: isLoadingMoments } = useMoments({
    community: community.id,
    page_size: 12,
  });
  const moments: Moment[] = momentsResponse?.data?.results ?? [];

  const members = community.members ?? [];

  const tabs = useMemo(
    () => [
      { id: 'about', label: 'About', icon: 'InformationCircleIcon' },
      { id: 'experiences', label: 'Experiences', icon: 'Ticket02Icon' },
      { id: 'members', label: 'Members', icon: 'UserGroupIcon' },
      { id: 'places', label: 'Places', icon: 'Location01Icon' },
      { id: 'moments', label: 'Moments', icon: 'Camera01Icon' },
      { id: 'reviews', label: 'Reviews', icon: 'StarIcon' },
    ],
    [],
  );

  const coverPhoto = community.photos?.[0]?.photo ?? '';

  return (
    <PageContainer className="py-6">
      <BackToExplore href="/communities" label="All communities" />

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">{community.title}</h1>
            {community.verified && (
              <IconComponent
                iconName="CheckmarkBadge01Icon"
                size={22}
                className="flex-shrink-0 text-primary"
              />
            )}
          </div>
          {/* ⚠️ No location, rating or review count on a community, so the meta
              line carries only what the API actually returns */}
          <p className="mt-1 text-sm text-gray-500">
            {community.isPublic ? 'Public community' : 'Private community'}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Share
            coverPhoto={coverPhoto}
            title={community.title}
            link={`${process.env.NEXT_PUBLIC_APP_URL}/communities/${community.id}`}
          />
        </div>
      </div>

      <div className="mt-5">
        <CommunityAnchorTabs tabs={tabs} activeId={activeId} onSelect={scrollTo} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-16 lg:col-span-2">
          <AboutSection community={community} upcomingCount={experiences.length} />
          <ExperiencesSection
            communityName={community.title}
            experiences={experiences}
            isLoading={isLoadingExperiences}
          />
          <MembersSection members={members} />
          <PlacesSection communityName={community.title} />
          <MomentsSection
            communityName={community.title}
            moments={moments}
            isLoading={isLoadingMoments}
          />
          <ReviewsSection communityName={community.title} />
        </div>

        <div className="lg:col-span-1">
          {/* Below the content on mobile, alongside and pinned from lg up */}
          <div className="lg:sticky lg:top-20">
            <JoinCommunityPanel community={community} currentUserId={currentUserId} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
