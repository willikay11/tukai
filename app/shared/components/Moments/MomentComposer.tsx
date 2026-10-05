'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import { MomentComposerForm, MomentContextProps } from './MomentComposerForm';

/**
 * Shares a moment at a place, a community or an experience.
 *
 * The context is fixed by whoever opens it — the experience page passes its own
 * id and title — so there is nothing to choose in here.
 *
 * This is the dialog around {@link MomentComposerForm}. A surface that would
 * rather show the form in place, as the place drawer does, renders that
 * directly instead of stacking a second panel over itself.
 */
export const MomentComposer = ({
  open,
  onOpenChange,
  ...context
}: MomentContextProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100%-24px)] max-w-[520px] rounded-2xl p-6 md:max-w-[520px]">
      <DialogTitle className="text-lg font-bold text-gray-900">New moment</DialogTitle>

      <MomentComposerForm {...context} onDone={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
