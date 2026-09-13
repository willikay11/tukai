'use client';

import { useState } from 'react';

import { BookingPanel } from '@/app/(experiences)/experiences/components/BookingPanel';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Experience } from '@/types/experience';

type SheetView = 'reservation' | 'moments';

/**
 * The two things a reader can do on a phone, kept on screen at any scroll
 * position.
 *
 * Below `lg` the panel column is hidden entirely, so this bar is the only way
 * in — each button opens the panel in a sheet showing just that view, rather
 * than dropping the reader on a tab row to choose again.
 */
export const MobileBookingBar = ({ experience }: { experience: Experience }) => {
  const [openView, setOpenView] = useState<SheetView | null>(null);

  return (
    <>
      {/* Floating clear of every edge, and centred: the row is only as wide as
          its two buttons. Hidden from lg up, where the panel sits beside the
          content. */}
      <div className="fixed inset-x-4 bottom-4 z-40 flex justify-center lg:hidden">
        <div className="flex items-center gap-2 rounded-full bg-white p-[5px] shadow-top-md">
          <Button
            variant="gradient"
            onClick={() => setOpenView('moments')}
            className="h-11 rounded-full px-6"
          >
            Share Moment
          </Button>
          <Button
            variant="lime"
            onClick={() => setOpenView('reservation')}
            className="h-11 rounded-full px-6"
          >
            Reserve
          </Button>
        </div>
      </div>

      <Drawer isOpen={openView !== null} setIsOpen={(open) => !open && setOpenView(null)}>
        <div className="p-4">
          {openView && <BookingPanel experience={experience} view={openView} />}
        </div>
      </Drawer>
    </>
  );
};
