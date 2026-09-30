'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { useDeletePromoCode } from '@/app/shared/hooks/usePromoCodes';
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
import { PromoCode } from '@/types/promoCode';

/**
 * Deleting a code for good.
 *
 * Pausing is the reversible answer and sits on the row beside this, so the only
 * reason to reach here is to be rid of the code — which is why the count of
 * people who have already used it is said out loud first. Their purchases are
 * not affected; the code simply stops working.
 */
export const DeleteDiscountCodeDialog = ({
  code,
  onClose,
}: {
  code: PromoCode | null;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const { mutate: deleteCode, isPending } = useDeletePromoCode();

  const remove = () => {
    if (!code) return;

    deleteCode(code.id, {
      onSuccess: () => {
        toast({
          title: `${code.code} is deleted`,
          description: 'It no longer works for anyone who has it.',
          variant: 'success',
        });
        onClose();
      },
      onError: (error: Error) =>
        toast({
          title: 'Could not delete this code',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  const redeemed = code?.redeemedCount ?? 0;

  return (
    <AlertDialog open={Boolean(code)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md gap-5 rounded-2xl p-6">
        <AlertDialogHeader className="space-y-4 text-left sm:text-left">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-surface">
            <IconComponent
              iconName="Alert02Icon"
              size={20}
              color="currentColor"
              className="text-danger"
            />
          </span>

          <div className="space-y-2">
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Delete {code?.code}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-gray-500">
              {redeemed > 0
                ? `${redeemed} ${redeemed === 1 ? 'person has' : 'people have'} already used this code. They keep their tickets, but the code will stop working for everyone else. This cannot be undone — pause it instead if you may want it back.`
                : 'This code will stop working for anyone who has it. This cannot be undone — pause it instead if you may want it back.'}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-3">
          <AlertDialogCancel className="border-0 bg-transparent font-medium text-gray-600 shadow-none hover:bg-transparent hover:text-gray-900">
            Keep code
          </AlertDialogCancel>
          {/* Not AlertDialogAction: that closes on click, hiding the spinner
              while the request is still in flight */}
          <Button
            variant="destructive"
            isLoading={isPending}
            onClick={remove}
            className="rounded-lg px-5"
          >
            Delete code
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
