'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface LeaveDialogProps {
  open: boolean;
  isDiscarding?: boolean;
  onSaveDraftAndExit: () => void;
  onKeepEditing: () => void;
  onDiscardExperience: () => void;
}

/**
 * tk-confirm - shown when closing, navigating away or cancelling with
 * unsaved details. Every step already saves to the API immediately, so
 * "unsaved" here means "not yet published", not local-only form state.
 */
export const LeaveDialog = ({
  open,
  isDiscarding,
  onSaveDraftAndExit,
  onKeepEditing,
  onDiscardExperience,
}: LeaveDialogProps) => (
  <AlertDialog open={open} onOpenChange={(next) => !next && onKeepEditing()}>
    <AlertDialogContent className="max-w-[420px] gap-[22px] rounded-[18px] p-6">
      <AlertDialogHeader className="space-y-2 text-left sm:text-left">
        <AlertDialogTitle className="text-[21px] font-bold leading-tight tracking-[-0.3px] text-gray-800">
          Save your experience before you leave?
        </AlertDialogTitle>
        <AlertDialogDescription className="text-15 leading-relaxed text-ink-muted">
          You&rsquo;ve added details that aren&rsquo;t published yet. Save them as a draft to
          finish later from Host an experience, or discard them.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2 sm:space-x-0">
        <Button
          variant="gradient"
          onClick={onSaveDraftAndExit}
          className="h-12 w-full rounded-full text-15"
        >
          Save draft &amp; exit
        </Button>
        <button
          type="button"
          onClick={onKeepEditing}
          className="h-12 w-full rounded-full bg-surface text-15 font-semibold text-gray-800 hover:bg-[#EDEFEC]"
        >
          Keep editing
        </button>
        <Button
          variant="destructive"
          isLoading={isDiscarding}
          onClick={onDiscardExperience}
          className="h-12 w-full rounded-full bg-transparent text-15 text-danger hover:bg-danger-surface"
        >
          Discard experience
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
