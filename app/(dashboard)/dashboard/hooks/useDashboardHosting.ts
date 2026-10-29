import { useMemo } from 'react';

import moment from 'moment';

import { pickLatestDraft, selectDrafts } from '@/app/(experiences)/experiences/create/utils/draft-progress';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { formatCurrencyAmount } from '@/utils/money';

import { DateRailDay } from '../components/DateRail';
import { isActive, isHostedBy, toAmount } from '../utils/control-center-metrics';
import { dateFromOffset, dayOffsetOf, defaultDayOffset } from '../utils/day-offset';

export interface DashboardHostingStat {
  label: string;
  value: string;
  href: string;
}

export interface DashboardHostingItem {
  key: string;
  offset: number | null;
  title: string;
  image?: string;
  when: string;
  badge: Date | null;
  onOpenHref: string;
  stats: DashboardHostingStat[];
}

const buildItem = (experience: Experience): DashboardHostingItem => {
  const offset = experience.startDate ? dayOffsetOf(experience.startDate) : null;
  const start = experience.startDate ? moment(experience.startDate) : null;
  const end = experience.endDate ? moment(experience.endDate) : null;
  const when = start
    ? `${start.format('ddd D MMM')}, ${start.format('HH:mm')}${
        end && end.isValid() && !end.isSame(start, 'minute') ? ` - ${end.format('HH:mm')}` : ''
      }`
    : 'Time to be set';

  const created = experience.ticketsCreated ?? experience.totalTickets ?? 0;
  const sold = experience.ticketsSold ?? 0;
  const salesLabel =
    experience.isPaid === false
      ? 'Free'
      : formatCurrencyAmount(
          toAmount(experience.totalAmountSold),
          experience.totalAmountSold?.currency ?? experience.currency,
        );

  const base = `/dashboard/experiences/${experience.id}`;

  return {
    key: experience.id,
    offset,
    title: experience.title,
    image: coverPhotoUrl(experience.photos),
    when,
    badge: start ? start.toDate() : null,
    onOpenHref: base,
    stats: [
      { label: 'Tickets created', value: String(created), href: `${base}?tab=tickets` },
      { label: 'Sold', value: String(sold), href: `${base}?tab=sales` },
      { label: 'Total sales', value: salesLabel, href: `${base}?tab=sales` },
    ],
  };
};

/**
 * The Dashboard's "My experiences (hosting)" section: the host's own active
 * experiences, grouped onto a day rail, plus the latest saved draft (for the
 * "Continue your draft" CTA). `ticketsCreated`/`ticketsSold`/`totalAmountSold`
 * are already denormalized on `Experience` for its host, so no per-experience
 * fetch is needed - unlike the old Control Center page's "Recent reservations".
 */
export const useDashboardHosting = (userId: string | undefined, selectedOffset: number | null) => {
  const { data, isLoading } = useExperiences(
    { page: 1, page_size: 100, hosted_by: userId },
    Boolean(userId),
  );

  const experiences: Experience[] = useMemo(
    () => (data?.data?.results ?? []).filter((experience: Experience) => isHostedBy(experience, userId)),
    [data, userId],
  );

  const active = useMemo(() => experiences.filter(isActive), [experiences]);
  const draft = useMemo(() => pickLatestDraft(selectDrafts(experiences)), [experiences]);

  const items = useMemo(() => active.map(buildItem), [active]);

  const days: DateRailDay[] = useMemo(() => {
    const countByOffset = new Map<number, number>();
    items.forEach((item) => {
      if (item.offset === null) return;
      countByOffset.set(item.offset, (countByOffset.get(item.offset) ?? 0) + 1);
    });

    return Array.from(countByOffset.entries())
      .sort(([a], [b]) => a - b)
      .map(([offset, count]) => ({
        offset,
        date: dateFromOffset(offset),
        isPast: offset < 0,
        count,
      }));
  }, [items]);

  const resolvedOffset =
    selectedOffset !== null && days.some((day) => day.offset === selectedOffset)
      ? selectedOffset
      : days.length
        ? defaultDayOffset(days.map((day) => day.offset))
        : null;

  const visibleItems = useMemo(
    () => items.filter((item) => item.offset === resolvedOffset || item.offset === null),
    [items, resolvedOffset],
  );

  return {
    isLoading,
    activeExperiences: active,
    items: visibleItems,
    days,
    selectedOffset: resolvedOffset,
    draft,
  };
};
