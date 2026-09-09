'use client';

import { useState } from 'react';

import { MomentComposer } from '@/app/shared/components/Moments';
import { usePlaceOwnership } from '@/app/shared/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';

import { ClaimPlacePrompt } from '../ClaimPlacePrompt';
import { ReservationPanel } from '../ReservationPanel';

type SheetView = 'reservation' | 'claim';

/**
 * The two things a reader can do at a place on a phone, kept on screen at any
 * scroll position.
 *
 * Below `lg` the reservation column is hidden entirely, so this bar is the
 * only way in to booking. Sharing a moment opens the composer itself — the
 * moments posted here are already a section of the page, so a list in between
 * would be a step to nowhere.
 *
 * A place nobody has claimed cannot take reservations at all, so offering
 * "Reserve" there leads to a disabled button. It offers the way out of that
 * state instead, and explains what claiming is before asking for anything.
 */
export const MobilePlaceBar = ({ placeId, placeName }: { placeId: string; placeName: string }) => {
  const [openView, setOpenView] = useState<SheetView | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // `data` is null for a place the API returned 404 for — nobody owns it.
  // While it loads the bar keeps its usual label rather than flickering.
  const { data: ownership, isLoading: isLoadingOwnership } = usePlaceOwnership(placeId);
  const isUnclaimed = !isLoadingOwnership && !ownership?.data;

  return (
    <>
      {/* Floating clear of every edge, and centred: the row is only as wide as
          its two buttons. Hidden from lg up, where the panel sits beside the
          content. */}
      <div className="fixed inset-x-4 bottom-4 z-40 flex justify-center lg:hidden">
        <div className="flex items-center gap-2 rounded-full bg-white p-[5px] shadow-top-md">
          <Button
            variant="gradient"
            onClick={() => setIsComposerOpen(true)}
            className="h-11 rounded-full px-6"
          >
            Share Moment
          </Button>
          <Button
            variant="lime"
            onClick={() => setOpenView(isUnclaimed ? 'claim' : 'reservation')}
            className="h-11 rounded-full px-6"
          >
            {isUnclaimed ? 'Claim this place' : 'Reserve'}
          </Button>
        </div>
      </div>

      <Drawer isOpen={openView !== null} setIsOpen={(open) => !open && setOpenView(null)}>
        <div className="p-4">
          {openView === 'reservation' && (
            <ReservationPanel placeId={placeId} placeName={placeName} />
          )}
          {openView === 'claim' && <ClaimPlacePrompt placeId={placeId} placeName={placeName} />}
        </div>
      </Drawer>

      <MomentComposer
        open={isComposerOpen}
        onOpenChange={setIsComposerOpen}
        contextLabel={placeName}
        placeId={placeId}
      />
    </>
  );
};
