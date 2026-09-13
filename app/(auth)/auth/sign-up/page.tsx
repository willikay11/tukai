'use client';

import { useRouter } from 'next/navigation';

import { AuthCard } from '@/app/shared/components/Auth';

export default function Page() {
  const router = useRouter();

  // The card is the page: the same one the sign-in dialog shows, so the two
  // offer the same options in the same order
  return <AuthCard onLogin={() => router.push('/')} />;
}
