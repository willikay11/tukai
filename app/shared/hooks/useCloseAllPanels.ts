'use client';

import { useBucketListDrawer } from '@/context/BucketListDrawerContext';
import { useCommunityDrawer } from '@/context/CommunityDrawerContext';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { useCreateCommunityDrawer } from '@/context/CreateCommunityDrawerContext';
import { useCreateExperienceDrawer } from '@/context/CreateExperienceDrawerContext';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { useInboxDrawer } from '@/context/InboxDrawerContext';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';

/**
 * Closes whichever app-level panel is open.
 *
 * The panels live above the routes, so moving to another page leaves an open
 * one sitting over it. The bottom tab bar calls this first, so a destination
 * always opens onto its own page. Panels a page opens from its own state close
 * with that page and need nothing from here.
 */
export const useCloseAllPanels = (): (() => void) => {
  const place = usePlaceDrawer();
  const experience = useExperienceDrawer();
  const community = useCommunityDrawer();
  const bucketList = useBucketListDrawer();
  const inbox = useInboxDrawer();
  const createExperience = useCreateExperienceDrawer();
  const createCommunity = useCreateCommunityDrawer();
  const connectPlace = useConnectPlaceDrawer();
  const hostingPlan = useHostingPlan();

  return () => {
    if (place?.openPlaceId) place.closePlace();
    if (experience?.openExperienceId) experience.closeExperience();
    if (community?.openCommunityId) community.closeCommunity();
    if (bucketList?.openBucketListId) bucketList.closeBucketList();
    if (inbox?.isOpen) inbox.closeInbox();
    if (createExperience?.isOpen) createExperience.closeCreateExperience();
    if (createCommunity?.isOpen) createCommunity.closeCreateCommunity();
    if (connectPlace?.isOpen) connectPlace.closeConnectPlace();
    if (hostingPlan?.isOpen) hostingPlan.closeHostingPlanFlow();
  };
};
