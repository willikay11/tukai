'use client';

import IconComponent from '@/app/components/iconComponent';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';
import { Button } from './button';

export default function PaymentSuccess({
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: (goToInviteGuests: boolean) => void;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={() => closeModal(false)}>
      <AlertDialogContent className="flex h-[21rem] w-[30rem] max-w-none flex-col items-center justify-center gap-4 p-0">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <IconComponent iconName="PaymentSuccess01TwotoneRounded" size={56} color="green" />
        </div>
        <p className="text-xl font-bold text-gray-700">Payment Made Successfully</p>
        <div className="flex flex-col items-center gap-2 px-6">
          <p className="text-sm text-gray-700">Your payment was made successfully.</p>
          <p className="text-sm text-gray-700">
            You can proceed to view the experience and invite guests
          </p>
          <Button onClick={() => closeModal(true)} className="mt-2.5 h-[54px] w-full">
            Invite Guests
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
