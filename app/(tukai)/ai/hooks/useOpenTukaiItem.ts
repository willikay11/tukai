'use client';

import { useCallback } from 'react';

import { useCommunityDrawer } from '@/context/CommunityDrawerContext';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import type { TukaiItem } from '@/types/tukai';

/** Opens a place, experience or community TukAI suggested, in its own drawer over the chat. */
export const useOpenTukaiItem = () => {
  const place = usePlaceDrawer();
  const experience = useExperienceDrawer();
  const community = useCommunityDrawer();

  return useCallback(
    (item: TukaiItem | undefined) => {
      if (!item) return;
      if (item.kind === 'place') place?.openPlace(item.id);
      else if (item.kind === 'community') community?.openCommunity(item.id);
      else experience?.openExperience(item.id);
    },
    [community, experience, place],
  );
};
