'use client';

import { useState } from 'react';

import { AddPlaceReviewAction } from '@/app/(places)/places/[placeId]/components/AddPlaceReviewAction';
import { IconComponent } from '@/app/shared/components/Icons';
import { PlanThisDrawer } from '@/app/shared/components/Plans/PlanThisDrawer';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { mapsHref } from '@/utils/maps';

/**
 * The three things a reader does with a place, pinned to the bottom of the
 * drawer so they stay reachable however far down the page has gone.
 */
export const PlaceDrawerFooter = ({ place }: { place: Place }) => {
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  const directions = mapsHref({
    lat: place.location?.pointLat,
    lng: place.location?.pointLong,
    query: [place.title, place.location?.city].filter(Boolean).join(', '),
  });

  return (
    <>
      <div className="flex items-center gap-3">
        <AddPlaceReviewAction
          placeId={place.id}
          placeTitle={place.title}
          label="Add review"
          variant="gradient"
          className="h-12 flex-shrink-0 rounded-full px-6 text-[15px] font-bold"
        />

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
