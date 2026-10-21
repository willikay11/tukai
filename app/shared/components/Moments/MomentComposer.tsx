'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';

import { MomentComposerForm } from './MomentComposerForm';
import { MomentContextProps, useMomentComposer } from './useMomentComposer';

/**
 * Shares a moment at a place, a community or an experience, in the drawer the
 * canvas calls "New moment" - the side panel on a wide screen, a bottom sheet
 * on a phone.
 *
 * The context is fixed by whoever opens it - the experience page passes its
 * own id and title - so there is nothing to search for or choose in here; see
 * {@link useMomentComposer}. A surface that would rather show the form in
 * place, as the place drawer does, drives the hook itself and renders
 * {@link MomentComposerForm} directly instead of stacking a second panel over
 * itself.
 */
export const MomentComposer = ({
  open,
  onOpenChange,
  ...context
}: MomentContextProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const composer = useMomentComposer(context, () => onOpenChange(false));

  return (
    <Drawer isOpen={open} setIsOpen={onOpenChange} width="narrow">
      <div className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-line bg-white px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-2xl font-bold tracking-[-0.4px] text-gray-800">
            New moment
          </h2>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger hover:bg-danger-surface"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <MomentComposerForm {...composer} />
        </div>

        <footer className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-line bg-white px-6 py-[18px]">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
          >
            Cancel
          </button>

          <span className="flex-1" aria-hidden="true" />

          <Button
            type="button"
            variant="lime"
            onClick={composer.handleShare}
            disabled={!composer.canShare}
            isLoading={composer.isPending}
            className="h-12 rounded-full px-6 text-[15px] disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:opacity-100"
          >
            Share moment
          </Button>
        </footer>
      </div>
    </Drawer>
  );
};
