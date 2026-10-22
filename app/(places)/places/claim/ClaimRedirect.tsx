'use client';

import { useEffect, useRef } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';

/**
 * `/places/claim` used to be the whole claim form; it is now the
 * Connect-a-place drawer (app/shared/components/Places/ConnectPlaceDrawer),
 * opened from the Create menu, Dashboard > Places, and an unclaimed place's
 * own drawer.
 *
 * This route stays as a thin redirect shim so two things keep working: the
 * sign-in `callbackUrl` round-trip for someone who starts a claim signed out,
 * and any bookmarked or shared `/places/claim?placeId=...` link. It opens the
 * drawer with whatever the query string carried, then sends the reader
 * somewhere with content behind the drawer.
 */
export const ClaimRedirect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { openConnectPlace } = useConnectPlaceDrawer()!;
  const hasOpenedRef = useRef(false);

  const placeId = searchParams.get('placeId') ?? undefined;
  const communityId = searchParams.get('communityId') ?? undefined;

  useEffect(() => {
    if (status === 'loading' || hasOpenedRef.current) return;

    if (status === 'unauthenticated') {
      const returnTo = placeId ? `/places/claim?placeId=${placeId}` : '/places/claim';
      router.replace(`/auth/sign-in?callbackUrl=${encodeURIComponent(returnTo)}`);
      return;
    }

    hasOpenedRef.current = true;
    openConnectPlace({ placeId, communityId });
    router.replace(placeId ? `/places/${placeId}` : '/places');
  }, [status, placeId, communityId, openConnectPlace, router]);

  return <div className="h-96 animate-pulse rounded-3xl bg-gray-100" />;
};
