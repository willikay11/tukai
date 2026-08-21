'use client';

import { useMemo } from 'react';

import { useSession } from 'next-auth/react';

import { useQueries } from '@tanstack/react-query';
import numeral from 'numeral';

import { PageContainer } from '@/app/shared/components/Layout';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { NoData } from '@/components/ui/noData';
import { fetchTicketPurchases } from '@/services/experience';
import { Experience } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';

import { ExperienceProgressRow } from './components/ExperienceProgressRow';
import { MyExperiences } from './components/MyExperiences';
import { RecentReservations, StudioReservation } from './components/RecentReservations';
import { RevenueChart } from './components/RevenueChart';
import { StudioHero } from './components/StudioHero';
import { StudioStatCard } from './components/StudioStatCard';
import { YourPlaces } from './components/YourPlaces';
import {
  buildStudioMetrics,
  isActive,
  isHostedBy,
  upcomingExperiences,
} from './utils/studio-metrics';

// Purchases are only queryable one experience at a time, so the feed is capped
const RESERVATION_SOURCE_LIMIT = 5;
const RECENT_RESERVATIONS = 6;

const guestName = (purchase: TicketPurchase): string => {
  const full = [purchase.user?.firstName, purchase.user?.lastName].filter(Boolean).join(' ');
  return full || purchase.user?.displayName || 'Guest';
};

/** One row per guest per experience, with their tickets and spend summed. */
export const groupReservations = (
  purchases: { purchase: TicketPurchase; experience: Experience }[],
): StudioReservation[] => {
  const rows = new Map<string, StudioReservation>();

  purchases.forEach(({ purchase, experience }) => {
    const key = `${purchase.user?.id ?? 'anon'}|${experience.id}`;
    const amount = parseFloat(String(purchase.ticket?.price ?? 0)) || 0;
    const existing = rows.get(key);

    if (existing) {
      existing.tickets += 1;
      existing.amount += amount;
      return;
    }

    rows.set(key, {
      id: key,
      guestName: guestName(purchase),
      guestPicture: purchase.user?.picture ?? null,
      experienceTitle: experience.title,
      tickets: 1,
      amount,
      currency: purchase.ticket?.currency ?? 'Ksh.',
      // ⚠️ The purchase record carries no payment method
      method: '—',
      status: purchase.status,
    });
  });

  return Array.from(rows.values());
};

export const CreatorStudioContent = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: hostedResponse, isLoading } = useExperiences(
    { page: 1, page_size: 100, hosted_by: userId ?? undefined },
    Boolean(userId),
  );
  // hosted_by also matches experiences this user only co-hosts, so ownership is
  // enforced here — everything downstream (metrics, purchases, sections) then
  // sees only the host's own experiences
  const experiences: Experience[] = (hostedResponse?.data?.results ?? []).filter(
    (experience: Experience) => isHostedBy(experience, userId),
  );

  const metrics = useMemo(() => buildStudioMetrics(experiences), [experiences]);
  const upcoming = useMemo(() => upcomingExperiences(experiences), [experiences]);
  // The studio lists what is live; drafts and expired runs are not "my
  // experiences" a host is currently offering
  const published = useMemo(() => experiences.filter(isActive), [experiences]);

  // No host-wide purchases filter exists, so this fans out over the most
  // recent experiences rather than loading every one
  const reservationSources = experiences.slice(0, RESERVATION_SOURCE_LIMIT);
  const purchaseQueries = useQueries({
    queries: reservationSources.map((experience) => ({
      queryKey: ['ticket-purchases', 'experience', experience.id],
      queryFn: () => fetchTicketPurchases({ ticket__experience: experience.id, page_size: 100 }),
      enabled: Boolean(userId),
    })),
  });

  const reservations: StudioReservation[] = useMemo(() => {
    const joined = purchaseQueries.flatMap((query, index) =>
      ((query.data?.data?.results ?? []) as TicketPurchase[]).map((purchase) => ({
        purchase,
        experience: reservationSources[index],
      })),
    );

    return groupReservations(joined).slice(0, RECENT_RESERVATIONS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseQueries.map((query) => query.dataUpdatedAt).join(','), experiences]);

  if (isLoading) {
    return (
      <PageContainer className="space-y-6 py-6">
        <div className="h-[280px] animate-pulse rounded-3xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[200px] animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-10 py-6">
      <StudioHero name={session?.user?.name ?? 'there'} metrics={metrics} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StudioStatCard
          icon="Ticket01Icon"
          value={numeral(metrics.ticketsSold).format('0,0')}
          label="Tickets sold"
          delta={`+${metrics.ticketsSoldChangePercent}%`}
          tone={{
            rule: 'bg-primary',
            tile: 'bg-green-50',
            icon: 'text-primary',
            bars: [
              'bg-green-100',
              'bg-green-200',
              'bg-green-300',
              'bg-green-400',
              'bg-green-500',
              'bg-green-600',
              'bg-green-700',
            ],
          }}
        />
        <StudioStatCard
          icon="ViewIcon"
          value={numeral(metrics.profileViews).format('0,0')}
          label="Profile views"
          delta={`+${metrics.profileViewsChangePercent}%`}
          tone={{
            rule: 'bg-blue-500',
            tile: 'bg-blue-50',
            icon: 'text-blue-500',
            bars: [
              'bg-blue-100',
              'bg-blue-200',
              'bg-blue-300',
              'bg-blue-400',
              'bg-blue-500',
              'bg-blue-600',
              'bg-blue-700',
            ],
          }}
        />
        <StudioStatCard
          icon="CheckmarkCircle02Icon"
          value={String(metrics.activeExperiences)}
          label="Active experiences"
          delta={`+${metrics.newActiveExperiences} new`}
          tone={{
            rule: 'bg-amber-600',
            tile: 'bg-amber-50',
            icon: 'text-amber-600',
            bars: [
              'bg-amber-100',
              'bg-amber-200',
              'bg-amber-300',
              'bg-amber-400',
              'bg-amber-500',
              'bg-amber-600',
              'bg-amber-700',
            ],
          }}
        />
        <StudioStatCard
          icon="StarIcon"
          value={String(metrics.averageRating)}
          label="Average rating"
          delta={String(metrics.averageRatingChange)}
          deltaTone="negative"
          tone={{
            rule: 'bg-red-400',
            tile: 'bg-red-50',
            icon: 'text-red-400',
            bars: [
              'bg-red-100',
              'bg-red-200',
              'bg-red-300',
              'bg-red-400',
              'bg-red-500',
              'bg-red-600',
              'bg-red-700',
            ],
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={metrics.monthlyRevenue} currency={metrics.currency} />

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Upcoming experiences</h2>

          {upcoming.length === 0 ? (
            <div className="py-10">
              <NoData message="Nothing scheduled yet" />
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {upcoming.slice(0, 3).map((experience) => (
                <ExperienceProgressRow key={experience.id} experience={experience} />
              ))}
            </div>
          )}
        </div>
      </div>

      <MyExperiences experiences={published} />

      <YourPlaces />

      {reservations.length > 0 && <RecentReservations reservations={reservations} />}
    </PageContainer>
  );
};
