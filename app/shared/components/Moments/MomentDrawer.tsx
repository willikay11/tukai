'use client';

import { Drawer } from '@/components/ui/drawer';
import { Moment } from '@/types/moment';

import { MomentDetail } from './MomentDetail';

/**
 * A moment opened in the drawer, over whatever page the reader tapped it on.
 *
 * The caller holds the moment being shown. Closing the drawer calls onClose
 * with nothing selected, so the caller clears it.
 */
export const MomentDrawer = ({
  moment,
  onClose,
}: {
  moment: Moment | null;
  onClose: () => void;
}) => (
  <Drawer
    isOpen={Boolean(moment)}
    setIsOpen={(isOpen) => {
      if (!isOpen) onClose();
    }}
    width="wide"
    mobile="full"
  >
    <div className="px-4 pb-8 pt-4">
      {moment && <MomentDetail key={moment.id} moment={moment} />}
    </div>
  </Drawer>
);
