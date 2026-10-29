'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthDialog } from '@/context/AuthDialogContext';

/**
 * Retired as a standalone page (AU-00 decision 1). The code step only makes
 * sense mid-flow, with the dialog already holding the draft account and the
 * interests just chosen - there is nothing to resume from a bare visit to
 * this URL, so it opens Welcome rather than a broken code screen.
 */
export default function Page() {
  const router = useRouter();
  const { openRegister } = useAuthDialog();

  useEffect(() => {
    openRegister();
    router.replace('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
