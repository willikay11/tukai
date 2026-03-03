'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import IconComponent from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <IconComponent iconName="AlertCircleIcon" size={32} color="#EF4444" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mb-8 text-sm text-gray-600">
          We encountered an unexpected error. Don't worry, you can try again or navigate back to
          safety.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="rounded-full px-6 text-sm text-white"
          >
            <IconComponent iconName="RefreshIcon" size={16} className="mr-2" />
            Try Again
          </Button>

          <Button
            onClick={() => router.back()}
            variant="outline"
            className="rounded-full px-6 text-sm"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={16} className="mr-2" />
            Go Back
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="rounded-full px-6 text-sm"
          >
            <IconComponent iconName="Home01Icon" size={16} className="mr-2" />
            Go Home
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="mt-8 rounded-lg bg-gray-50 p-4 text-left">
            <summary className="cursor-pointer text-xs font-medium text-gray-700">
              Error details (dev only)
            </summary>
            <pre className="mt-2 overflow-auto text-xs text-red-600">{error.message}</pre>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-500">Error ID: {error.digest}</p>
            )}
          </details>
        )}
      </div>
    </div>
  );
}
