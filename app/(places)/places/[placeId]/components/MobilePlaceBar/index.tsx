'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { MomentComposer } from '@/app/shared/components/Moments';
import { usePlaceManager, usePlaceOwnership } from '@/app/shared/hooks/usePlaces';
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
 *
 * To the community that owns the place the sheet is the manage panel, so the
 * button names that job rather than one its reader will not do.
 */
export const MobilePlaceBar = ({ placeId, placeName }: { placeId: string; placeName: string }) => {
  const [openView, setOpenView] = useState<SheetView | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Asked only of a signed-in reader: the endpoint 401s without a token, and
  // claiming needs an account anyway
  const { data: session } = useSession();
  const { data: ownership, isLoading: isLoadingOwnership } = usePlaceOwnership(
    placeId,
    Boolean(session?.user?.id),
  );

  // Only a 404 answered successfully means nobody owns it. A request that
  // failed, or was never made, leaves the bar on its usual label rather than
  // announcing the place is unclaimed.
  const isUnclaimed = !isLoadingOwnership && ownership?.success === true && !ownership.data;

  // The sheet holds the reservation panel either way — it resolves an owner to
  // the manage actions itself — so only the label has to know
  const { isManager } = usePlaceManager(placeId);

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
            {isUnclaimed ? 'Claim this place' : isManager ? 'Manage place' : 'Reserve'}
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
