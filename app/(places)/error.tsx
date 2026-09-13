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
      title="Places could not load"
      description="Something went wrong loading this page. Try again, or browse places from the start."
      homeHref="/places"
      homeLabel="Back to Places"
    />
  );
}
