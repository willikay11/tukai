'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { toast } from '@/app/shared/hooks/useToast';
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
  // Shares the moment's own URL, which opens it again for whoever follows it
  const share = async (item: Moment) => {
    const url = `${window.location.origin}/moments?momentId=${item.id}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Moment', url });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied' });
    } catch (error) {
      // Dismissing the share sheet rejects the promise; that is not a failure
      if (error instanceof DOMException && error.name === 'AbortError') return;

      toast({
        title: 'Could not share',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

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
                onClick={() => share(moment)}
                aria-label="Share moment"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
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
    </Drawer>
  );
};
