'use client';

import { useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PlaceAvailabilityException, PlaceReservationProfile } from '@/types/placeReservation';

import { WeekStrip } from './WeekStrip';
import { closedDayKeys, holdOffLine } from './hold-off';
import {
  HOST_SUMMARY_TABS,
  HostReservation,
  HostReservationGroup,
  awaitingAnswerCount,
  daysAwaitingAnswer,
  reservationsOnDay,
  summaryCounts,
} from './host-reservations';
import { addWeeks, buildWeekFromCounts, dayKey, isCurrentWeek, weekStart } from './week-strip';

const waitingLine = (waiting: number): string => {
  if (waiting === 0) return 'No requests waiting for an answer';
  return `${waiting} ${waiting === 1 ? 'request needs' : 'requests need'} an answer`;
};

export const HostReservationsSection = ({
  reservations,
  profile,
  exceptions,
  onOpen,
}: {
  reservations: HostReservation[];
  profile: PlaceReservationProfile;
  exceptions: PlaceAvailabilityException[];
  onOpen: (day: string, group: HostReservationGroup) => void;
}) => {
  const [anchor, setAnchor] = useState(() => weekStart(new Date()));
  const [selectedKey, setSelectedKey] = useState(() => dayKey(new Date()));

  const week = useMemo(() => buildWeekFromCounts(anchor, new Map()), [anchor]);
  const awaitingDays = useMemo(() => daysAwaitingAnswer(reservations), [reservations]);
  const heldDays = useMemo(() => new Set(closedDayKeys(exceptions)), [exceptions]);

  const onDay = reservationsOnDay(reservations, selectedKey);
  const counts = summaryCounts(onDay);
  const hold = holdOffLine(profile.status, exceptions);

  const firstTabWithRows =
    HOST_SUMMARY_TABS.find((tab) => counts[tab.id] > 0) ?? HOST_SUMMARY_TABS[0];

  const moveTo = (weeks: number) => {
    const next = addWeeks(anchor, weeks);
    setAnchor(next);
    setSelectedKey(isCurrentWeek(next) ? dayKey(new Date()) : dayKey(next));
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => onOpen(selectedKey, firstTabWithRows.group)}
          className="-my-2.5 inline-flex min-h-11 items-center gap-1.5 self-start text-[19px] font-bold tracking-[-0.2px] text-gray-800 hover:text-brand"
        >
          Reservations
          <IconComponent
            iconName="ArrowRight01Icon"
            size={20}
            color="currentColor"
            className="flex-shrink-0 text-ink-muted"
          />
        </button>
        <p className="text-sm leading-[1.45] text-ink-muted">
          {waitingLine(awaitingAnswerCount(reservations))}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-surface p-3">
        <WeekStrip
          anchor={anchor}
          week={week}
          selectedKey={selectedKey}
          dotsFor={(day) => (awaitingDays.has(day.key) ? 1 : 0)}
          dotClassNameFor={() => 'bg-danger'}
          isHeldFor={(day) => heldDays.has(day.key)}
          navClassName="-my-1 -ml-1"
          onSelect={setSelectedKey}
          onMove={moveTo}
        />

        <div aria-hidden="true" className="-mx-3 my-0.5 h-px bg-line" />

        <div role="group" aria-label="Reservation status" className="flex flex-wrap gap-2">
          {HOST_SUMMARY_TABS.map((tab) => {
            const count = counts[tab.id];
            const needsAnswer = tab.id === 'request' && count > 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onOpen(selectedKey, tab.group)}
                aria-label={`${tab.label}, ${count}${needsAnswer ? ', needs an answer' : ''}`}
                className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full border border-line-shell bg-white px-4 text-[14.5px] text-gray-800"
              >
                <span>{tab.label}</span>
                <span className="font-bold">{count}</span>
                {needsAnswer && (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 flex-shrink-0 rounded-full bg-danger"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {hold && (
        <p className="flex items-start gap-2 rounded-xl bg-warn-surface px-3.5 py-3 text-sm leading-[1.45] text-warn">
          <IconComponent
            iconName="StopCircleIcon"
            size={18}
            color="currentColor"
            className="mt-0.5 flex-shrink-0"
          />
          <span>{hold}</span>
        </p>
      )}
    </div>
  );
};
