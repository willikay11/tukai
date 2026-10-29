'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { PageContainer } from '@/app/shared/components/Layout';
import { useMyCommunities } from '@/app/shared/hooks/useCommunities';

import { DashboardBalanceCard } from './components/DashboardBalanceCard';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { DashboardTabId, DashboardTabs } from './components/DashboardTabs';
import { EarningsSection } from './components/EarningsSection';
import { HostingPlanCard } from './components/HostingPlanCard';
import { MyCommunitiesSection } from './components/MyCommunitiesSection';
import { MyExperiencesHostingSection } from './components/MyExperiencesHostingSection';
import { MyPlacesSection } from './components/MyPlacesSection';
import { MyReservationsSection } from './components/MyReservationsSection';
import { useDashboardPlaces } from './hooks/useDashboardPlaces';

/**
 * The Dashboard (`/control-center` - the account menu's "Dashboard" entry
 * already points here). Replaces the old single-column Control Center with
 * the handoff's tabbed layout: Overview shows every section, any other tab
 * shows only its own section at full width.
 *
 * The old Control Center's payout history (`EarningsSection`/`WalletsSection`)
 * isn't part of the handoff's visible layout, but stays reachable - tucked
 * below the four Dashboard sections - rather than being dropped.
 */
export const DashboardContent = () => {
  const { data: session, status } = useSession();
  // The session types `id` as possibly null; every hook below takes undefined.
  const userId = session?.user?.id ?? undefined;

  const [dashTab, setDashTab] = useState<DashboardTabId>('overview');
  const [reservationsDay, setReservationsDay] = useState<number | null>(null);
  const [hostingDay, setHostingDay] = useState<number | null>(null);

  const { owned: ownedCommunities } = useMyCommunities(userId);
  const { pendingRequestCount } = useDashboardPlaces(userId);

  const show = (tab: DashboardTabId) => dashTab === 'overview' || dashTab === tab;
  const showColumnA = show('res') || show('places');
  const showColumnB = show('host') || show('comms');

  if (status === 'loading') {
    return (
      <PageContainer className="py-6">
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <DashboardTabs
        active={dashTab}
        onChange={setDashTab}
        placesNewRequestCount={pendingRequestCount}
      />

      <div className="flex flex-wrap items-start gap-7 pt-[18px]">
        <aside
          aria-label="Account balance"
          className="flex min-w-0 flex-[1_1_340px] max-w-[380px] flex-col gap-2"
        >
          <DashboardBalanceCard userId={userId} />
          <HostingPlanCard ownedCommunities={ownedCommunities} />
        </aside>

        <div className="grid min-w-0 flex-[999_1_560px] grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-7">
          {showColumnA && (
            <div className="flex min-w-0 flex-col gap-7">
              {show('res') && (
                <MyReservationsSection
                  userId={userId}
                  selectedOffset={reservationsDay}
                  onSelectOffset={setReservationsDay}
                />
              )}
              {show('places') && <MyPlacesSection userId={userId} />}
            </div>
          )}

          {showColumnB && (
            <div className="flex min-w-0 flex-col gap-7">
              {show('host') && (
                <MyExperiencesHostingSection
                  userId={userId}
                  selectedOffset={hostingDay}
                  onSelectOffset={setHostingDay}
                  ownsCommunity={ownedCommunities.length > 0}
                />
              )}
              {show('comms') && <MyCommunitiesSection userId={userId} />}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <EarningsSection currency="KES" />
      </div>
    </PageContainer>
  );
};
