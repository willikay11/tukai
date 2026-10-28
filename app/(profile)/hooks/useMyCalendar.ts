'use client';

import { useMemo, useState } from 'react';

import moment from 'moment';

import { useExperiences, useTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';

import { CalendarItem, buildCalendarAgenda, defaultDayOffset, itemsFrom } from './calendar-agenda';

/**
 * Everything "My calendar" on the profile's Overview tab needs: the reader's
 * upcoming bookings, what they are hosting, and their past bookings read back
 * as attended - plus the day rail and its selection.
 */
export const useMyCalendar = (userId?: string | null) => {
  const enabled = Boolean(userId);

  const { data: purchasesResponse, isLoading: isLoadingPurchases } = useTicketPurchases(
    userId ?? undefined,
    enabled,
  );
  const { data: reservedResponse, isLoading: isLoadingReserved } = useExperiences(
    { page: 1, page_size: 100, reserved_by: userId ?? undefined },
    enabled,
  );
  const { data: hostedResponse, isLoading: isLoadingHosted } = useExperiences(
    { page: 1, page_size: 100, hosted_by: userId ?? undefined },
    enabled,
  );

  const purchases: TicketPurchase[] = useMemo(
    () => purchasesResponse?.data?.results ?? [],
    [purchasesResponse],
  );
  const reservedExperiences: Experience[] = useMemo(
    () => reservedResponse?.data?.results ?? [],
    [reservedResponse],
  );
  const hostedExperiences: Experience[] = useMemo(
    () => hostedResponse?.data?.results ?? [],
    [hostedResponse],
  );

  const { agenda, days } = useMemo(
    () => buildCalendarAgenda(purchases, reservedExperiences, hostedExperiences),
    [purchases, reservedExperiences, hostedExperiences],
  );

  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);

  const defaultOffset = defaultDayOffset(days);
  const offset =
    selectedOffset != null && days.some((day) => day.offset === selectedOffset)
      ? selectedOffset
      : defaultOffset;

  const index = days.findIndex((day) => day.offset === offset);
  const items = itemsFrom(agenda, offset);
  const attended: CalendarItem[] = useMemo(
    () => agenda.filter((item) => item.tag === 'Attended'),
    [agenda],
  );

  return {
    isLoading: isLoadingPurchases || isLoadingReserved || isLoadingHosted,
    agenda,
    attended,
    days,
    offset,
    onSelectOffset: setSelectedOffset,
    items,
    label: moment().startOf('day').add(offset, 'days').format('MMMM YYYY'),
    emptyLine: `Nothing planned from ${moment()
      .startOf('day')
      .add(offset, 'days')
      .format('ddd D MMM')} onward.`,
    showToday: offset !== defaultOffset,
    onToday: () => setSelectedOffset(defaultOffset),
    atStart: index <= 0,
    atEnd: index < 0 || index >= days.length - 1,
    onPrev: () => {
      if (index > 0) setSelectedOffset(days[index - 1].offset);
    },
    onNext: () => {
      if (index >= 0 && index < days.length - 1) setSelectedOffset(days[index + 1].offset);
    },
  };
};
