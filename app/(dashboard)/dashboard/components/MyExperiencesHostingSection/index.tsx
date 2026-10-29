'use client';

import { useRouter } from 'next/navigation';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { useCreateExperienceDrawer } from '@/context/CreateExperienceDrawerContext';

import { useDashboardHosting } from '../../hooks/useDashboardHosting';
import { DateRail, DateRailDay } from '../DateRail';
import { HostingItemCard } from './HostingItemCard';

const railAriaLabel = (day: DateRailDay) => {
  const count = day.count ?? 0;
  const base = `${moment(day.date).format('dddd D MMM')}, ${count} ${
    count === 1 ? 'experience' : 'experiences'
  }`;
  return day.isPast ? `${base}, past` : base;
};

export const MyExperiencesHostingSection = ({
  userId,
  selectedOffset,
  onSelectOffset,
  ownsCommunity,
}: {
  userId: string | undefined;
  selectedOffset: number | null;
  onSelectOffset: (offset: number) => void;
  ownsCommunity: boolean;
}) => {
  const router = useRouter();
  const { openCreateExperience } = useCreateExperienceDrawer()!;
  const {
    items,
    days,
    selectedOffset: resolvedOffset,
    draft,
  } = useDashboardHosting(userId, selectedOffset);

  const cta = !ownsCommunity
    ? {
        label: 'Create a community',
        icon: 'UserAdd02Icon',
        onClick: () => router.push('/communities?create=community'),
      }
    : draft
      ? {
          label: 'Continue your draft',
          icon: 'Edit04Icon',
          onClick: () => openCreateExperience({ experienceId: draft.id }),
        }
      : {
          label: 'Create an experience',
          icon: 'AddCircleIcon',
          onClick: () => openCreateExperience(),
        };

  return (
    <section aria-label="My experiences (hosting)" className="flex min-w-0 flex-col gap-3">
      <div>
        <h2 className="text-[17px] font-bold tracking-[-0.2px] text-brand-ink">
          My experiences (hosting)
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">
          These are the active experiences created/co-hosted by you
        </p>
      </div>

      {items.length > 0 ? (
        <div className="flex min-w-0 flex-col gap-1.5 rounded-14 border-[0.5px] border-line-shell bg-shell p-1.5">
          {days.length > 0 && (
            <DateRail
              days={days}
              selectedOffset={resolvedOffset}
              onSelect={onSelectOffset}
              ariaLabel={railAriaLabel}
            />
          )}

          <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))] gap-x-3 gap-y-4">
            {items.map((item) => (
              <HostingItemCard key={item.key} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-surface px-4 py-3 text-sm leading-[1.45] text-ink-muted">
          {ownsCommunity ? "You aren't hosting anything right now." : 'Hosting needs a community you own.'}
        </div>
      )}

      <Button
        type="button"
        variant="gradient"
        onClick={cta.onClick}
        className="h-[52px] w-fit flex-shrink-0 gap-2 rounded-full pl-[22px] pr-7 text-[15.5px] font-semibold hover:brightness-[1.06]"
      >
        <IconComponent iconName={cta.icon} size={20} color="currentColor" />
        {cta.label}
      </Button>
    </section>
  );
};
