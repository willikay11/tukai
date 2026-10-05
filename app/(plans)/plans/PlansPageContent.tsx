'use client';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { Button } from '@/components/ui/button';
import { usePlans } from '@/context/PlanContext';

import { PlanCard } from './components/PlanCard';

/**
 * Days out the reader has planned.
 *
 * ⚠️ Plans are kept in this browser: no endpoint stores an itinerary of a
 * reader's own, so they do not follow an account to another device, and the
 * page says so rather than letting someone find out the hard way.
 */
export const PlansPageContent = () => {
  const router = useRouter();
  const { plans, isReady, createPlan } = usePlans();

  const start = () => {
    const plan = createPlan();
    router.push(`/plans/${plan.id}`);
  };

  if (!isReady) {
    return (
      <PageContainer className="py-6">
        <div className="h-8 w-40 animate-pulse rounded-full bg-gray-100" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            A day out, and the stops on it. Kept on this device.
          </p>
        </div>

        <Button variant="lime" onClick={start} className="rounded-full px-6">
          <span className="flex items-center gap-2">
            <IconComponent iconName="PlusSignIcon" size={16} color="currentColor" />
            New plan
          </span>
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface py-16 text-center">
          <IconComponent
            iconName="MapsIcon"
            size={28}
            color="currentColor"
            className="text-ink-subtle"
          />
          <p className="text-sm text-ink">No plans yet.</p>
          <p className="max-w-sm text-13 text-ink-muted">
            Start one, then add the experiences and places you want to string together into a day.
          </p>
          <Button variant="lime" onClick={start} className="mt-1 rounded-full px-6">
            Start a plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onOpen={() => router.push(`/plans/${plan.id}`)} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
