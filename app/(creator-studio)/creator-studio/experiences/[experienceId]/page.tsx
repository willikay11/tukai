'use client';

import { useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';

import { Breadcrumb } from '@/app/shared/components/Breadcrumb';
import { CreateStepContentSkeleton } from '@/app/shared/components/Cards';
import { ComingSoon } from '@/app/shared/components/ComingSoon';
import { useFetchSingleExperience } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';

import { AboutTab } from './components/AboutTab';
import { ManageExperienceHero } from './components/ManageExperienceHero';
import { ManageExperienceTabs, type ManageTabId } from './components/ManageExperienceTabs';
import { buildManageExperienceMetrics } from './utils/manage-metrics';

export default function ManageExperiencePage() {
  const params = useParams<{ experienceId: string | string[] }>();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const experienceId =
    typeof params?.experienceId === 'string'
      ? params.experienceId
      : (params?.experienceId?.[0] ?? '');

  const [tab, setTab] = useState<ManageTabId>('about');

  const { data: experienceResponse, isLoading } = useFetchSingleExperience(experienceId, true);
  const experience: Experience | undefined = experienceResponse?.data;

  const metrics = useMemo(() => buildManageExperienceMetrics(experience), [experience]);

  // Only the host may see a creator dashboard for their own experience
  const currentUserId = session?.user?.id;
  const isHost = Boolean(currentUserId && experience?.host?.id === currentUserId);
  const isResolving = isLoading || sessionStatus === 'loading';

  if (isResolving) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-6">
        <CreateStepContentSkeleton />
      </main>
    );
  }

  if (!experience) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-6">
        <ComingSoon feature="This experience could not be loaded" iconName="Alert01Icon" />
      </main>
    );
  }

  if (!isHost) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-lg font-bold text-gray-900">This dashboard is for the host</p>
        <p className="mt-1 text-sm text-gray-500">
          You do not manage this experience. View its public page instead.
        </p>
        <button
          type="button"
          onClick={() => router.replace(`/experiences/${experienceId}`)}
          className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white"
        >
          Go to the experience
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <Breadcrumb
        items={[
          // No href yet — the Creator Studio landing page does not exist
          { label: 'Creator Studio' },
          { label: 'Manage Experience' },
        ]}
      />

      <ManageExperienceHero experience={experience} metrics={metrics} />

      <ManageExperienceTabs
        active={tab}
        onChange={setTab}
        // TODO: no messaging endpoint for buyers in bulk yet
        onMessageBuyers={() => {}}
        onEdit={() => router.push(`/experiences/create?experienceId=${experienceId}`)}
      />

      {tab === 'about' && <AboutTab experience={experience} metrics={metrics} />}
      {tab === 'sales' && <ComingSoon feature="Sales" iconName="Invoice01Icon" />}
      {tab === 'tickets' && <ComingSoon feature="Tickets Created" iconName="Ticket01Icon" />}
      {tab === 'guests' && <ComingSoon feature="Invited Guests" iconName="UserAdd01Icon" />}
      {tab === 'moments' && <ComingSoon feature="Moments" iconName="GridIcon" />}
      {tab === 'analytics' && <ComingSoon feature="Analytics" iconName="PieChartIcon" />}
    </main>
  );
}
