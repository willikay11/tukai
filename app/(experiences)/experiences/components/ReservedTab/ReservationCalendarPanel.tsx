'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { formatTimeRange } from '@/utils/date-utils';

import { PanelItem } from './panelItems';

export const dayKey = (date: Date | string): string => moment(date).format('YYYY-MM-DD');

// Only the days that actually have bookings — an empty day pill is noise, and a
// full month of them buries the handful that matter
export const buildActiveDays = (items: PanelItem[], monthCursor: moment.Moment): Date[] =>
  Array.from(
    new Set(
      items
        .filter((item) => item.start && moment(item.start).isSame(monthCursor, 'month'))
        .map((item) => dayKey(item.start!)),
    ),
  )
    .sort()
    .map((key) => moment(key).toDate());

export const groupByDay = (items: PanelItem[]): Record<string, PanelItem[]> =>
  items.reduce<Record<string, PanelItem[]>>((accumulator, item) => {
    if (!item.start) return accumulator;
    const key = dayKey(item.start);
    accumulator[key] = [...(accumulator[key] ?? []), item];
    return accumulator;
  }, {});

/**
 * Which month the panel opens on.
 *
 * It used to open on the earliest item, which meant the oldest booking in the
 * user's history pinned the panel to a long-past month. The current month is
 * the useful default; the panel only jumps forward when there is nothing to
 * show now but something later on.
 */
export const initialMonthFor = (items: PanelItem[], now: Date = new Date()): moment.Moment => {
  const thisMonth = moment(now).startOf('month');

  const starts = items
    .map((item) => item.start)
    .filter((start): start is string => Boolean(start))
    .sort();

  if (starts.some((start) => moment(start).isSame(thisMonth, 'month'))) return thisMonth;

  const nextWithItems = starts.find((start) => moment(start).isAfter(thisMonth, 'month'));
  return nextWithItems ? moment(nextWithItems).startOf('month') : thisMonth;
};

const ALL = 'all';

const StatusPill = ({ kind }: { kind: PanelItem['kind'] }) =>
  kind === 'invite' ? (
    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
      Invite
    </span>
  ) : (
    <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
      Reserved
    </span>
  );

interface ReservationCalendarPanelProps {
  items: PanelItem[];
  onViewTicket: (item: PanelItem) => void;
  onAcceptInvite?: (item: PanelItem) => void;
  onDeclineInvite?: (item: PanelItem) => void;
  // No accept/decline endpoint exists yet — see ReservedTab
  invitesActionable?: boolean;
}

export const ReservationCalendarPanel = ({
  items,
  onViewTicket,
  onAcceptInvite,
  onDeclineInvite,
  invitesActionable = false,
}: ReservationCalendarPanelProps) => {
  const byDay = useMemo(() => groupByDay(items), [items]);

  const [monthCursor, setMonthCursor] = useState(() => initialMonthFor(items));
  const [selectedKey, setSelectedKey] = useState<string>(ALL);

  const days = useMemo(() => buildActiveDays(items, monthCursor), [items, monthCursor]);

  const monthItems = useMemo(
    () => items.filter((item) => item.start && moment(item.start).isSame(monthCursor, 'month')),
    [items, monthCursor],
  );

  const visibleItems = selectedKey === ALL ? monthItems : (byDay[selectedKey] ?? []);

  const changeMonth = (delta: number) => {
    setMonthCursor((cursor) => cursor.clone().add(delta, 'month'));
    setSelectedKey(ALL);
  };

  return (
    <div className="mt-4 rounded-3xl bg-gray-50 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={16} color="currentColor" />
          </button>
          <span className="text-lg font-bold text-gray-900">{monthCursor.format('MMMM')}</span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <IconComponent iconName="ArrowRight01Icon" size={16} color="currentColor" />
          </button>
        </div>

        <span className="flex-shrink-0 text-sm text-gray-400">
          {monthItems.length} {monthItems.length === 1 ? 'booking' : 'bookings'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setSelectedKey(ALL)}
          aria-pressed={selectedKey === ALL}
          className={`flex-shrink-0 rounded-full border px-5 py-2.5 text-sm ${
            selectedKey === ALL
              ? 'border-transparent bg-green-200 font-semibold text-gray-900'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          All
        </button>

        {days.map((day) => {
          const key = dayKey(day);
          const isSelected = key === selectedKey;
          const hasItems = (byDay[key]?.length ?? 0) > 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(key)}
              aria-pressed={isSelected}
              className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm ${
                isSelected
                  ? 'border-transparent bg-green-200 font-semibold text-gray-900'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <span>{moment(day).format('ddd')}</span>
              <span className="font-bold">{day.getDate()}</span>
              {hasItems && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {visibleItems.length === 0 ? (
          <div className="py-8">
            <NoData message={selectedKey === ALL ? 'Nothing this month' : 'Nothing on this day'} />
          </div>
        ) : (
          visibleItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-white px-4 py-3"
            >
              {item.start && (
                <div className="flex w-14 flex-shrink-0 flex-col items-center rounded-xl bg-indigo-50 py-2">
                  <span className="text-[11px] text-gray-400">
                    {moment(item.start).format('MMM')}
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {moment(item.start).date()}
                  </span>
                </div>
              )}

              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                {item.coverPhoto ? (
                  <Image
                    src={item.coverPhoto}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusPill kind={item.kind} />
                  {item.start && (
                    <span className="text-sm text-gray-400">
                      {moment(item.start).format('ddd D MMM')}
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-base font-bold text-gray-900">{item.title}</p>
                <p className="truncate text-sm text-gray-400">
                  {[item.priceLabel, formatTimeRange(item.start, item.end)]
                    .filter(Boolean)
                    .join('  •  ')}
                </p>
              </div>

              {item.kind === 'invite' ? (
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Button
                    onClick={() => onAcceptInvite?.(item)}
                    disabled={!invitesActionable}
                    title={
                      invitesActionable ? undefined : 'Responding to invites is not available yet'
                    }
                    className="rounded-full px-6"
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onDeclineInvite?.(item)}
                    disabled={!invitesActionable}
                    title={
                      invitesActionable ? undefined : 'Responding to invites is not available yet'
                    }
                    className="rounded-full px-6 text-gray-500"
                  >
                    Decline
                  </Button>
                </div>
              ) : (
                item.reservation &&
                item.reservation.tickets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onViewTicket(item)}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:border-gray-300"
                  >
                    <IconComponent iconName="Ticket01Icon" size={15} className="text-primary" />
                    View ticket
                  </button>
                )
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
