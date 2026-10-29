'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  ContextMoments,
  MomentComposerForm,
  MomentDrawer,
  useMomentComposer,
} from '@/app/shared/components/Moments';
import { ClaimCard } from '@/app/shared/components/Places/ClaimCard';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import {
  usePlace,
  usePlaceAvailability,
  usePlaceBookingRequests,
  usePlaceManager,
  usePlaceReservationProfiles,
} from '@/app/shared/hooks/usePlaces';
import { useScrollSpy } from '@/app/shared/hooks/useScrollSpy';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { Experience } from '@/types/experience';
import { Place } from '@/types/place';
import {
  PlaceAvailabilityException,
  PlaceAvailabilityRule,
  PlaceReservationProfile,
} from '@/types/placeReservation';

import { HappeningNow } from './HappeningNow';
import { HoldOffReservations } from './HoldOffReservations';
import { HostReservations } from './HostReservations';
import { HostReservationsSection } from './HostReservationsSection';
import { MyReservations } from './MyReservations';
import { PlaceAboutSection } from './PlaceAboutSection';
import { PlaceBookingForm } from './PlaceBookingForm';
import { PlaceCommunity } from './PlaceCommunity';
import { PlaceDrawerFooter } from './PlaceDrawerFooter';
import { PlaceDrawerHeader } from './PlaceDrawerHeader';
import { PlaceDrawerReviews } from './PlaceDrawerReviews';
import { PlaceDrawerTabs } from './PlaceDrawerTabs';
import { PlaceManagerBanner } from './PlaceManagerBanner';
import { PlaceReservationSettings } from './PlaceReservationSettings';
import { PlaceReviewForm } from './PlaceReviewForm';
import { UpcomingExperiences } from './UpcomingExperiences';
import { UPCOMING_PAGE_SIZE } from './UpcomingExperiences';
import { HostReservationGroup, hostReservations } from './host-reservations';
import { PLACE_SECTIONS, placeDrawerTabs } from './tabs';

/** The header and tabs a section has to clear before its pill lights up. */
const TAB_OFFSET = 140;

/** What the header says while the drawer is showing something other than the place. */
const VIEW_TITLES: Record<string, string | undefined> = {
  place: undefined,
  review: 'Add a review',
  moment: 'New moment',
  reservations: 'Reservation settings',
  requests: 'Reservations',
  'hold-off': 'Hold off reservations',
  booking: 'Make a booking',
};

const Loading = () => (
  <div className="space-y-4 px-6 py-6">
    <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
    <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-gray-200" />
    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
  </div>
);

/**
 * A place, opened over whatever the reader was looking at.
 *
 * Every section is in the drawer at once and the tabs follow the reader down
 * it - the same anchor-tab pattern the community page uses, except the scroll
 * container is the panel rather than the window.
 */
