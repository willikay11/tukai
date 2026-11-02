'use client';

import { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useCommunityDrawer } from '@/context/CommunityDrawerContext';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';

export type SharedLinkKind = 'place' | 'experience' | 'community';

/**
 * Where a shared link lands: Discover, with the shared thing open in its
 * drawer over it - the drawer is where its locked and unavailable states
 * live, which the full pages do not show the same way.
 *
 * The short-link route resolves its slug to the id, so this opens the drawer from that
 * rather than from a query parameter: Discover reads its whole search from
 * the URL, and a `?place=` there would swap the rails for a results list.
 *
 * Closing the drawer leaves the reader on Discover proper, at `/`, so the
 * address bar stops naming something that is no longer open.
 */
export const SharedLinkLanding = ({ kind, id }: { kind: SharedLinkKind; id: string }) => {
  const router = useRouter();
  const placeDrawer = usePlaceDrawer();
  const experienceDrawer = useExperienceDrawer();
  const communityDrawer = useCommunityDrawer();

  const openId = {
    place: placeDrawer?.openPlaceId,
    experience: experienceDrawer?.openExperienceId,
    community: communityDrawer?.openCommunityId,
  }[kind];

  const hasOpened = useRef(false);

  // Once, on landing. Reopening on every render would trap the reader in it
  useEffect(() => {
    if (kind === 'place') placeDrawer?.openPlace(id);
    if (kind === 'experience') experienceDrawer?.openExperience(id);
    if (kind === 'community') communityDrawer?.openCommunity(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, id]);

  useEffect(() => {
    if (openId) {
      hasOpened.current = true;
      return;
    }

    if (hasOpened.current) router.replace('/', { scroll: false });
  }, [openId, router]);

  return null;
};
