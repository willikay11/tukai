'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthDialog } from '@/context/AuthDialogContext';

/**
 * Retired as a standalone page (AU-08: forgot/reset password moved fully
 * into the dialog, extending AU-00 decision 1 to these two pages). This
 * keeps the old URL working by opening the dialog's forgot-password step
 * over home.
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
