'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
  ExperienceCreatedModal,
  InlineEditPanel,
  ReviewLayout,
} from '@/app/(experiences)/experiences/create/components';
import { useFetchSingleExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';

export default function ExperienceReviewPage() {
  const params = useParams<{ experienceId: string | string[] }>();
  const router = useRouter();
  const { toast } = useToast();

  const experienceId =
    typeof params?.experienceId === 'string'
      ? params.experienceId
      : params?.experienceId?.[0] || '';

  const { data: experienceResponse, isLoading } = useFetchSingleExperience(experienceId, true);
  const experience = experienceResponse?.data;

  const [activeEditSection, setActiveEditSection] = useState<
    | 'about-title'
    | 'about-description'
    | 'about-location'
    | 'about-meeting-point'
    | 'about-meeting-time'
    | 'about-categories'
    | 'about-visibility'
    | 'about-included'
    | 'about-excluded'
    | 'about-community'
    | 'photos'
    | 'dates'
    | 'tickets'
    | 'invites'
    | 'wallet'
    | null
  >(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    // TODO: Integrate with publish API when ready
    // For now, just show the success modal
    setTimeout(() => {
      setPublishSuccess(true);
      setIsPublishing(false);
    }, 500);
  };

  const handlePublishComplete = () => {
    setPublishSuccess(false);
    router.push(`/experiences/${experienceId}`);
  };

  if (isLoading) {
    return (
      <main className="mt-6 grid min-h-screen grid-cols-12 items-stretch gap-4 px-4 md:px-0">
        <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-4 xl:col-start-3 3xl:col-span-2 3xl:col-start-4 4xl:col-span-2 4xl:col-start-5">
          <div className="relative overflow-hidden">
            <div className="h-6 w-40 rounded bg-gray-200" />
            <div className="mt-4 h-[20.25rem] w-full rounded-xl bg-gray-200" />
            <div className="mt-4 h-6 w-52 rounded bg-gray-200" />
            <div className="mt-4 h-4 w-full rounded bg-gray-200" />
            <div className="mt-2 h-4 w-10/12 rounded bg-gray-200" />
            <div className="mt-6 h-36 w-full rounded-xl bg-gray-200" />
            <div className="mt-6 h-24 w-full rounded-xl bg-gray-200" />
            <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
        <div className="self-stretch lg:col-span-4 lg:col-start-8">
          <div className="relative min-h-full rounded-t-xl border-x border-t border-gray-200 bg-white px-12 py-6 shadow-lg">
            <div className="h-5 w-36 rounded bg-gray-200" />
            <div className="mt-6 h-12 w-full rounded-xl bg-gray-200" />
            <div className="mt-4 h-12 w-full rounded-xl bg-gray-200" />
            <div className="mt-4 h-12 w-2/3 rounded-xl bg-gray-200" />
            <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
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
    <>
      <main className="mt-6 grid min-h-screen grid-cols-12 items-stretch gap-4 px-4 md:px-0">
        <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-4 xl:col-start-3 3xl:col-span-2 3xl:col-start-4 4xl:col-span-2 4xl:col-start-5">
          <div>
            <ReviewLayout
              experience={experience}
              invitedCommunities={[]}
              onEditSection={setActiveEditSection}
              onCancel={() => router.back()}
              onPublish={handlePublish}
              isPublishing={isPublishing}
              showActionBar={!activeEditSection}
            />
          </div>
        </div>
        <div className="self-stretch lg:col-span-4 lg:col-start-8">
          <div className="min-h-full rounded-t-xl border-x border-t border-gray-200 bg-white px-12 py-6 shadow-lg">
            {activeEditSection ? (
              <InlineEditPanel
                activeEditSection={activeEditSection}
                onClose={() => setActiveEditSection(null)}
                experienceId={experienceId}
                experience={experience}
                aboutPhotos={experience.photos}
                onPhotosChange={(photos) => {
                  // Update experience photos in local state
                  // Photos are already synced via the PhotoEditPanel API calls
                }}
              />
            ) : (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">Experience Details</h2>
                <p className="text-xs text-gray-600">
                  Review all details on the left. Click the edit icons to make changes.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ExperienceCreatedModal
        open={publishSuccess}
        onOpenChange={(open) => {
          if (!open) {
            handlePublishComplete();
          }
        }}
        experienceId={experienceId}
        onViewExperience={handlePublishComplete}
      />
    </>
  );
}
