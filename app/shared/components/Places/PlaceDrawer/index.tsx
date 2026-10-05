'use client';

import { useMemo, useState } from 'react';

import { ClaimPlacePrompt } from '@/app/(places)/places/[placeId]/components/ClaimPlacePrompt';
import { PlaceReviewsSection } from '@/app/(places)/places/[placeId]/components/PlaceReviewsSection';
import { ContextMoments } from '@/app/shared/components/Moments';
import { usePlace, usePlaceOwnership } from '@/app/shared/hooks/usePlaces';
import { useScrollSpy } from '@/app/shared/hooks/useScrollSpy';
import { Drawer } from '@/components/ui/drawer';
import { Place } from '@/types/place';

import { PlaceAboutSection } from './PlaceAboutSection';
import { PlaceDrawerFooter } from './PlaceDrawerFooter';
import { PlaceDrawerHeader } from './PlaceDrawerHeader';
import { PlaceDrawerTabs } from './PlaceDrawerTabs';
import { UpcomingExperiences } from './UpcomingExperiences';
import { PLACE_SECTIONS, PLACE_SECTION_IDS, placeDrawerTabs } from './tabs';

/** The header and tabs a section has to clear before its pill lights up. */
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
 * A place, opened over whatever the reader was looking at.
 *
 * Every section is in the drawer at once and the tabs follow the reader down
 * it — the same anchor-tab pattern the community page uses, except the scroll
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

  const { data, isLoading } = usePlace(placeId, isOpen && Boolean(placeId));
  const place: Place | undefined = data?.data;

  // Only a 404 answered successfully means nobody owns it. A request that
  // failed, or was never made, is "we do not know" — and a place must never be
  // called unclaimed on that.
  const { data: ownership } = usePlaceOwnership(placeId ?? '', isOpen && Boolean(placeId));
  const isUnclaimed = ownership?.success === true && !ownership.data;

  const tabs = useMemo(() => placeDrawerTabs(place?.totalReviews ?? null), [place?.totalReviews]);
  const { activeId, scrollTo } = useScrollSpy(PLACE_SECTION_IDS, TAB_OFFSET, panel);

  return (
    <Drawer
      isOpen={isOpen}
      setIsOpen={(next) => !next && onClose()}
      width="wide"
      panelRef={setPanel}
    >
      {isLoading || !place ? (
        <Loading />
      ) : (
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-30 border-b border-line bg-white">
            <PlaceDrawerHeader place={place} onClose={onClose} />
          </div>

          <div className="sticky top-[76px] z-20 bg-white px-6 py-3">
            <PlaceDrawerTabs tabs={tabs} activeId={activeId} onSelect={scrollTo} />
          </div>

          <div className="flex-1 divide-y divide-line px-6">
            {/* scroll-mt clears the two sticky bars above */}
            <section id={PLACE_SECTIONS.about} className="scroll-mt-[148px] py-6">
              <PlaceAboutSection place={place} />
            </section>

            <section id={PLACE_SECTIONS.experiences} className="scroll-mt-[148px] py-6">
              <UpcomingExperiences placeId={place.id} placeTitle={place.title} />
            </section>

            <section id={PLACE_SECTIONS.moments} className="scroll-mt-[148px] py-6">
              <ContextMoments
                contextLabel={place.title}
                emptyMessage={`No moments from ${place.title} yet. Yours could be the first.`}
                placeId={place.id}
                placeLabel={place.title}
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

          <div className="sticky bottom-0 z-30 border-t border-line bg-white px-6 py-4">
            <PlaceDrawerFooter place={place} />
          </div>
        </div>
      )}
    </Drawer>
  );
};
