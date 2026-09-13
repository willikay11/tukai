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
      title="Something went wrong"
      description="This page failed to load. You can try again, or head back and keep browsing."
      homeHref="/"
      homeLabel="Back to Discover"
    />
  );
}
