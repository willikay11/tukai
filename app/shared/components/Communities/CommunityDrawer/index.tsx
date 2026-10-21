'use client';

import { useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PlaceDrawerTabs } from '@/app/shared/components/Places/PlaceDrawer/PlaceDrawerTabs';
import { MomentsGridSection, UpcomingExperiencesSection } from '@/app/shared/components/Sections';
import { Share } from '@/app/shared/components/Share';
import { useCommunityDetail } from '@/app/shared/hooks/useCommunities';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { useScrollSpy } from '@/app/shared/hooks/useScrollSpy';
import { Drawer } from '@/components/ui/drawer';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment } from '@/types/moment';
import { communityPath } from '@/utils/detail-paths';

import { CommunityAboutSection } from './CommunityAboutSection';
import { CommunityDrawerFooter } from './CommunityDrawerFooter';
import { CommunityMembersSection } from './CommunityMembersSection';
import { COMMUNITY_SECTIONS, communityDrawerTabs } from './tabs';

/** The round grey disc each of the header's controls sits in. */
const DISC = 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface';

/** The header and tabs together, so a section's `scroll-mt` clears both. */
const TAB_OFFSET = 148;

const Loading = () => (
  <div className="space-y-4 px-6 py-6">
    <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
    <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-gray-200" />
    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
  </div>
);

/**
 * A community, opened over whatever the reader was looking at - including
 * straight from the Create menu once a new one is made.
 *
 * About, Experiences, Members and Moments, the same four the full page
 * covers (Places and Reviews are left out: neither has a backend yet, so the
 * full page's own sections for them are an empty state with nothing behind
 * it - see PlacesSection/ReviewsSection). Join and Leave live in the footer;
 * everything else about membership is read, not acted on, from here.
 */
export const CommunityDrawer = ({
  communityId,
  isOpen,
  onClose,
}: {
  communityId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { data: session } = useSession();
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);

  const { data, isLoading, isError } = useCommunityDetail(
    communityId ?? '',
    isOpen && Boolean(communityId),
  );
  const community: Community | undefined = data?.data;

  // `community` is the only filter the experiences list honours
  const { data: experiencesResponse, isLoading: isLoadingExperiences } = useExperiences(
    { community: communityId ?? '', page: 1, page_size: 10 },
    isOpen && Boolean(communityId),
  );
  const experiences: Experience[] = experiencesResponse?.data?.results ?? [];

  const { data: momentsResponse, isLoading: isLoadingMoments } = useMoments(
    { community: communityId ?? '', page_size: 12 },
    isOpen && Boolean(communityId),
  );
  const moments: Moment[] = momentsResponse?.data?.results ?? [];

  const tabs = useMemo(() => communityDrawerTabs(), []);
  const sectionIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
  const { activeId, scrollTo } = useScrollSpy(sectionIds, TAB_OFFSET, panel);

  const coverPhoto = community?.photos?.[0]?.photo ?? '';

  return (
    <Drawer
      isOpen={isOpen}
      setIsOpen={(next) => !next && onClose()}
      width="wide"
      mobile="full"
      panelRef={setPanel}
    >
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-30 bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="min-w-0 truncate text-[22px] font-bold leading-tight text-brand-ink">
                  {community?.title ?? 'Community'}
                </h2>
                {community?.verified && (
                  <IconComponent
                    iconName="CheckmarkBadge01Icon"
                    size={20}
                    variant="solid"
                    color="currentColor"
                    className="flex-shrink-0 text-primary"
                  />
                )}
              </div>
              {community && (
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  {community.isPublic ? 'Public community' : 'Private community'}
                </p>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              {community && (
                <div className={DISC}>
                  <Share
                    coverPhoto={coverPhoto}
                    title={community.title}
                    link={`${process.env.NEXT_PUBLIC_APP_URL}${communityPath(community)}`}
                    kind="community"
                    variant="icon"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={`${DISC} text-danger transition-colors hover:bg-danger-surface`}
              >
                <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
              </button>
            </div>
          </div>

          {community && (
            <div className="px-6 py-3">
              <PlaceDrawerTabs tabs={tabs} activeId={activeId} onSelect={scrollTo} />
            </div>
          )}
        </div>

        {isError ? (
          <div className="space-y-4 px-6 py-6">
            <p className="text-base text-ink-muted">This community could not be loaded.</p>
          </div>
        ) : isLoading || !community ? (
          <Loading />
        ) : (
          <>
            <div className="flex-1 space-y-10 px-6 py-6">
              <CommunityAboutSection community={community} upcomingCount={experiences.length} />

              <UpcomingExperiencesSection
                id={COMMUNITY_SECTIONS.experiences}
                hostName={community.title}
                experiences={experiences}
                isLoading={isLoadingExperiences}
              />

              <CommunityMembersSection members={community.members ?? []} />

              <MomentsGridSection
                id={COMMUNITY_SECTIONS.moments}
                hostName={community.title}
                moments={moments}
                isLoading={isLoadingMoments}
              />
            </div>

            <div className="sticky bottom-0 z-30 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
              <CommunityDrawerFooter
                community={community}
                currentUserId={session?.user?.id ?? undefined}
              />
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};
