'use client';

import { useEffect, useMemo, useState } from 'react';

import { ClaimPlacePrompt } from '@/app/(places)/places/[placeId]/components/ClaimPlacePrompt';
import { PlaceReviewsSection } from '@/app/(places)/places/[placeId]/components/PlaceReviewsSection';
import { ContextMoments, MomentComposerForm } from '@/app/shared/components/Moments';
import {
  usePlace,
  usePlaceAvailability,
  usePlaceManager,
  usePlaceOwnership,
  usePlaceReservationProfiles,
} from '@/app/shared/hooks/usePlaces';
import { useScrollSpy } from '@/app/shared/hooks/useScrollSpy';
import { Drawer } from '@/components/ui/drawer';
import { Place } from '@/types/place';
import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';

import { PlaceAboutSection } from './PlaceAboutSection';
import { PlaceDrawerFooter } from './PlaceDrawerFooter';
import { PlaceDrawerHeader } from './PlaceDrawerHeader';
import { PlaceDrawerTabs } from './PlaceDrawerTabs';
import { PlaceManagerBanner } from './PlaceManagerBanner';
import { PlaceReservationSettings } from './PlaceReservationSettings';
import { PlaceReviewForm } from './PlaceReviewForm';
import { UpcomingExperiences } from './UpcomingExperiences';
import { PLACE_SECTIONS, PLACE_SECTION_IDS, placeDrawerTabs } from './tabs';

/** The header and tabs a section has to clear before its pill lights up. */
const TAB_OFFSET = 140;

/** What the header says while the drawer is showing something other than the place. */
const VIEW_TITLES: Record<string, string | undefined> = {
  place: undefined,
  review: 'Add a review',
  moment: 'New moment',
  reservations: 'Reservation settings',
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
  onClose,
}: {
  placeId: string | null;
  isOpen: boolean;
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
  const [view, setView] = useState<'place' | 'review' | 'moment' | 'reservations'>('place');

  const { data, isLoading } = usePlace(placeId, isOpen && Boolean(placeId));
  const place: Place | undefined = data?.data;

  // Only a 404 answered successfully means nobody owns it. A request that
  // failed, or was never made, is "we do not know" - and a place must never be
  // called unclaimed on that.
  const { data: ownership } = usePlaceOwnership(placeId ?? '', isOpen && Boolean(placeId));
  const isUnclaimed = ownership?.success === true && !ownership.data;

  // A manager sees their own setup at the top, and the way into the settings
  const { isManager, owningCommunity } = usePlaceManager(isOpen && placeId ? placeId : '');

  const { data: profilesResponse } = usePlaceReservationProfiles(placeId ?? '', isManager);
  const profiles: PlaceReservationProfile[] = profilesResponse?.data?.results ?? [];
  // A place may hold two (restaurant and cinema); the live one is the one a
  // manager is being told about
  const profile = profiles.find((entry) => entry.status === 'active') ?? profiles[0];

  const { data: availability } = usePlaceAvailability(
    placeId ?? '',
    isManager ? profile?.id : undefined,
  );
  const rules: PlaceAvailabilityRule[] = availability?.data?.rules ?? [];

  useEffect(() => setView('place'), [placeId]);

  const tabs = useMemo(() => placeDrawerTabs(place?.totalReviews ?? null), [place?.totalReviews]);
  const { activeId, scrollTo } = useScrollSpy(PLACE_SECTION_IDS, TAB_OFFSET, panel);

  return (
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
            <div className="flex-1 px-6">
              <PlaceReservationSettings place={place} profile={profile} rules={rules} />
            </div>
          ) : view === 'moment' ? (
            <div className="flex-1 px-6 py-6">
              <MomentComposerForm
                contextLabel={place.title}
                contextKind="Place"
                placeId={place.id}
                onDone={() => setView('place')}
              />
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

                  <PlaceAboutSection place={place} />
                </section>

                <section id={PLACE_SECTIONS.experiences} className="scroll-mt-[148px] py-6">
                  <UpcomingExperiences placeId={place.id} placeTitle={place.title} />
                </section>

                <section id={PLACE_SECTIONS.moments} className="scroll-mt-[148px] py-6">
                  <ContextMoments
                    title="Moments"
                    contextLabel={place.title}
                    emptyMessage={`No moments from ${place.title} yet. Yours could be the first.`}
                    placeId={place.id}
                    placeLabel={place.title}
                    onShare={() => setView('moment')}
                  />
                </section>

                {isUnclaimed && (
                  <section className="py-6">
                    <ClaimPlacePrompt placeId={place.id} placeName={place.title} />
                  </section>
                )}

                <section id={PLACE_SECTIONS.reviews} className="scroll-mt-[148px] py-6">
                  <PlaceReviewsSection
                    placeId={place.id}
                    placeTitle={place.title}
                    rating={place.averageRating}
                    reviewCount={place.totalReviews}
                    // The footer pins Add review; a second one here would read as
                    // a different control
                    showAddReview={false}
                  />
                </section>
              </div>

              <div className="sticky bottom-0 z-30 border-t border-line bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                <PlaceDrawerFooter place={place} onAddReview={() => setView('review')} />
              </div>
            </>
          )}
        </div>
      )}
    </Drawer>
  );
};
