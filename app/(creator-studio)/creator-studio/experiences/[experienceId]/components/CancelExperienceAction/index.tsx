'use client';

import { useState } from 'react';

import { ExperienceCreatedModal } from '@/app/(experiences)/experiences/create/components/ExperienceCreatedModal';
import { IconComponent } from '@/app/shared/components/Icons';
import { useCancelExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

/**
 * Cancelling a live experience. The API refunds any completed purchases, which
 * cannot be undone from here, so it is confirmed first and then confirmed back
 * with the same modal the create flow ends on.
 */
export const CancelExperienceAction = ({
  experienceId,
  experienceTitle,
}: {
  experienceId: string;
  experienceTitle: string;
}) => {
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelledModalOpen, setIsCancelledModalOpen] = useState(false);

  const { mutate: cancelExperience, isPending } = useCancelExperience(experienceId);

  const handleCancel = () =>
    cancelExperience(undefined, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        setIsCancelledModalOpen(true);
      },
      onError: (error: Error) =>
        toast({
          title: 'Could not cancel this experience',
          description: error.message,
          variant: 'destructive',
        }),
    });

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="text-sm font-semibold text-destructive hover:text-destructive/80"
      >
        Cancel Experience
      </button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="max-w-md gap-5 rounded-2xl p-6">
          <AlertDialogHeader className="space-y-4 text-left sm:text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <IconComponent
                iconName="Alert02Icon"
                size={20}
                color="currentColor"
                className="text-red-500"
              />
            </span>

            <div className="space-y-2">
              <AlertDialogTitle className="text-lg font-bold text-gray-900">
                Cancel this experience?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-gray-500">
                &ldquo;{experienceTitle?.trim() || 'This experience'}&rdquo; will be cancelled and
                everyone who has already paid will be refunded. This cannot be undone.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-3">
            {/* Plain text, so the destructive action is the only thing that
                reads as a button */}
            <AlertDialogCancel className="border-0 bg-transparent font-medium text-gray-600 shadow-none hover:bg-transparent hover:text-gray-900">
              Keep experience
            </AlertDialogCancel>
            {/* Not AlertDialogAction: that closes the dialog on click, which
                would hide the spinner while the request is still in flight */}
            <Button
              variant="destructive"
              isLoading={isPending}
              onClick={handleCancel}
              className="rounded-lg px-5"
            >
              Cancel experience
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExperienceCreatedModal
        open={isCancelledModalOpen}
        onOpenChange={setIsCancelledModalOpen}
        href="/creator-studio"
        title="Experience Cancelled Successfully"
        description={`"${experienceTitle}" has been cancelled and anyone who paid is being refunded. Your guests will be notified.`}
        viewExperienceLabel="Back to Creator Studio"
      />
    </div>
  );
};
