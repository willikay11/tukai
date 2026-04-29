'use client';

import { useEffect, useRef } from 'react';

import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { toast } from '@/app/shared/hooks/useToast';

export const Paystack = ({
  isOpen,
  closeModal,
  url,
}: {
  isOpen: boolean;
  closeModal: (paymentSuccess: boolean) => void;
  url: string;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Listen for postMessage events from Paystack
    const handleMessage = (event: MessageEvent) => {
      // Check if Paystack sends success/cancel events
      if (event.data?.status === 'success' || event.data?.event === 'success') {
        closeModal(true);
      } else if (event.data?.status === 'cancelled' || event.data?.event === 'cancelled') {
        toast({
          title: 'Error',
          description: 'Payment was cancelled.',
          variant: 'destructive',
        });
        closeModal(false);
      }
    };

    window.addEventListener('message', handleMessage);

    // Fallback: Poll iframe accessibility (limited by same-origin policy)
    const pollInterval = setInterval(() => {
      try {
        const iframeWindow = iframeRef.current?.contentWindow;
        // This will throw an error if cross-origin
        const iframeUrl = iframeWindow?.location.href;

        // Check if URL indicates completion (adjust based on Paystack's redirect URLs)
        if (iframeUrl?.includes('success') || iframeUrl?.includes('callback')) {
          closeModal(true);
          clearInterval(pollInterval);
        }
      } catch (e) {
        // Cross-origin access blocked - this is expected
        // You won't be able to read the URL directly
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(pollInterval);
    };
  }, [isOpen, closeModal]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="h-[80vh] w-[calc(100%-32px)] rounded-lg p-0 sm:h-[36rem] sm:w-[40rem] sm:max-w-none">
        <iframe
          ref={iframeRef}
          src={url}
          width="100%"
          height="100%"
          className="rounded-lg border-0"
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};

