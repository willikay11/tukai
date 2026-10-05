'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { CARD_LIFT, MEDIA_ZOOM, TITLE_TINT } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { Plan, planMeta, planPhoto, planWarnings } from '@/types/plan';

/** Today, tomorrow, the date, or that it is still a draft. */
export const planStatus = (plan: Plan, now: moment.Moment = moment()): string => {
  if (!plan.date) return 'Draft';

  const day = moment(plan.date, 'YYYY-MM-DD', true);
  if (!day.isValid()) return 'Draft';

  const days = day.startOf('day').diff(now.clone().startOf('day'), 'days');

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';

  return day.format('ddd D MMM');
};

export const PlanCard = ({ plan, onOpen }: { plan: Plan; onOpen: () => void }) => {
  const warnings = planWarnings(plan);
  const isDraft = !plan.date;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group block w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm hover:shadow-md',
        CARD_LIFT,
      )}
    >
      <div className="relative h-[160px] bg-surface-brand">
        <PhotoImage
          src={planPhoto(plan)}
          alt={plan.title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className={cn('object-cover', MEDIA_ZOOM)}
          fallback={
            <span className="flex h-full w-full items-center justify-center text-ink-subtle">
              <IconComponent iconName="MapsIcon" size={28} color="currentColor" />
            </span>
          }
        />

        <span
          className={cn(
            'absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold',
            isDraft ? 'bg-white text-ink-muted' : 'bg-surface-brand text-brand',
          )}
        >
          {planStatus(plan)}
        </span>
      </div>

      <div className="p-4">
        <p className={cn('truncate text-base font-bold text-gray-900', TITLE_TINT)}>{plan.title}</p>
        <p className="mt-0.5 text-13 text-ink-muted">{planMeta(plan)}</p>

        {warnings > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-13 font-medium text-amber-700">
            <IconComponent iconName="Alert02Icon" size={14} color="currentColor" />
            {warnings} {warnings === 1 ? 'stop needs a look' : 'stops need a look'}
          </p>
        )}
      </div>
    </button>
  );
};
