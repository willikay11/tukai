'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { usePlans } from '@/context/PlanContext';
import { cn } from '@/lib/utils';
import { PlanStopKind } from '@/types/plan';

import { DEFAULT_SLOT, SLOTS, alreadyInPlan, planOptionNote, planThisWarning } from './plan-this';

const NEW_PLAN = 'new';

export type PlanThisSubject = {
  kind: Exclude<PlanStopKind, 'custom'>;
  refId: string;
  title: string;
  subtitle?: string;
  photo?: string | null;
  /** For an experience: the date it runs. Its time is the host's to set. */
  refDate?: string | null;
  soldOut?: boolean;
};

/**
 * Adding an experience or a place to a plan.
 *
 * Nothing here books anything, which the message afterwards says outright -
 * the canvas is emphatic about it, because "add to plan" beside a ticket price
 * reads like a purchase.
 */
export const PlanThisDrawer = ({
  subject,
  isOpen,
  onClose,
}: {
  subject: PlanThisSubject;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { plans, createPlan, addStop, setPlanDate } = usePlans();

  const isExperience = subject.kind === 'experience';
  const defaultPlan = isExperience
    ? plans.find((plan) => plan.date && plan.date.slice(0, 10) === subject.refDate?.slice(0, 10))
    : undefined;

  const [selected, setSelected] = useState<string>(defaultPlan?.id ?? plans[0]?.id ?? NEW_PLAN);
  const [newTitle, setNewTitle] = useState('');
  const [slot, setSlot] = useState(DEFAULT_SLOT.id);

  const chosen = plans.find((plan) => plan.id === selected);
  const isNew = selected === NEW_PLAN || plans.length === 0;
  const warning = planThisWarning({
    plan: isNew ? undefined : chosen,
    refId: subject.refId,
    refDate: subject.refDate,
    soldOut: subject.soldOut,
  });
  const isAlreadyIn = !isNew && alreadyInPlan(chosen, subject.refId);

  const suggestedName = isExperience
    ? `Plan for ${subject.refDate?.slice(0, 10) ?? subject.title}`
    : 'New plan';

  const add = () => {
    if (isAlreadyIn) return;

    const time = isExperience
      ? undefined
      : (SLOTS.find((one) => one.id === slot) ?? DEFAULT_SLOT).time;

    const stop = {
      kind: subject.kind,
      refId: subject.refId,
      title: subject.title,
      subtitle: subject.subtitle,
      photo: subject.photo,
      refDate: subject.refDate,
      soldOut: subject.soldOut,
      // An experience runs when the host says; only its date is known here
      ...(time ? { time } : {}),
    };

    let planId = selected;
    let planName = chosen?.title ?? '';

    if (isNew) {
      const created = createPlan(newTitle.trim() || suggestedName);
      planId = created.id;
      planName = created.title;

      // A plan made around an experience takes that experience's day
      if (isExperience && subject.refDate) {
        setPlanDate(created.id, subject.refDate.slice(0, 10));
      }
    }

    addStop(planId, stop);
    onClose();

    toast({
      title: `${subject.title} is in ${planName}`,
      description: 'Nothing was booked.',
      variant: 'success',
    });

    router.push(`/plans/${planId}`);
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && onClose()} width="narrow">
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-brand"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
          <h2 className="text-19 font-bold tracking-tight text-gray-900">Plan this</h2>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
              <PhotoImage
                src={subject.photo ?? undefined}
                alt={subject.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-gray-900">{subject.title}</p>
              {subject.subtitle && (
                <p className="truncate text-13 text-ink-muted">{subject.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span id="plan-choice" className="text-15 font-semibold text-gray-900">
              Which plan?
            </span>

            <div role="radiogroup" aria-labelledby="plan-choice" className="flex flex-col gap-2">
              {plans.map((plan) => {
                const isOn = !isNew && selected === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    role="radio"
                    aria-checked={isOn}
                    onClick={() => setSelected(plan.id)}
                    className={cn(
                      'flex flex-col items-start gap-0.5 rounded-14 px-4 py-3 text-left transition-colors',
                      isOn ? 'bg-surface-brand ring-1 ring-brand' : 'bg-surface',
                    )}
                  >
                    <span className="text-15 font-medium text-gray-900">{plan.title}</span>
                    <span className="text-13 text-ink-muted">{planOptionNote(plan)}</span>
                  </button>
                );
              })}

              <button
                type="button"
                role="radio"
                aria-checked={isNew}
                onClick={() => setSelected(NEW_PLAN)}
                className={cn(
                  'flex flex-col items-start gap-0.5 rounded-14 px-4 py-3 text-left transition-colors',
                  isNew ? 'bg-surface-brand ring-1 ring-brand' : 'bg-surface',
                )}
              >
                <span className="text-15 font-medium text-gray-900">New plan</span>
                <span className="text-13 text-ink-muted">
                  {isExperience && subject.refDate
                    ? `Starts on ${subject.refDate.slice(0, 10)}`
                    : 'Pick a day later'}
                </span>
              </button>
            </div>
          </div>

          {isNew && (
            <div className="flex flex-col gap-2.5">
              <label htmlFor="plan-name" className="text-15 font-semibold text-gray-900">
                Call it
              </label>
              <input
                id="plan-name"
                type="text"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value.slice(0, 60))}
                placeholder={suggestedName}
                className="h-[52px] rounded-14 border border-line bg-white px-4 text-15 text-gray-900 outline-none focus:border-brand"
              />
            </div>
          )}

          {isExperience ? (
            <p className="rounded-14 bg-surface px-4 py-3 text-13 leading-relaxed text-ink-muted">
              {subject.refDate
                ? `This runs on ${subject.refDate.slice(0, 10)}. The host sets the time.`
                : 'The host sets the time for this.'}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              <span id="plan-slot" className="text-15 font-semibold text-gray-900">
                When in the day?
              </span>
              <div role="radiogroup" aria-labelledby="plan-slot" className="flex flex-wrap gap-2">
                {SLOTS.map((option) => {
                  const isOn = slot === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isOn}
                      onClick={() => setSlot(option.id)}
                      className={cn(
                        'h-11 rounded-full px-4 text-15 font-medium transition-colors',
                        isOn ? 'bg-brand-ink text-white' : 'bg-surface text-gray-900',
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {warning && (
            <p
              role="alert"
              className="rounded-14 bg-amber-50 px-4 py-3 text-13 leading-relaxed text-amber-800"
            >
              {warning}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose} className="text-danger">
            Cancel
          </Button>
          <Button
            type="button"
            variant="lime"
            onClick={add}
            disabled={isAlreadyIn}
            className="rounded-full px-6"
          >
            {isAlreadyIn
              ? 'Already in this plan'
              : isNew
                ? 'Create and add'
                : `Add to ${chosen?.title ?? 'plan'}`}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
