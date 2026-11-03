'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import { useAuthDialog } from '@/context/AuthDialogContext';
import { useBucketListDrawer } from '@/context/BucketListDrawerContext';
import { useCommunityDrawer } from '@/context/CommunityDrawerContext';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { useCreateCommunityDrawer } from '@/context/CreateCommunityDrawerContext';
import { useCreateExperienceDrawer } from '@/context/CreateExperienceDrawerContext';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { useInboxDrawer } from '@/context/InboxDrawerContext';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { TUKAI_ROUTE, useTukai } from '@/context/TukaiContext';
import { cn } from '@/lib/utils';

import { TukaiMark } from './TukaiMark';

/**
 * The floating "Ask TukAI" button, bottom left on every page.
 *
 * It stands aside on the TukAI page itself, and whenever something else owns
 * the screen: sign-in, any side panel, the upgrade drawer. Signed out, it
 * asks for an account first and carries on to TukAI after.
 *
 * Below 720px it is the icon alone, above the bottom navigation.
 */
export const AskTukaiButton = () => {
  const pathname = usePathname();
  const { openTukai, isUpgradeOpen } = useTukai();
  const { view: authView } = useAuthDialog();
  const place = usePlaceDrawer();
  const experience = useExperienceDrawer();
  const community = useCommunityDrawer();
  const bucketList = useBucketListDrawer();
  const inbox = useInboxDrawer();
  const createExperience = useCreateExperienceDrawer();
  const createCommunity = useCreateCommunityDrawer();
  const connectPlace = useConnectPlaceDrawer();
  const hostingPlan = useHostingPlan();

  const hidden =
    pathname === TUKAI_ROUTE ||
    isUpgradeOpen ||
    Boolean(authView) ||
    Boolean(place?.openPlaceId) ||
    Boolean(experience?.openExperienceId) ||
    Boolean(community?.openCommunityId) ||
    Boolean(bucketList?.openBucketListId) ||
    Boolean(inbox?.isOpen) ||
    Boolean(createExperience?.isOpen) ||
    Boolean(createCommunity?.isOpen) ||
    Boolean(connectPlace?.isOpen) ||
    Boolean(hostingPlan?.isOpen);

  // The sparkle pops in once, the first time the button shows after a load.
  // Keyed so a later showing renders it settled rather than replaying
  const [hasSparkled, setHasSparkled] = useState(false);
  useEffect(() => {
    if (hidden || hasSparkled) return;
    const t = window.setTimeout(() => setHasSparkled(true), 1700);
    return () => window.clearTimeout(t);
  }, [hidden, hasSparkled]);

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={openTukai}
      aria-label="Ask TukAI"
      className={cn(
        'fixed z-[57] flex h-14 items-center gap-2.5 rounded-full border border-white/70 bg-white/55 px-2 text-[15.5px] font-semibold text-brand-ink',
        'shadow-[0_8px_28px_rgba(1,51,52,.14),inset_0_1px_0_rgba(255,255,255,.8)] backdrop-blur-[18px] backdrop-saturate-[1.6]',
        'transition-[transform,box-shadow,background-color] duration-200 ease-in-out',
        'hover:-translate-y-0.5 hover:bg-white/[.68] hover:shadow-[0_12px_32px_rgba(1,51,52,.18),inset_0_1px_0_rgba(255,255,255,.85)]',
        // Below 720px: icon only, clear of the bottom navigation
        'bottom-[calc(84px+env(safe-area-inset-bottom))] left-4',
        'min-[720px]:bottom-6 min-[720px]:left-[max(24px,calc((100%-1360px)/2+24px))] min-[720px]:pl-2 min-[720px]:pr-[22px]',
      )}
    >
      <TukaiMark
        size="lg"
        iconClassName={hasSparkled ? undefined : 'motion-safe:animate-tk-spark'}
      />
      <span className="hidden whitespace-nowrap min-[720px]:inline">Ask TukAI</span>
    </button>
  );
};
