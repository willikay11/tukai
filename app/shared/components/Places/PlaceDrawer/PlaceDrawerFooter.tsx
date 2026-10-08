'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { PlanThisDrawer } from '@/app/shared/components/Plans/PlanThisDrawer';
import { Button } from '@/components/ui/button';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { mapsHref } from '@/utils/maps';

/**
 * The three things a reader does with a place, pinned to the bottom of the
 * drawer so they stay reachable however far down the page has gone.
 */
export const PlaceDrawerFooter = ({
  place,
  canReserve,
  onAddReview,
}: {
  place: Place;
  /**
   * A diner can book a table here - the lime button becomes Make reservation
   * rather than Get directions, same as the design's restaurant-and-claimed
   * case.
   */
  canReserve: boolean;
  /** Swaps the drawer over to the review form, rather than opening a second
   *  drawer on top of this one. */
  onAddReview: () => void;
}) => {
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const { data: session } = useSession();
  const { setOpenSignIn, openSignInWithCallback } = useAuthDialog();
  const router = useRouter();

  const directions = mapsHref({
    lat: place.location?.pointLat,
    lng: place.location?.pointLong,
    query: [place.title, place.location?.city].filter(Boolean).join(', '),
  });

  const reservePath = `/places/${place.id}/reserve`;
  // Reserving needs an account, same as adding a review; the dialog returns
  // them to the reserve page rather than to a sign-in page they would have to
  // navigate back from
  const startReservation = () => {
    if (!session?.user?.id) {
      openSignInWithCallback(() => router.push(reservePath));
      return;
    }
    router.push(reservePath);
  };

  return (
    <>
      {/* Scrolls rather than wraps: three pills do not fit a phone, and a
          second row would push the content above them off the screen */}
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide">
        <Button
          type="button"
          variant="gradient"
          onClick={() => {
            // Reviewing needs an account; the dialog returns them here rather
            // than to a sign-in page they have to navigate back from
            if (!session?.user?.id) {
              setOpenSignIn(true);
              return;
            }
            onAddReview();
          }}
          className="h-12 flex-shrink-0 rounded-full px-6 text-[15px] font-semibold"
        >
          <IconComponent iconName="StarIcon" size={20} color="currentColor" />
          Add review
        </Button>

        {canReserve ? (
          <button
            type="button"
            onClick={startReservation}
            className="inline-flex h-12 flex-shrink-0 items-center gap-2 rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink transition hover:bg-lime-dark hover:shadow-lime-glow-sm"
          >
            <IconComponent iconName="Calendar03Icon" size={20} color="currentColor" />
            Make reservation
          </button>
        ) : (
          directions && (
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 flex-shrink-0 items-center gap-2 rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink transition hover:bg-lime-dark hover:shadow-lime-glow-sm"
            >
              <IconComponent iconName="Navigation03Icon" size={20} color="currentColor" />
              Get directions
            </a>
          )
        )}

        {/* Icon only on a phone-width screen, where the three buttons do not
            fit with their labels. The label returns from 720px, as the design does. */}
        <button
          type="button"
          onClick={() => setIsPlanOpen(true)}
          aria-label="Plan this"
          className="inline-flex h-12 min-w-12 flex-shrink-0 items-center justify-center gap-2 rounded-full bg-surface-brand px-0 text-[15px] font-semibold text-brand transition-colors hover:bg-surface-tab min-[720px]:px-[18px]"
        >
          <IconComponent iconName="CalendarAdd01Icon" size={20} color="currentColor" />
          <span className="hidden min-[720px]:inline">Plan this</span>
        </button>
      </div>

      <PlanThisDrawer
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        subject={{
          kind: 'place',
          refId: place.id,
          title: place.title,
          subtitle: place.location?.city ?? undefined,
          photo: coverPhotoUrl(place.photos, 'md'),
        }}
      />
    </>
  );
};
