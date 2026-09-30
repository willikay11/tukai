'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { usePlans } from '@/context/PlanContext';
import { planMeta, planWarnings, stopWarning } from '@/types/plan';
import { experiencePath, placePath } from '@/utils/detail-paths';

import { PlanStopRow } from './components/PlanStopRow';

/**
 * One plan: its day, its stops, and their order.
 *
 * Everything is edited in place and saved through the plan store, which is the
 * only thing that knows plans live in the browser rather than on the API.
 */
export const PlanPageContent = ({ planId }: { planId: string }) => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    plans,
    isReady,
    renamePlan,
    setPlanDate,
    deletePlan,
    updateStop,
    removeStop,
    reorderStops,
    sortStopsByTime,
  } = usePlans();

  const plan = plans.find((one) => one.id === planId);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');

  if (!isReady) {
    return (
      <PageContainer className="py-6">
        <div className="h-8 w-48 animate-pulse rounded-full bg-gray-100" />
      </PageContainer>
    );
  }

  if (!plan) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">
          This plan is not on this device. Plans are kept in the browser they were made in.
        </p>
        <Button onClick={() => router.push('/plans')} className="mt-4 rounded-full px-6">
          Back to my plans
        </Button>
      </PageContainer>
    );
  }

  const warnings = planWarnings(plan);

  const remove = () => {
    deletePlan(plan.id);
    toast({
      title: `${plan.title} deleted`,
      // Plans hold nothing but references; a booking is not one of them
      description: 'Nothing you booked was cancelled.',
      variant: 'success',
    });
    router.push('/plans');
  };

  return (
    <PageContainer className="space-y-5 py-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/plans')}
          aria-label="Back to my plans"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-ink transition-colors hover:bg-surface-brand"
        >
          <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
        </button>

        {isRenaming ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              renamePlan(plan.id, draftTitle.trim() || plan.title);
              setIsRenaming(false);
            }}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <input
              autoFocus
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              aria-label="Plan name"
              className="h-11 min-w-0 flex-1 rounded-full border border-line px-4 text-lg font-bold text-gray-900 outline-none focus:border-brand"
            />
            <Button type="submit" variant="lime" className="rounded-full px-4">
              Save
            </Button>
          </form>
        ) : (
          <>
            <h1 className="min-w-0 flex-1 truncate text-2xl font-bold text-gray-900">
              {plan.title}
            </h1>
            <button
              type="button"
              onClick={() => {
                setDraftTitle(plan.title);
                setIsRenaming(true);
              }}
              aria-label="Rename this plan"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface"
            >
              <IconComponent iconName="PencilEdit02Icon" size={18} color="currentColor" />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-64">
          <label className="text-13 font-medium text-ink-muted">The day</label>
          <DatePicker
            value={plan.date ?? undefined}
            onChange={(value) => setPlanDate(plan.id, value)}
            placeholder="Add a date"
            className="mt-1"
          />
        </div>

        <p className="text-13 text-ink-muted">{planMeta(plan)}</p>
      </div>

      {warnings > 0 && (
        <p className="flex items-center gap-2 rounded-14 bg-amber-50 px-4 py-3 text-13 text-amber-800">
          <IconComponent iconName="Alert02Icon" size={16} color="currentColor" />
          {warnings} {warnings === 1 ? 'stop needs' : 'stops need'} a look.
        </p>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white px-4">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-3">
          <h2 className="text-base font-bold text-gray-900">Stops</h2>

          {plan.stops.length > 1 && (
            <button
              type="button"
              onClick={() => sortStopsByTime(plan.id)}
              className="flex h-10 items-center gap-1.5 rounded-full px-3 text-13 font-medium text-brand transition-colors hover:bg-surface-brand"
            >
              <IconComponent iconName="SortingAZ01Icon" size={16} color="currentColor" />
              Sort by time
            </button>
          )}
        </div>

        {plan.stops.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-subtle">
            No stops yet. Add one from an experience or a place, with &ldquo;Plan this&rdquo;.
          </p>
        ) : (
          <ul>
            {plan.stops.map((stop, index) => (
              <PlanStopRow
                key={stop.id}
                stop={stop}
                index={index}
                total={plan.stops.length}
                warning={stopWarning(stop, plan.stops[index - 1], plan.date)}
                onChange={(changes) => updateStop(plan.id, stop.id, changes)}
                onRemove={() => removeStop(plan.id, stop.id)}
                onMoveUp={() => reorderStops(plan.id, index, index - 1)}
                onMoveDown={() => reorderStops(plan.id, index, index + 1)}
                onOpen={
                  stop.refId && stop.kind !== 'custom'
                    ? () =>
                        router.push(
                          stop.kind === 'experience'
                            ? experiencePath({ id: stop.refId as string })
                            : placePath({ id: stop.refId as string }),
                        )
                    : undefined
                }
              />
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={remove}
        className="text-sm font-semibold text-destructive hover:text-destructive/80"
      >
        Delete this plan
      </button>
    </PageContainer>
  );
};
