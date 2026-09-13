'use client';

import { useEffect, useRef } from 'react';

import { toast } from '@/app/shared/hooks/useToast';

export const Paystack = ({
  onPaymentSuccess,
  url,
}: {
  onPaymentSuccess: (paymentSuccess: boolean) => void;
  url: string;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!url) return;

    // Listen for postMessage events from Paystack
    const handleMessage = (event: MessageEvent) => {
      // Check if Paystack sends success/cancel events
      if (event.data?.status === 'success' || event.data?.event === 'success') {
        onPaymentSuccess(true);
      } else if (event.data?.status === 'cancelled' || event.data?.event === 'cancelled') {
        toast({
          title: 'Error',
          description: 'Payment was cancelled.',
          variant: 'destructive',
        });
        onPaymentSuccess(false);
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
          onPaymentSuccess(true);
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
  }, [url, onPaymentSuccess]);

  return (
    <iframe
      ref={iframeRef}
      src={url}
      width="100%"
      height="100%"
      className="rounded-lg border-0"
    />
  );
};
