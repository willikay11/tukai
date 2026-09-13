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
      description="We could not complete that step. Try again, or start again from sign in."
      homeHref="/auth/sign-in"
      homeLabel="Back to sign in"
    />
  );
}
