'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthDialog } from '@/context/AuthDialogContext';

/**
 * Retired as a standalone page (AU-00 decision 1) - this was the real
 * registration form, now folded into the dialog's email step. Nothing in the
 * top bar linked here any more than the old `/auth/sign-up`, so both now open
 * the same place.
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
