'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { NoData } from '@/components/ui/noData';
import { formatTimeRange } from '@/utils/date-utils';

import { ReservationView } from './types';

const DAYS_PER_PAGE = 7;

export const dayKey = (date: Date | string): string => moment(date).format('YYYY-MM-DD');

// One 7-day window per page, walking forward from the 1st. The final window can
// run into the next month, which is what makes strips like "Thu 27 … Tue 1"
export const buildDayPages = (monthCursor: moment.Moment): Date[][] => {
  const start = monthCursor.clone().startOf('month');
  const pageCount = Math.ceil(monthCursor.daysInMonth() / DAYS_PER_PAGE);

  return Array.from({ length: pageCount }, (_, pageIndex) =>
    Array.from({ length: DAYS_PER_PAGE }, (_, dayIndex) =>
      start
        .clone()
        .add(pageIndex * DAYS_PER_PAGE + dayIndex, 'days')
        .toDate(),
    ),
  );
};

export const groupByDay = (reservations: ReservationView[]): Record<string, ReservationView[]> =>
  reservations.reduce<Record<string, ReservationView[]>>((accumulator, reservation) => {
    if (!reservation.start) return accumulator;
    const key = dayKey(reservation.start);
    accumulator[key] = [...(accumulator[key] ?? []), reservation];
    return accumulator;
  }, {});

const WeekDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, index) => (
      <span
        key={index}
        className={`h-1.5 rounded-full transition-all ${
          index === current ? 'w-4 bg-primary' : 'w-1.5 bg-gray-300'
        }`}
      />
    ))}
  </div>
);

interface ReservationCalendarPanelProps {
  reservations: ReservationView[];
  onViewTicket: (reservation: ReservationView) => void;
}

export const ReservationCalendarPanel = ({
  reservations,
  onViewTicket,
}: ReservationCalendarPanelProps) => {
  const byDay = useMemo(() => groupByDay(reservations), [reservations]);

  // Open on the month holding the soonest reservation, falling back to today
  const initialMonth = useMemo(() => {
    const earliest = reservations
      .map((reservation) => reservation.start)
      .filter(Boolean)
      .sort()[0];
    return earliest ? moment(earliest).startOf('month') : moment().startOf('month');
  }, [reservations]);

  const [monthCursor, setMonthCursor] = useState(initialMonth);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const pages = useMemo(() => buildDayPages(monthCursor), [monthCursor]);

  // Default to the first day in this month that actually has something on it
  const defaultKey = useMemo(() => {
    const inMonth = pages
      .flat()
      .map(dayKey)
      .find((key) => (byDay[key]?.length ?? 0) > 0);
    return inMonth ?? dayKey(pages[0]?.[0] ?? new Date());
  }, [pages, byDay]);

  const activeKey = selectedKey ?? defaultKey;
  const activePageIndex = Math.max(
    pages.findIndex((page) => page.some((day) => dayKey(day) === activeKey)),
    0,
  );
  const [pageIndex, setPageIndex] = useState<number | null>(null);
  const currentPage = pages[pageIndex ?? activePageIndex] ?? pages[0] ?? [];

  const changeMonth = (delta: number) => {
    setMonthCursor((cursor) => cursor.clone().add(delta, 'month'));
    setSelectedKey(null);
    setPageIndex(null);
  };

  const selectedReservations = byDay[activeKey] ?? [];

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

        <WeekDots current={pageIndex ?? activePageIndex} total={pages.length} />
      </div>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {currentPage.map((day) => {
          const key = dayKey(day);
          const isSelected = key === activeKey;
          const hasItems = (byDay[key]?.length ?? 0) > 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedKey(key);
                setPageIndex(pages.findIndex((page) => page.some((item) => dayKey(item) === key)));
              }}
              aria-pressed={isSelected}
              className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm ${
                isSelected
                  ? 'border-transparent bg-green-200 font-semibold text-gray-900'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <span>{moment(day).format('ddd')}</span>
              <span className="font-bold">{day.getDate()}</span>
              {hasItems && <span className="h-1.5 w-1.5 rounded-full bg-lime" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {selectedReservations.length === 0 ? (
          <div className="py-8">
            <NoData message="Nothing on this day" />
          </div>
        ) : (
          selectedReservations.map((reservation) => (
            <div
              key={reservation.key}
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-white px-4 py-3"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
                {reservation.coverPhoto ? (
                  <Image
                    src={reservation.coverPhoto}
                    alt={reservation.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{reservation.title}</p>
                <p className="truncate text-sm text-gray-400">
                  {[
                    reservation.priceAmount !== null
                      ? `from ${reservation.currency} ${reservation.priceAmount.toLocaleString()}`
                      : null,
                    formatTimeRange(reservation.start, reservation.end),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              {reservation.tickets.length > 0 && (
                <button
                  type="button"
                  onClick={() => onViewTicket(reservation)}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:border-gray-300"
                >
                  <IconComponent iconName="Ticket01Icon" size={15} className="text-primary" />
                  View ticket
                </button>
              )}

              {reservation.start && (
                <div className="flex flex-shrink-0 flex-col items-center rounded-xl bg-gray-50 px-3 py-2">
                  <span className="text-[11px] text-gray-400">
                    {moment(reservation.start).format('MMM')}
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {new Date(reservation.start).getDate()}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
