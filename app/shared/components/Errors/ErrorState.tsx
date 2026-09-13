'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  // The error App Router hands the boundary
  error: Error & { digest?: string };
  // Re-renders the segment; the usual way back for a transient failure
  reset: () => void;
  title?: string;
  description?: string;
  // Where "go somewhere safe" leads
  homeHref?: string;
  homeLabel?: string;
}

export const ErrorState = ({
  error,
  reset,
  title = 'Something went wrong',
  description = 'This part of the page failed to load. You can try again, or head back and keep browsing.',
  homeHref = '/',
  homeLabel = 'Back to Discover',
}: ErrorStateProps) => {
  const router = useRouter();

  useEffect(() => {
    // Keep the real error in the console — the UI deliberately does not show
    // stack traces or messages, which can leak internals to users
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <IconComponent
          iconName="Alert01Icon"
          size={26}
          color="currentColor"
          className="text-red-500"
        />
      </div>

      <h2 className="mt-5 text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>

      {error?.digest && <p className="mt-2 text-xs text-gray-300">Reference: {error.digest}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="rounded-full px-6">
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(homeHref)}
          className="rounded-full px-6"
        >
          {homeLabel}
        </Button>
      </div>
    </div>
  );
};
