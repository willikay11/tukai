'use client';

import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Paystack({ isOpen, closeModal, url }: { isOpen: boolean, closeModal: () => void, url: string }) {
  return (
    <AlertDialog open={isOpen}>
        <AlertDialogContent className="w-[40rem] h-[36rem] max-w-none p-0">
            <iframe
                src={url}
                width="100%"
                height="100%"
                className="border-0"
            />
        </AlertDialogContent>
    </AlertDialog>
  );
}
