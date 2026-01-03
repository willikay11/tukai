'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/app/components/form';
import { PageLayoutContent } from '@/app/components/pageLayoutContent';
import { useUnsubscribe } from '@/hooks/comms';

function UnsubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your unsubscribe request...');
  const { mutateAsync: unsubscribeMutation } = useUnsubscribe();

  const handleUnsubscribe = useCallback(async () => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link. No token provided.');
      return;
    }

    const result = await unsubscribeMutation({ token });

    if (result.success) {
      setStatus('success');
      setMessage('You have been successfully unsubscribed from our emails.');
    } else {
      setStatus('error');
      setMessage(
        result.message ||
          'An error occurred while processing your request. Please try again later.',
      );
    }
  }, [searchParams, unsubscribeMutation]);

  useEffect(() => {
    handleUnsubscribe();
  }, [handleUnsubscribe]);

  return (
    <>
      <div className="mb-4">
        <p className="text-xl font-black text-gray-700">Unsubscribe</p>
        <p className="text-xs font-semibold text-gray-700">Manage your email preferences</p>
      </div>

      <div className="mb-4 mt-4 flex items-center justify-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-center text-sm text-gray-700">{message}</p>
            <p className="mt-2 text-center text-xs text-gray-500">
              You won&apos;t receive any more emails from us.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-center text-sm text-gray-700">{message}</p>
          </div>
        )}
      </div>

      <div
        className="-mx-[1.875rem] mb-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]"
        style={{ boxShadow: '0px -1px 4px 0px rgba(0, 0, 0, 0.12)' }}
      />

      <div className="mb-2.5">
        <Button block onClick={() => router.push('/')}>
          Return to Home
        </Button>
      </div>
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}
    >
      <PageLayoutContent>
        <UnsubscribeContent />
      </PageLayoutContent>
    </Suspense>
  );
}
