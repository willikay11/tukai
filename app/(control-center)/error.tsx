'use client';

import { ErrorState } from '@/app/shared/components/Errors';

export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Creator Studio could not load"
      description="Something went wrong loading this page. Try again, or head back to Discover."
      homeHref="/"
      homeLabel="Back to Discover"
    />
  );
}
