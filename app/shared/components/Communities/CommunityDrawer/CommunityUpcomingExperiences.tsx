'use client';

import { useMemo, useState } from 'react';

import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { WeekStrip } from '@/app/shared/components/Places/PlaceDrawer/WeekStrip';
import {
  MAX_WEEKS_AHEAD,
  addWeeks,
  buildWeek,
  dayKey,
  dayLabel,
  experienceDayKey,
  experiencesOnDay,
  isCurrentWeek,
  parseDayKey,
  weekStart,
} from '@/app/shared/components/Places/PlaceDrawer/week-strip';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';

import { SectionHeading } from './parts';
import { COMMUNITY_SECTIONS, SECTION_SCROLL_MARGIN } from './tabs';

/** Wide enough that a community's whole programme lands in one request. */
export const UPCOMING_PAGE_SIZE = 50;

const MAX_DAY_DOTS = 2;

/**
 * Where the drawer opens: the week of the next experience, on the first day
 * that has something. Anything past the 12 weeks the strip pages through
 * falls back to this week.
 */
const openingDay = (experiences: Experience[]): { anchor: Date; key: string } => {
  const today = new Date();
  const thisWeek = weekStart(today);
  const lastWeek = addWeeks(thisWeek, MAX_WEEKS_AHEAD);

  const firstKey = experiences
    .map(experienceDayKey)
    .filter((key): key is string => key !== null && key >= dayKey(today))
    .sort()[0];

  if (!firstKey) return { anchor: thisWeek, key: dayKey(today) };

  const anchor = weekStart(parseDayKey(firstKey));
  if (anchor > lastWeek) return { anchor: thisWeek, key: dayKey(today) };
  return { anchor, key: firstKey };
};

/**
 * What is on at a community, a week at a time. Cards open the experience on
 * top of the community; closing it shows the community again.
 */
export const CommunityUpcomingExperiences = ({
  communityTitle,
  experiences,
}: {
  communityTitle: string;
  /** Upcoming only - the drawer has already dropped what has ended. */
  experiences: Experience[];
}) => {
  // Set once, from what the drawer had when the section mounted. The drawer
  // keys its body by community, so a different community starts over here.
  const [{ anchor, key: selectedKey }, setPosition] = useState(() => openingDay(experiences));

  const week = useMemo(() => buildWeek(anchor, experiences), [anchor, experiences]);
  const onSelectedDay = useMemo(
    () =>
      experiencesOnDay(experiences, selectedKey).sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      ),
    [experiences, selectedKey],
  );

  // Changing the week clears the picked day: today on this week, the first
  // day of any later one
  const moveTo = (weeks: number) => {
    const next = addWeeks(anchor, weeks);
    setPosition({ anchor: next, key: isCurrentWeek(next) ? dayKey(new Date()) : dayKey(next) });
  };

  return (
    <section
      id={COMMUNITY_SECTIONS.experiences}
      className={cn('flex flex-col gap-4', SECTION_SCROLL_MARGIN)}
    >
      <SectionHeading
        title="Upcoming experiences"
        sub={`Upcoming experiences in ${communityTitle}`}
      />

      <div className="flex flex-col gap-2.5">
        <WeekStrip
          anchor={anchor}
          week={week}
          selectedKey={selectedKey}
          dotsFor={(day) => Math.min(day.experienceCount, MAX_DAY_DOTS)}
          dotClassNameFor={() => 'bg-brand'}
          onSelect={(key) => setPosition({ anchor, key })}
          onMove={moveTo}
        />

        {onSelectedDay.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-3.5 gap-y-[22px] pt-1.5">
            {onSelectedDay.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} className="w-full" />
            ))}
          </div>
        ) : (
          <p className="pt-1 text-sm leading-[1.45] text-ink-muted [text-wrap:pretty]">
            Nothing from {communityTitle} on {dayLabel(selectedKey)}. Try another day.
          </p>
        )}
      </div>
    </section>
  );
};
