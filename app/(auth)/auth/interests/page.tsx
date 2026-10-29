'use client';

import { useEffect } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useAuthDialog } from '@/context/AuthDialogContext';

/**
 * Retired as a standalone page (AU-00 decision 1). Signed-in visitors land in
 * the edit-interests step (this is what "Profile, My interests, Edit" now
 * opens); anyone else falls back to Welcome, since onboarding's interests
 * step only makes sense after the email form or a social sign-in.
 */
export default function Page() {
  const router = useRouter();
  const { status } = useSession();
  const { openEditInterests, openRegister } = useAuthDialog();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      openEditInterests();
    } else {
      openRegister();
    }
    router.replace('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return null;
}
