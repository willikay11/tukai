'use client';

import { useMemo, useState } from 'react';

import moment from 'moment';

import { MonthDayFilter } from '@/app/shared/components/Calendar';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { formatTimeRange } from '@/utils/date-utils';
import {
  ALL_DAYS,
  buildActiveDays,
  dayKey,
  groupByDay,
  initialMonthFor,
} from '@/utils/reservation-calendar';

import { PanelItem } from './panelItems';

// The date maths moved to utils so a place's reservations can lay out the same
// way; re-exported because this module is where they were first imported from
export { dayKey, buildActiveDays, groupByDay, initialMonthFor };

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
  const [selectedKey, setSelectedKey] = useState<string>(ALL_DAYS);

  const days = useMemo(() => buildActiveDays(items, monthCursor), [items, monthCursor]);

  const monthItems = useMemo(
    () => items.filter((item) => item.start && moment(item.start).isSame(monthCursor, 'month')),
    [items, monthCursor],
  );

  const visibleItems = selectedKey === ALL_DAYS ? monthItems : (byDay[selectedKey] ?? []);

  const changeMonth = (delta: number) => {
    setMonthCursor((cursor) => cursor.clone().add(delta, 'month'));
    setSelectedKey(ALL_DAYS);
  };

  return (
    <div className="mt-4 rounded-3xl bg-gray-50 p-5">
      <MonthDayFilter
        monthCursor={monthCursor}
        days={days}
        countLabel={`${monthItems.length} ${monthItems.length === 1 ? 'booking' : 'bookings'}`}
        selectedKey={selectedKey}
        daysWithItems={new Set(Object.keys(byDay).filter((key) => byDay[key].length > 0))}
        onChangeMonth={changeMonth}
        onSelectKey={setSelectedKey}
      />

      <div className="mt-5 space-y-3">
        {visibleItems.length === 0 ? (
          <div className="py-8">
            <NoData
              message={selectedKey === ALL_DAYS ? 'Nothing this month' : 'Nothing on this day'}
            />
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
                <PhotoImage
                  src={item.coverPhoto}
                  alt={item.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
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
