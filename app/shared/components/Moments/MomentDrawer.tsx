'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { ShareSheet, momentShare } from '@/app/shared/components/Share';
import { Drawer } from '@/components/ui/drawer';
import { Moment } from '@/types/moment';

import { MomentDetail } from './MomentDetail';

/**
 * A moment opened in the drawer, over whatever page the reader tapped it on.
 *
 * The caller holds the moment being shown. Closing the drawer calls onClose
 * with nothing selected, so the caller clears it.
 *
 * The header stays at the top of the panel while the moment scrolls under it.
 */
export const MomentDrawer = ({
  moment,
  onClose,
}: {
  moment: Moment | null;
  onClose: () => void;
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <Drawer
      isOpen={Boolean(moment)}
      setIsOpen={(isOpen) => {
        if (!isOpen) onClose();
      }}
      width="wide"
      mobile="full"
    >
      {/* A full-height column, so the comment composer inside sits at the foot of the drawer */}
      <div className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
          <h2 className="text-xl font-bold text-gray-900">Moment</h2>

          <div className="flex items-center gap-2">
            {moment && (
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                aria-label="Share"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand transition-colors hover:bg-surface-brand"
              >
                <IconComponent iconName="Share08Icon" size={20} color="currentColor" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-destructive transition-colors hover:bg-gray-200"
            >
              <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col px-4 pt-4">
          {moment && <MomentDetail key={moment.id} moment={moment} />}
        </div>
      </div>

      {/* ⚠️ A moment carries only its community's id and title, so one in a
          private community still gets the public note here. The link checks
          access when it is opened either way. */}
      {moment && isShareOpen && (
        <ShareSheet
          content={momentShare(moment)}
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
        />
      )}
    </Drawer>
  );
};
