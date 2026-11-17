'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  MomentComposerForm,
  MomentDrawer,
  useMomentComposer,
} from '@/app/shared/components/Moments';
import { Share, communityShare } from '@/app/shared/components/Share';
import {
  useCommunityContact,
  useCommunityDetail,
  useCommunityRatings,
} from '@/app/shared/hooks/useCommunities';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { useScrollSpy } from '@/app/shared/hooks/useScrollSpy';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Community, CommunityContact, CommunityRating } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment } from '@/types/moment';

import { CommunityAboutSection } from './CommunityAboutSection';
import { CommunityAdminBand } from './CommunityAdminBand';
import { CommunityContactSection, CommunitySocials } from './CommunityContactSection';
import { CommunityDrawerFooter } from './CommunityDrawerFooter';
import { CommunityDrawerTabs } from './CommunityDrawerTabs';
import { CommunityMembersSection } from './CommunityMembersSection';
import { CommunityMoments } from './CommunityMoments';
import { CommunityPlaces } from './CommunityPlaces';
import { CommunityClosedState, CommunityInvitedState } from './CommunityPrivateState';
import { CommunityReviews } from './CommunityReviews';
import { CommunityUpcomingExperiences, UPCOMING_PAGE_SIZE } from './CommunityUpcomingExperiences';
import {
  accessOf,
  communityPlaces,
  drawerPhotos,
  ownerOf,
  pastExperienceCount,
  upcomingExperiences,
} from './community-drawer';
import { Divider } from './parts';
import { COMMUNITY_SECTIONS, SECTION_ORDER, SPY_OFFSET, communityDrawerTabs } from './tabs';
import { useCommunityActions } from './useCommunityActions';

/** The round grey disc each of the header's controls sits in. */
const DISC =
  'flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface transition-colors';

const Loading = () => (
  <div className="flex flex-col gap-4 px-6 py-5">
    <div className="h-11 w-2/3 animate-pulse rounded-full bg-surface" />
    <div className="h-[240px] w-full animate-pulse rounded-xl bg-surface" />
    <div className="h-4 w-full animate-pulse rounded bg-surface" />
    <div className="h-4 w-5/6 animate-pulse rounded bg-surface" />
  </div>
);

