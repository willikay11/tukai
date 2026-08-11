'use client';

import { useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';

import { HostingCard } from '@/app/(experiences)/experiences/components/HostingCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoData } from '@/components/ui/noData';
import { Experience } from '@/types/experience';

interface BeforeYouCreateProps {
  // Both entry points do the same thing; kept separate so the two buttons can
  // diverge later (e.g. duplicate-from-existing) without rewiring
  onCreateNew: () => void;
  onStartFromScratch: () => void;
}

const GRID_CLASSES = 'mt-3 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';

const GateGridSkeleton = () => (
  <div className={GRID_CLASSES}>
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="h-[300px] animate-pulse rounded-2xl bg-gray-200" />
    ))}
  </div>
);

export const BeforeYouCreate = ({ onCreateNew, onStartFromScratch }: BeforeYouCreateProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? undefined;
  const [search, setSearch] = useState('');

  // Same call the Hosting tab makes — every experience the user created, in
  // all statuses
  const { data: hostedResponse, isLoading } = useExperiences(
    { page: 1, page_size: 100, hosted_by: userId },
    Boolean(userId),
  );

  const experiences: Experience[] = hostedResponse?.data?.results ?? [];

  // Client-side: the request already caps at 100, and filtering locally keeps
  // the list responsive as the user types
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return experiences;
    return experiences.filter((experience) => experience.title?.toLowerCase().includes(query));
  }, [experiences, search]);

  const hasSearch = search.trim().length > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Before you create a new one</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-500">
            Here is everything you have created so far. Check that the experience you have in mind
            is not already listed, then continue.
          </p>
        </div>

        <Button
          type="button"
          onClick={onCreateNew}
          variant="gradient"
          className="flex flex-shrink-0 items-center gap-2 rounded-full px-6"
        >
          <IconComponent iconName="PlusSignIcon" size={16} color="currentColor" />
          Create new experience
        </Button>
      </div>

      {/* Search */}
      <div className="mt-6">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search your experiences by name"
          aria-label="Search your experiences by name"
          icon={
            <IconComponent
              iconName="Search01Icon"
              size={16}
              color="currentColor"
              className="text-gray-400"
            />
          }
        />
      </div>

      {/* Count */}
      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-400">
        {filtered.length} {filtered.length === 1 ? 'Experience' : 'Experiences'}
      </p>

      {/* Grid / empty states */}
      {isLoading ? (
        <GateGridSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-10">
          <NoData
            message={
              hasSearch
                ? `“${search.trim()}” doesn't exist yet — go ahead and create it.`
                : "You haven't created any experiences yet."
            }
          />
          <Button
            type="button"
            onClick={onCreateNew}
            variant="gradient"
            className="rounded-full px-6"
          >
            Create new experience
          </Button>
        </div>
      ) : (
        <div className={GRID_CLASSES}>
          {filtered.map((experience) => (
            <HostingCard key={experience.id} experience={experience} />
          ))}
        </div>
      )}

      {/* Duplicate note — informational until a duplicate endpoint exists */}
      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-gray-50 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <IconComponent
            iconName="Copy01Icon"
            size={18}
            color="currentColor"
            className="flex-shrink-0 text-gray-500"
          />
          <p className="text-sm text-gray-600">
            Running the same experience again? Duplicate an existing one instead of starting from
            scratch — dates and tickets stay editable.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartFromScratch}
          className="flex-shrink-0 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:border-gray-300"
        >
          Start from scratch
        </button>
      </div>
    </div>
  );
};
