'use client';

import { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthDialog } from '@/context/AuthDialogContext';

/**
 * Gates a community page behind sign-in. Opens the dialog itself on mount and
 * watches it: closing without finishing sends the reader back where they
 * came from, same as the dialog it used to render directly.
 */
export const AuthGuard = () => {
  const router = useRouter();
  const { view, needAuth } = useAuthDialog();
  // Only true once a render has actually seen the dialog open - otherwise the
  // very first render (before `needAuth`'s effect has run) would read `view`
  // as null and immediately call `router.back()` before the dialog ever shows.
  const wasOpenRef = useRef(false);

  useEffect(() => {
    needAuth('join', () => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (view) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) router.back();
  }, [view, router]);

  return null;
};