/** A header mark: a focusable image with its tooltip on hover and focus. */
const HeaderMark = ({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        tabIndex={0}
        role="img"
        aria-label={label}
        className={`relative flex h-[30px] w-[30px] flex-none cursor-default items-center justify-center rounded-lg outline-none before:absolute before:-inset-[7px] focus-visible:shadow-[0_0_0_3px_theme(colors.surface.brand)] ${className}`}
      >
        {children}
      </span>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

/**
 * The body of one community. Keyed by community, so opening another resets
 * everything here - the current tab, Show more, the picked week and day.
 */
const CommunityBody = ({
  community,
  currentUserId,
  panel,
  hasDeclined,
  onDecline,
  onCompose,
}: {
  community: Community;
  currentUserId?: string;
  panel: HTMLDivElement | null;
  hasDeclined: boolean;
  onDecline: () => void;
  onCompose: () => void;
}) => {
  const { toast } = useToast();
  const actions = useCommunityActions(community, currentUserId);
  const access = accessOf(community, currentUserId, hasDeclined);
  const isFullView = access === 'owner' || access === 'member' || access === 'guest';

  const members = community.members ?? [];
  const owner = ownerOf(members);
  const memberCount = community.membersCount ?? members.length;

  const { data: experiencesResponse } = useExperiences(
    { page: 1, page_size: UPCOMING_PAGE_SIZE, community: community.id, status: 'published' },
    isFullView,
  );
  const experiences: Experience[] = useMemo(
    () => experiencesResponse?.data?.results ?? [],
    [experiencesResponse],
  );
  const upcoming = useMemo(() => upcomingExperiences(experiences), [experiences]);
  const experienceTitles = useMemo(
    () => new Map(experiences.map((experience) => [experience.id, experience.title])),
    [experiences],
  );

  const { data: momentsResponse, isLoading: isLoadingMoments } = useMoments(
    { community: community.id, page_size: 12 },
    isFullView,
  );
  const moments: Moment[] = useMemo(() => momentsResponse?.data?.results ?? [], [momentsResponse]);

  const { data: contactResponse } = useCommunityContact(community.id, isFullView);
  const contact: CommunityContact | undefined = contactResponse?.success
    ? contactResponse.data
    : undefined;

  const { data: ratingsResponse } = useCommunityRatings(community.id, isFullView);
  const ratings: CommunityRating[] = ratingsResponse?.data?.results ?? [];
  const ratingCount: number = ratingsResponse?.data?.count ?? ratings.length;

  const { places, isOwned } = useMemo(
    () => communityPlaces(community, experiences),
    [community, experiences],
  );
  const photos = useMemo(
    () => drawerPhotos(community, moments, upcoming),
    [community, moments, upcoming],
  );

  const hasExperiences = upcoming.length > 0;
  const hasPlaces = places.length > 0;
  const tabs = useMemo(
    () => communityDrawerTabs({ hasExperiences, hasPlaces, reviewCount: ratingCount }),
    [hasExperiences, hasPlaces, ratingCount],
  );
  const spyIds = useMemo(
    () =>
      SECTION_ORDER.filter(
        (id) =>
          (id !== COMMUNITY_SECTIONS.experiences || hasExperiences) &&
          (id !== COMMUNITY_SECTIONS.places || hasPlaces),
      ),
    [hasExperiences, hasPlaces],
  );
  const { activeId, scrollTo } = useScrollSpy(spyIds, SPY_OFFSET, panel);

  const selectSection = (id: string) => {
    scrollTo(id);
    // About is the top of the drawer, not the top of its text
    if (id === COMMUNITY_SECTIONS.about) panel?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  if (access === 'invited') {
    return (
      <div className="px-6 pb-9 pt-5">
        <CommunityInvitedState
          community={community}
          inviter={owner}
          isJoining={actions.isJoining}
          onJoin={actions.acceptInvite}
          onDecline={() => {
            onDecline();
            toast({
              description: `Invite to ${community.title} declined. You have no access to it.`,
            });
          }}
        />
      </div>
    );
  }

  if (access === 'closed') {
    return (
      <div className="px-6 pb-9 pt-5">
        <CommunityClosedState />
      </div>
    );
  }

  const isOwnerSelf = access === 'owner';
  const isMember = access === 'member';

  return (
    <>
      <div className="sticky top-[68px] z-20 bg-white">
        <CommunityDrawerTabs tabs={tabs} activeId={activeId} onSelect={selectSection} />
      </div>

      <div className="flex flex-1 flex-col gap-7 px-6 pb-9 pt-4">
        <CommunityAboutSection
          community={community}
          photos={photos}
          onShowPlaces={() => selectSection(COMMUNITY_SECTIONS.places)}
        />
        <Divider />

        <CommunityContactSection contact={contact} />
        <CommunitySocials contact={contact} />

        <CommunityMembersSection
          communityId={community.id}
          communityTitle={community.title}
          members={members}
          memberCount={memberCount}
          currentUserId={currentUserId}
          isOwnerSelf={isOwnerSelf}
        />
        <Divider />

        {hasExperiences && (
          <>
            <CommunityUpcomingExperiences communityTitle={community.title} experiences={upcoming} />
            <Divider />
          </>
        )}

        <CommunityMoments
          communityTitle={community.title}
          moments={moments}
          isLoading={isLoadingMoments}
          onCompose={onCompose}
        />

        <CommunityAdminBand
          owner={owner}
          isOwnerSelf={isOwnerSelf}
          pastExperiences={pastExperienceCount(experiences)}
        />

        <CommunityPlaces communityTitle={community.title} places={places} isOwned={isOwned} />

        <CommunityReviews
          communityTitle={community.title}
          ratings={ratings}
          total={ratingCount}
          experienceTitles={experienceTitles}
        />

        {isMember && (
          <button
            type="button"
            onClick={actions.leave}
            disabled={actions.isLeaving}
            className="-mt-2 inline-flex h-11 items-center gap-2 self-start rounded-full px-2.5 text-[14.5px] font-medium text-danger transition-colors hover:bg-danger-surface disabled:opacity-60"
          >
            <IconComponent iconName="Logout03Icon" size={19} color="currentColor" />
            Leave community
          </button>
        )}
      </div>

      <div className="sticky bottom-0 z-30 flex min-h-[88px] flex-none flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 pb-[calc(18px+var(--drawer-inset-bottom,env(safe-area-inset-bottom)))] pt-[18px]">
        <CommunityDrawerFooter
          isMember={isMember}
          isOwnerSelf={isOwnerSelf}
          owner={owner}
          isJoining={actions.isJoining}
          onJoin={actions.join}
          onShareMoment={onCompose}
        />
      </div>
    </>
  );
};

/**
 * A community, opened over whatever the reader was looking at - from a card,
 * an experience's host, a place's owner, or straight after creating one.
 *
 * Built to `design_handoff_community_drawer`. The full view for guests,
 * members and owners; an invited and a closed state for private communities.
 * `onBack` is set when it sits on top of another drawer.
 */
export const CommunityDrawer = ({
  communityId,
  isOpen,
  onClose,
  onBack,
}: {
  communityId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}) => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? undefined;
  const { toast } = useToast();
  const { needAuth } = useAuthDialog();
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // The drawer's own body, swapped over for the moment composer the same way
  // PlaceDrawer's "moment" view takes over its body rather than stacking a
  // second panel.
  const [view, setView] = useState<'community' | 'moment'>('community');

  const { data, isLoading } = useCommunityDetail(communityId ?? '', isOpen && Boolean(communityId));
  // The service resolves `success: false` rather than throwing
  const hasFailed = data?.success === false;
  // A private community the reader may not see comes back refused rather than empty
  const isRefused = hasFailed && (data?.status === 403 || data?.status === 404);
  const community: Community | undefined = hasFailed ? undefined : data?.data;

  // Declining hides the invite for this visit only - see CommunityInvitedState
  const [declinedId, setDeclinedId] = useState<string | null>(null);
  const hasDeclined = Boolean(community && declinedId === community.id);

  const access = community ? accessOf(community, currentUserId, hasDeclined) : undefined;
  const isLocked = isRefused || access === 'closed';
  const isFullView = access === 'owner' || access === 'member' || access === 'guest';

  // A new community starts at the top, on the community itself, with focus on
  // its title so a screen reader hears where it landed
  useEffect(() => {
    setView('community');
    if (panel) panel.scrollTop = 0;
  }, [communityId, panel]);

  useEffect(() => {
    if (isOpen && community) titleRef.current?.focus({ preventScroll: true });
  }, [isOpen, community?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const momentComposer = useMomentComposer(
    { communityId: community?.id, communityLabel: community?.title },
    () => setView('community'),
  );

  const compose = () => {
    if (!community) return;
    if (access === 'owner' || access === 'member') return setView('moment');
    if (!currentUserId) return needAuth('moment');
    toast({
      description: `Join ${community.title} to share moments here. Joining is instant.`,
    });
  };

  const title =
    view === 'moment'
      ? 'New moment'
      : isLocked
        ? 'Private community'
        : (community?.title ?? 'Community');

  return (
    <>
      <Drawer
        isOpen={isOpen}
        setIsOpen={(next) => !next && onClose()}
        panelRef={setPanel}
        ariaLabel={title}
      >
        <div className="flex min-h-full flex-col">
          <header className="sticky top-0 z-30 flex h-[68px] flex-none items-center gap-2 border-b border-surface-muted bg-white px-4">
            {onBack && view === 'community' && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className={`${DISC} text-brand hover:bg-surface-brand`}
              >
                <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
              </button>
            )}

            <div className="flex min-w-0 flex-1 items-center gap-2.5 px-1.5">
              <h2
                ref={titleRef}
                tabIndex={-1}
                className="min-w-0 truncate text-2xl font-bold tracking-[-0.4px] text-gray-800 outline-none"
              >
                {title}
              </h2>

              {view === 'community' && community && (
                <TooltipProvider delayDuration={200}>
                  {community.verified && isFullView && (
                    <HeaderMark label="Verified business" className="-ml-1.5">
                      <IconComponent
                        iconName="CheckmarkCircle02Icon"
                        size={24}
                        color="currentColor"
                        className="text-brand"
                      />
                    </HeaderMark>
                  )}
                  {!community.isPublic && (
                    <HeaderMark label="Private community" className="bg-lime">
                      <IconComponent
                        iconName="SquareLock02Icon"
                        size={17}
                        color="currentColor"
                        className="text-brand-ink"
                      />
                    </HeaderMark>
                  )}
                </TooltipProvider>
              )}
            </div>

            {view === 'community' && community && isFullView && (
              <div className={`${DISC} hover:bg-surface-brand`}>
                <Share content={communityShare(community)} variant="icon" />
              </div>
            )}

            <button
              type="button"
              onClick={() => (view === 'moment' ? setView('community') : onClose())}
              aria-label={view === 'moment' ? 'Cancel' : 'Close'}
              className={`${DISC} text-danger hover:bg-danger-surface`}
            >
              <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
            </button>
          </header>

          {isRefused ? (
            <div className="px-6 pb-9 pt-5">
              <CommunityClosedState />
            </div>
          ) : hasFailed ? (
            <p className="px-6 py-6 text-base text-ink-muted">
              This community could not be loaded.
            </p>
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
                  <IconComponent iconName="Share08Icon" size={18} color="currentColor" />
                  Share moment
                </Button>
              </div>
            </div>
          ) : (
            <CommunityBody
              key={community.id}
              community={community}
              currentUserId={currentUserId}
              panel={panel}
              hasDeclined={hasDeclined}
              onDecline={() => setDeclinedId(community.id)}
              onCompose={compose}
            />
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
