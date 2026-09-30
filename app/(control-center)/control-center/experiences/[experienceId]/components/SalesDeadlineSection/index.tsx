'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useUpdateExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';

import {
  DEADLINE_PRESETS,
  DeadlinePreset,
  deadlineAt,
  deadlineLabel,
  deadlineWhen,
  presetFor,
} from './deadline';

/**
 * When ticket sales close, for the whole experience.
 *
 * One setting, read back as a date so a host does not have to work out what "1
 * day before the experience starts" comes to, and offered as the canvas's three
 * choices. A value set elsewhere that is none of the three still reads here.
 */
export const SalesDeadlineSection = ({ experience }: { experience: Experience }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const current = presetFor(
    experience.ticketSalesClosingDuration,
    experience.ticketSalesClosingUnit,
    experience.ticketSalesClosingCondition,
  );
  const [draft, setDraft] = useState<DeadlinePreset | undefined>(current);

  const { mutate: updateExperience, isPending } = useUpdateExperience(experience.id);

  const isRecurring = Boolean(experience.recurrenceRule);
  const label = deadlineLabel(
    experience.ticketSalesClosingDuration,
    experience.ticketSalesClosingUnit,
    experience.ticketSalesClosingCondition,
  );

  const cancel = () => {
    setDraft(current);
    setIsEditing(false);
  };

  const save = () => {
    if (!draft) return;

    updateExperience(
      {
        // The PATCH requires these three even when nothing about them changed
        title: experience.title,
        description: experience.description,
        recurrence_rule: experience.recurrenceRule ?? '',
        ticketSalesClosingDuration: draft.duration,
        ticketSalesClosingUnit: draft.unit,
        ticketSalesClosingCondition: draft.condition,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({
            title: 'Sales deadline saved',
            description: deadlineWhen(deadlineAt(experience, draft), isRecurring),
            variant: 'success',
          });
        },
        onError: (error: { message?: string } | Error) =>
          toast({
            title: 'Could not save the deadline',
            description: error.message ?? 'Please try again.',
            variant: 'destructive',
          }),
      },
    );
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h3 className="text-19 font-bold tracking-tight text-gray-900">
          Sales deadline{' '}
          <span className="text-15 font-normal tracking-normal text-ink-muted">
            (ticket sales close automatically at this time)
          </span>
        </h3>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full px-2.5 text-15 font-medium text-brand transition-colors hover:bg-surface-brand"
          >
            <IconComponent iconName="PencilEdit02Icon" size={20} color="currentColor" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div
            role="radiogroup"
            aria-label="Sales deadline"
            className="flex flex-col items-start gap-2"
          >
            {DEADLINE_PRESETS.map((preset) => {
              const isOn = draft?.key === preset.key;

              return (
                <button
                  key={preset.key}
                  type="button"
                  role="radio"
                  aria-checked={isOn}
                  onClick={() => setDraft(preset)}
                  className={cn(
                    'min-h-12 rounded-full px-5 py-2.5 text-left text-15 transition-colors',
                    isOn ? 'bg-emerald-200 text-brand-deep' : 'bg-surface text-gray-900',
                  )}
                >
                  {deadlineLabel(preset.duration, preset.unit, preset.condition)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={cancel} className="text-danger">
              Cancel
            </Button>
            <Button
              type="button"
              variant="lime"
              onClick={save}
              disabled={!draft}
              isLoading={isPending}
              className="rounded-full px-6"
            >
              Save changes
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          <span className="text-15 text-gray-900">{label}</span>
          <span className="text-13 text-ink-muted">
            {deadlineWhen(deadlineAt(experience), isRecurring)}
          </span>
        </div>
      )}
    </section>
  );
};
