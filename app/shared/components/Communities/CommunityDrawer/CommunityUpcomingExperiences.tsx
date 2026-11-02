'use client';

import { useMemo, useState } from 'react';

import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { WeekStrip } from '@/app/shared/components/Places/PlaceDrawer/WeekStrip';
import {
  addWeeks,
  buildWeek,
  dayKey,
  dayLabel,
  experiencesOnDay,
  isCurrentWeek,
  weekStart,
} from '@/app/shared/components/Places/PlaceDrawer/week-strip';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';

import { COMMUNITY_SECTIONS } from './tabs';

/** Wide enough that a community's whole programme lands in one request. */
export const UPCOMING_PAGE_SIZE = 50;

const MAX_DAY_DOTS = 2;

/**
 * What is on at a community, a week at a time - the handoff's week/day picker,
 * mirroring `PlaceDrawer/UpcomingExperiences.tsx` exactly, scoped to
 * `community` instead of `place`.
 */
export const CommunityUpcomingExperiences = ({
  communityId,
  communityTitle,
}: {
  communityId: string;
  communityTitle: string;
}) => {
  const [anchor, setAnchor] = useState(() => weekStart(new Date()));
  const [selectedKey, setSelectedKey] = useState(() => dayKey(new Date()));

  const { data, isLoading } = useExperiences(
    { page: 1, page_size: UPCOMING_PAGE_SIZE, community: communityId, status: 'published' },
    Boolean(communityId),
  );
  const experiences: Experience[] = useMemo(() => data?.data?.results ?? [], [data]);

  const week = useMemo(() => buildWeek(anchor, experiences), [anchor, experiences]);
  const onSelectedDay = useMemo(
    () => experiencesOnDay(experiences, selectedKey),
    [experiences, selectedKey],
  );

  const moveTo = (weeks: number) => {
    const next = addWeeks(anchor, weeks);
    setAnchor(next);
    setSelectedKey(isCurrentWeek(next) ? dayKey(new Date()) : dayKey(next));
  };

  return (
    <section id={COMMUNITY_SECTIONS.experiences} className="scroll-mt-[148px] space-y-5">
      <div>
        <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">Upcoming experiences</h3>
        <p className="mt-1.5 text-sm leading-snug text-ink-muted">
          Upcoming experiences in {communityTitle}
        </p>
      </div>

      <WeekStrip
        anchor={anchor}
        week={week}
        selectedKey={selectedKey}
        dotsFor={(day) => Math.min(day.experienceCount, MAX_DAY_DOTS)}
        onSelect={setSelectedKey}
        onMove={moveTo}
      />

      {isLoading ? (
        <div className="aspect-square w-[184px] animate-pulse rounded-xl bg-gray-200" />
      ) : onSelectedDay.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-3.5 gap-y-[22px] pt-1.5">
          {onSelectedDay.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              opensDrawer={false}
              className="w-full"
            />
          ))}
        </div>
      ) : (
        <p className="pt-1 text-sm leading-snug text-ink-muted">
          Nothing from {communityTitle} on {dayLabel(selectedKey)}. Try another day.
        </p>
      )}
    </section>
  );
};
