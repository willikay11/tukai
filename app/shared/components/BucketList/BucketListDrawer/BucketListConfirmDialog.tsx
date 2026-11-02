'use client';

import { useRef } from 'react';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { PhotoImage } from '@/app/shared/components/Images';
import { Button } from '@/components/ui/button';

import { BucketListConfirmCopy } from './bucket-list-drawer';

/**
 * The one confirm the bucket list screens share - delete, leave, remove a
 * member, cancel an invite.
 *
 * Built from the Radix primitives rather than the app's AlertDialogContent,
 * which brings its own black scrim: this one is the canvas's green-tinted
 * scrim, and tapping it cancels. Radix already traps focus, closes on Escape
 * and hands focus back to whatever opened it; focus starts on the safe choice.
 */
export const BucketListConfirmDialog = ({
  copy,
  photo,
  isPending,
  onConfirm,
  onCancel,
}: {
  /** Null while closed. */
  copy: BucketListConfirmCopy | null;
  /** The person's photo, for remove and cancel invite. */
  photo?: string | null;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const keepRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialogPrimitive.Root open={Boolean(copy)} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogPrimitive.Portal>
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-6">
          <AlertDialogPrimitive.Overlay
            aria-hidden="true"
            onClick={onCancel}
            className="absolute inset-0 bg-[rgba(1,51,52,.42)]"
          />

          <AlertDialogPrimitive.Content
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              keepRef.current?.focus();
            }}
            className="relative flex w-full max-w-[420px] flex-col gap-[22px] rounded-[18px] bg-white p-6 shadow-[0_24px_60px_rgba(1,51,52,.24)]"
          >
            {copy && (
              <>
                <div className="flex flex-col gap-2">
                  {photo !== undefined && (
                    <span className="relative mb-2 block h-16 w-16 overflow-hidden rounded-full bg-surface-brand">
                      <PhotoImage
                        src={photo ?? undefined}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                  )}
                  <AlertDialogPrimitive.Title className="text-[21px] font-bold leading-[1.3] tracking-[-0.3px] text-gray-800 [text-wrap:pretty]">
                    {copy.title}
                  </AlertDialogPrimitive.Title>
                  <AlertDialogPrimitive.Description className="text-[15px] leading-[1.55] text-ink-muted [text-wrap:pretty]">
                    {copy.body}
                  </AlertDialogPrimitive.Description>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    isLoading={isPending}
                    onClick={onConfirm}
                    className="h-12 w-full rounded-full bg-danger text-[15px] font-semibold text-white hover:bg-[#C81E2E] active:scale-[.98]"
                  >
                    {copy.confirmLabel}
                  </Button>
                  <button
                    ref={keepRef}
                    type="button"
                    onClick={onCancel}
                    className="h-12 w-full rounded-full bg-surface text-[15px] font-semibold text-gray-800 transition-colors hover:bg-[#EDEFEC]"
                  >
                    {copy.cancelLabel}
                  </button>
                </div>
              </>
            )}
          </AlertDialogPrimitive.Content>
        </div>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};
