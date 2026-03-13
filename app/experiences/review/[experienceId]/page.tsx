'use client';

import { useState } from 'react';

import { useParams } from 'next/navigation';

import CreateExperienceAbout from '@/app/experiences/create/components/about';
import ExperienceDates from '@/app/experiences/create/components/dates';
import ExperienceReview from '@/app/experiences/create/components/experienceReview';
import { useFetchSingleExperience } from '@/hooks/experiences';

export default function ExperienceReviewPage() {
  const params = useParams<{ experienceId: string | string[] }>();
  const experienceId =
    typeof params?.experienceId === 'string'
      ? params.experienceId
      : params?.experienceId?.[0] || '';

  const { data: experienceResponse, isLoading } = useFetchSingleExperience(experienceId, true);
  const experience = experienceResponse?.data;

  const [activeEditSection, setActiveEditSection] = useState<'about' | 'tickets' | null>(null);

  if (isLoading) {
    return (
      <main className="mx-auto mt-8 max-w-6xl px-4">
        <p className="text-sm text-gray-500">Loading experience...</p>
      </main>
    );
  }

  if (!experience) {
    return (
      <main className="mx-auto mt-8 max-w-6xl px-4">
        <p className="text-sm text-gray-500">Experience not found.</p>
      </main>
    );
  }

  return (
    <main className="mt-6 grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-4 xl:col-start-3 3xl:col-span-2 3xl:col-start-4 4xl:col-span-2 4xl:col-start-5">
        <ExperienceReview
          type="review"
          experience={experience}
          invitedMembers={[]}
          invitedCommunities={[]}
          onEditRequest={(section) => setActiveEditSection(section)}
        />
      </div>
      <div className="lg:col-span-4 lg:col-start-8">
        <div className="h-full rounded-t-xl border-x border-t border-gray-200 bg-white px-12 py-6 shadow-lg">
          {activeEditSection === 'about' && (
            <CreateExperienceAbout
              experience={experience}
              onClose={() => setActiveEditSection(null)}
              showTitle={false}
            />
          )}
          {activeEditSection === 'tickets' && (
            <ExperienceDates experienceId={experienceId} experience={experience} />
          )}
        </div>
      </div>
    </main>
  );
}