export const PlaceDrawer = ({
  placeId,
  isOpen,
  initialView,
  onClose,
}: {
  placeId: string | null;
  isOpen: boolean;
  initialView?: 'reservations';
  onClose: () => void;
}) => {
  // The panel itself, held in state rather than a ref: it mounts only once the
  // drawer opens, and a ref would never tell the scroll spy it had arrived
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);

  /**
   * Writing a review and sharing a moment each take the drawer over rather
   * than opening a second one on top of it. Both reset whenever the drawer
   * opens on a different place.
   */
  const [view, setView] = useState<
    'place' | 'review' | 'moment' | 'reservations' | 'requests' | 'hold-off' | 'booking'
  >('place');

  const { data, isLoading } = usePlace(placeId, isOpen && Boolean(placeId));
  const place: Place | undefined = data?.data;

  // Only an explicit null means no claim has been approved. A place that has
  // not loaded, or whose response carries no owner field, is "we do not know" -
  // and a place must never be called unclaimed on that.
  const isUnclaimed = place?.verifiedOwner === null;

  // A manager sees their own setup at the top, and the way into the settings
  const { isManager, owningCommunity } = usePlaceManager(isOpen && placeId ? placeId : '');

  // Public to anyone, and a reader's own bookings hang off the profile, so it is
  // read for every reader rather than only a manager
  const { data: profilesResponse } = usePlaceReservationProfiles(
    placeId ?? '',
    isOpen && Boolean(placeId),
  );
  const profiles: PlaceReservationProfile[] = profilesResponse?.data?.results ?? [];
  // A place may hold two (restaurant and cinema); the settings and the host
  // screens work on the table profile
  const profile =
    profiles.find((entry) => entry.reservationType === 'restaurant_reservation') ?? profiles[0];

  // Only a live table profile takes bookings; a draft or paused one is the
  // manager's business alone
  const bookingProfile = profiles.find(
    (entry) => entry.reservationType === 'restaurant_reservation' && entry.status === 'active',
  );

  const { data: availability } = usePlaceAvailability(
    placeId ?? '',
    isManager ? profile?.id : bookingProfile?.id,
  );
  const rules: PlaceAvailabilityRule[] = availability?.data?.rules ?? [];
  const exceptions: PlaceAvailabilityException[] = availability?.data?.exceptions ?? [];
  const canBook = !isManager && Boolean(bookingProfile) && rules.length > 0;

  const { data: requestsResponse } = usePlaceBookingRequests(
    placeId ?? '',
    isManager ? profile?.id : undefined,
  );
  const reservations = useMemo(
    () => hostReservations(requestsResponse?.data?.results ?? []),
    [requestsResponse],
  );
  const [requestsTarget, setRequestsTarget] = useState<{
    day?: string;
    group?: HostReservationGroup;
  }>({});
  const hasReservationsSection = isManager && Boolean(profile);

  useEffect(() => setView(initialView ?? 'place'), [placeId, initialView]);

  // "Start claim" (ClaimCard, below) opens the global Connect-a-place
  // drawer - a second, separate `Drawer`, not a view this one swaps to in
  // place like review/moment/reservations do. Both are the same portaled,
  // fixed-position component, and the global one is mounted once at the app
  // root, so this drawer (mounted per-page, later) always paints over it at
  // the same z-index. Closing this drawer the moment that one opens keeps
  // the same "takes it over, never stacks" rule the other views already
  // follow, just via two drawers handing off rather than one swapping
  // content.
  const connectDrawer = useConnectPlaceDrawer();
  useEffect(() => {
    if (connectDrawer?.isOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectDrawer?.isOpen]);

  // The same request UpcomingExperiences makes, so React Query shares the one
  // response. It only decides whether the Experiences tab and section exist.
  const { data: experiencesResponse } = useExperiences(
    { page: 1, page_size: UPCOMING_PAGE_SIZE, place: placeId ?? '', status: 'published' },
    isOpen && Boolean(placeId),
  );
  const experiences: Experience[] = experiencesResponse?.data?.results ?? [];
  const hasExperiences = experiences.length > 0;

  const tabs = useMemo(
    () => placeDrawerTabs(place?.totalReviews ?? null, hasExperiences, hasReservationsSection),
    [place?.totalReviews, hasExperiences, hasReservationsSection],
  );
  // The spy re-runs on a change of identity, so the ids are kept stable
  const sectionIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
  const { activeId, scrollTo } = useScrollSpy(sectionIds, TAB_OFFSET, panel);

  // Driven directly rather than through MomentComposer: the "New moment" view
  // takes over this drawer's own header instead of stacking a second panel
  const momentComposer = useMomentComposer({ contextLabel: place?.title, placeId: place?.id }, () =>
    setView('place'),
  );

  return (
    <>
      <Drawer
        isOpen={isOpen}
        setIsOpen={(next) => !next && onClose()}
        width="wide"
        // Half a dozen sections deep: on a phone it takes the whole screen
        // rather than a sheet spending its height on the page behind it
        mobile="full"
        panelRef={setPanel}
      >
        {isLoading || !place ? (
          <Loading />
        ) : (
          <div className="flex min-h-full flex-col">
            <div className="sticky top-0 z-30 bg-white">
              <PlaceDrawerHeader
                place={place}
                onClose={onClose}
                title={VIEW_TITLES[view]}
                onBack={view === 'place' ? undefined : () => setView('place')}
              />
            </div>

            {view === 'place' && (
              <div className="sticky top-[68px] z-20 bg-white px-6 py-3">
                <PlaceDrawerTabs tabs={tabs} activeId={activeId} onSelect={scrollTo} />
              </div>
            )}

            {view === 'review' ? (
              <div className="flex-1 px-6">
                <PlaceReviewForm place={place} onDone={() => setView('place')} />
              </div>
            ) : view === 'reservations' ? (
              <PlaceReservationSettings
                place={place}
                profile={profile}
                rules={rules}
                onClose={() => setView('place')}
              />
            ) : view === 'requests' && profile ? (
              <HostReservations
                place={place}
                profile={profile}
                initialDay={requestsTarget.day}
                initialGroup={requestsTarget.group}
                onOpenHoldOff={() => setView('hold-off')}
                onOpenSettings={() => setView('reservations')}
              />
            ) : view === 'hold-off' && profile ? (
              <HoldOffReservations
                placeId={place.id}
                profile={profile}
                rules={rules}
                exceptions={exceptions}
              />
            ) : view === 'booking' && bookingProfile ? (
              <PlaceBookingForm
                place={place}
                profile={bookingProfile}
                availability={{ rules, exceptions }}
                onDone={() => setView('place')}
              />
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
                <div className="flex-1 divide-y divide-line px-6">
                  {/* scroll-mt clears the two sticky bars above */}
                  <section id={PLACE_SECTIONS.about} className="scroll-mt-[148px] space-y-6 py-6">
                    {isManager && (
                      <PlaceManagerBanner
                        communityName={owningCommunity?.title}
                        profile={profile}
                        rules={rules}
                        onOpenSettings={() => setView('reservations')}
                      />
                    )}

                    <PlaceAboutSection
                      place={place}
                      onReviewsClick={() => scrollTo(PLACE_SECTIONS.reviews)}
                    />
                  </section>

                  {hasReservationsSection && profile && (
                    <section id={PLACE_SECTIONS.reservations} className="scroll-mt-[148px] py-6">
                      <HostReservationsSection
                        reservations={reservations}
                        profile={profile}
                        exceptions={exceptions}
                        onOpen={(day, group) => {
                          setRequestsTarget({ day, group });
                          setView('requests');
                        }}
                      />
                    </section>
                  )}

                  {/* Each renders nothing unless it has something to say */}
                  <MyReservations place={place} profile={profile} />
                  <PlaceCommunity communityId={place.verifiedOwner?.id ?? ''} />

                  {hasExperiences && (
                    <section id={PLACE_SECTIONS.experiences} className="scroll-mt-[148px] py-6">
                      <HappeningNow experiences={experiences} placeTitle={place.title} />
                      <UpcomingExperiences placeId={place.id} placeTitle={place.title} />
                    </section>
                  )}

                  <section id={PLACE_SECTIONS.moments} className="scroll-mt-[148px] py-6">
                    <ContextMoments
                      title="Moments"
                      variant="panel"
                      contextLabel={place.title}
                      emptyMessage={`No moments from ${place.title} yet. Yours could be the first.`}
                      placeId={place.id}
                      placeLabel={place.title}
                      onShare={() => setView('moment')}
                    />
                  </section>

                  {isUnclaimed && (
                    <section className="py-6">
                      <ClaimCard placeId={place.id} placeName={place.title} />
                    </section>
                  )}

                  <section id={PLACE_SECTIONS.reviews} className="scroll-mt-[148px] py-6">
                    <PlaceDrawerReviews
                      placeId={place.id}
                      rating={place.averageRating}
                      reviewCount={place.totalReviews}
                    />
                  </section>
                </div>

                <div className="sticky bottom-0 z-30 border-t border-surface-muted bg-white px-6 pb-[calc(12px_+_env(safe-area-inset-bottom))] pt-3">
                  <PlaceDrawerFooter
                    place={place}
                    onAddReview={() => setView('review')}
                    onBook={canBook ? () => setView('booking') : undefined}
                    isManager={isManager}
                    onNavigate={onClose}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* Opens in place of a toast once a shared moment succeeds - the moment
          itself is the confirmation */}
      <MomentDrawer
        moment={momentComposer.sharedMoment}
        onClose={momentComposer.onCloseSharedMoment}
      />
    </>
  );
};
