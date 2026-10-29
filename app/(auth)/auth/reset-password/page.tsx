'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthDialog } from '@/context/AuthDialogContext';

/**
 * Retired as a standalone page (AU-08). The code/new-password steps only make
 * sense mid-flow, with the dialog already holding which email requested a
 * reset - there is nothing to resume from a bare visit to this URL, so it
 * opens the forgot-password flow from its start rather than a broken step.
 */
export default function Page() {
  const router = useRouter();
  const { openForgotPassword } = useAuthDialog();

  useEffect(() => {
    openForgotPassword();
    router.replace('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
