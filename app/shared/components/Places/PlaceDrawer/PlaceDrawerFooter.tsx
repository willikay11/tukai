'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

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
  onAddReview,
}: {
  place: Place;
  /** Swaps the drawer over to the review form, rather than opening a second
   *  drawer on top of this one. */
  onAddReview: () => void;
}) => {
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const { data: session } = useSession();
  const { setOpenSignIn } = useAuthDialog();

  const directions = mapsHref({
    lat: place.location?.pointLat,
    lng: place.location?.pointLong,
    query: [place.title, place.location?.city].filter(Boolean).join(', '),
  });

  return (
    <>
      {/* Scrolls rather than wraps: three pills do not fit a phone, and a
          second row would push the content above them off the screen */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
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
          className="h-12 flex-shrink-0 rounded-full px-6 text-[15px] font-bold"
        >
          <IconComponent iconName="StarIcon" size={16} color="currentColor" />
          Add a review
        </Button>

        {directions && (
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 flex-shrink-0 items-center gap-2.5 rounded-full bg-lime px-6 text-[15px] font-bold text-brand-ink transition-colors hover:bg-lime-dark"
          >
            <IconComponent iconName="Navigation03Icon" size={20} color="currentColor" />
            Get directions
          </a>
        )}

        <button
          type="button"
          onClick={() => setIsPlanOpen(true)}
          className="inline-flex h-12 flex-shrink-0 items-center gap-2.5 rounded-full bg-surface-brand px-6 text-[15px] font-bold text-brand-ink transition-colors hover:bg-surface-tab"
        >
          <IconComponent iconName="CalendarAdd01Icon" size={20} color="currentColor" />
          Plan this
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
