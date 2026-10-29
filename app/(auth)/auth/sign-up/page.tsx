'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthDialog } from '@/context/AuthDialogContext';

/**
 * Retired as a standalone page (AU-00 decision 1) - registration now lives in
 * the dialog everywhere. This keeps the old URL working by opening it over home.
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
