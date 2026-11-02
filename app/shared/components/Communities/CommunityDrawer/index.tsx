'use client';

import { useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  MomentComposerForm,
  MomentDrawer,
  useMomentComposer,
} from '@/app/shared/components/Moments';
import { PlaceDrawerTabs } from '@/app/shared/components/Places/PlaceDrawer/PlaceDrawerTabs';
import { Share } from '@/app/shared/components/Share';
import { useCommunityDetail } from '@/app/shared/hooks/useCommunities';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { useScrollSpy } from '@/app/shared/hooks/useScrollSpy';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment } from '@/types/moment';
import { communityPath } from '@/utils/detail-paths';

import { CommunityAboutSection } from './CommunityAboutSection';
import { CommunityAdminBand } from './CommunityAdminBand';
import { CommunityDrawerFooter } from './CommunityDrawerFooter';
import { CommunityMembersSection } from './CommunityMembersSection';
import { CommunityMoments } from './CommunityMoments';
import { CommunityUpcomingExperiences, UPCOMING_PAGE_SIZE } from './CommunityUpcomingExperiences';
import { membershipOf, ownerOf } from './community-drawer';
import { communityDrawerTabs } from './tabs';

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
 * About, Members, Experiences and Moments, the same ones the full page
 * covers (Places and Reviews are left out: neither has a backend yet - see
 * the drawer fork's backend-gap report). Join, Leave and sharing a moment all
 * live in the action bar; "Message host"/"Message members" live there and on
 * the Admin band.
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
  const currentUserId = session?.user?.id ?? undefined;
  const { toast } = useToast();
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);

  // The drawer's own body, swapped over for the moment composer the same way
  // PlaceDrawer's "moment" view takes over its body rather than stacking a
  // second panel.
  const [view, setView] = useState<'community' | 'moment'>('community');

  const { data, isLoading, isError } = useCommunityDetail(
    communityId ?? '',
    isOpen && Boolean(communityId),
  );
  const community: Community | undefined = data?.data;

  const owner = ownerOf(community?.members ?? []);
  const isOwnerSelf = Boolean(owner?.user?.id && owner.user.id === currentUserId);
  const currentMember = (community?.members ?? []).find(
    (member) => member.user?.id === currentUserId,
  );
  const canPost = membershipOf(currentMember) === 'member';

  // The same request `CommunityUpcomingExperiences` makes, so React Query
  // shares the one response - this only decides whether the Experiences tab
  // and section exist at all.
  const { data: experiencesResponse } = useExperiences(
    { page: 1, page_size: UPCOMING_PAGE_SIZE, community: communityId ?? '', status: 'published' },
    isOpen && Boolean(communityId),
  );
  const allExperiences: Experience[] = experiencesResponse?.data?.results ?? [];
  const now = Date.now();
  const hasExperiences = allExperiences.some(
    (experience) => new Date(experience.startDate).getTime() >= now,
  );

  const { data: momentsResponse, isLoading: isLoadingMoments } = useMoments(
    { community: communityId ?? '', page_size: 12 },
    isOpen && Boolean(communityId),
  );
  const moments: Moment[] = momentsResponse?.data?.results ?? [];

  const tabs = useMemo(() => communityDrawerTabs(hasExperiences), [hasExperiences]);
  const sectionIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
  const { activeId, scrollTo } = useScrollSpy(sectionIds, TAB_OFFSET, panel);

  const coverPhoto = community?.photos?.[0]?.photo ?? '';

  const momentComposer = useMomentComposer(
    { communityId: community?.id, communityLabel: community?.title },
    () => setView('community'),
  );

  const blockedShare = () =>
    toast({
      description: `Join ${community?.title ?? 'this community'} to share moments here. Joining is instant.`,
    });

  return (
    <>
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
                    {view === 'moment' ? 'New moment' : (community?.title ?? 'Community')}
                  </h2>

                  {view === 'community' &&
                    (community?.verified || (community && !community.isPublic)) && (
                      <TooltipProvider delayDuration={200}>
                        {community?.verified && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                tabIndex={0}
                                role="img"
                                aria-label="Verified business"
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg outline-none"
                              >
                                <IconComponent
                                  iconName="Briefcase01Icon"
                                  size={20}
                                  color="currentColor"
                                  className="text-brand"
                                />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Verified business</TooltipContent>
                          </Tooltip>
                        )}

                        {!community?.isPublic && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                tabIndex={0}
                                role="img"
                                aria-label="Private community"
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-lime outline-none"
                              >
                                <IconComponent
                                  iconName="SquareLock02Icon"
                                  size={16}
                                  color="currentColor"
                                  className="text-brand-ink"
                                />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Private community</TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    )}
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                {view === 'community' && community && (
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
                  onClick={() => (view === 'moment' ? setView('community') : onClose())}
                  aria-label={view === 'moment' ? 'Cancel' : 'Close'}
                  className={`${DISC} text-danger transition-colors hover:bg-danger-surface`}
                >
                  <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
                </button>
              </div>
            </div>

            {view === 'community' && community && (
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
          ) : view === 'moment' ? (
            <div className="flex-1 px-6 py-6">
              <MomentComposerForm {...momentComposer} />

              <div className="mt-6 flex items-center justify-end">
                <Button
                  type="button"
                  variant="lime"
                  onClick={momentComposer.handleShare}
                  disabled={!momentComposer.canShare}
                  isLoading={momentComposer.isPending}
                  className="h-12 rounded-full px-6 text-[15px]"
                >
                  Share moment
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-10 px-6 py-6">
                <CommunityAboutSection community={community} />

                <CommunityMembersSection
                  members={community.members ?? []}
                  currentUserId={currentUserId}
                />

                {hasExperiences && (
                  <CommunityUpcomingExperiences
                    communityId={community.id}
                    communityTitle={community.title}
                  />
                )}

                <CommunityMoments
                  communityTitle={community.title}
                  moments={moments}
                  isLoading={isLoadingMoments}
                  canPost={canPost}
                  onShare={() => setView('moment')}
                  onBlockedShare={blockedShare}
                />

                <CommunityAdminBand owner={owner} isOwnerSelf={isOwnerSelf} />
              </div>

              <div className="sticky bottom-0 z-30 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
                <CommunityDrawerFooter
                  community={community}
                  currentUserId={currentUserId}
                  owner={owner}
                  isOwnerSelf={isOwnerSelf}
                  onShareMoment={() => setView('moment')}
                  onBlockedShareMoment={blockedShare}
                />
              </div>
            </>
          )}
        </div>
      </Drawer>

      <MomentDrawer
        moment={momentComposer.sharedMoment}
        onClose={momentComposer.onCloseSharedMoment}
      />
    </>
  );
};
