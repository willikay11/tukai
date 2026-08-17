'use client';

import { useState } from 'react';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Experience } from '@/types/experience';

import { type DraftStepState, buildDraftSteps, getLastSavedAt } from '../../utils/draft-progress';

interface ResumeDraftProps {
  draft: Experience;
  onContinue: () => void;
  onClearAndStartFresh: () => void;
  isClearing?: boolean;
}

// "Yesterday, 6:42 PM" for anything within the last week, absolute beyond that
const formatLastSaved = (isoString: string): string => {
  const saved = moment(isoString);
  if (!saved.isValid()) return '—';

  return saved.isAfter(moment().subtract(6, 'days'))
    ? saved.calendar(null, {
        sameDay: '[Today], h:mm A',
        lastDay: '[Yesterday], h:mm A',
        lastWeek: 'dddd, h:mm A',
        sameElse: 'D MMM YYYY, h:mm A',
      })
    : saved.format('D MMM YYYY, h:mm A');
};

const StepCheckCircle = ({ state }: { state: DraftStepState }) => {
  if (state === 'done') {
    return (
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary">
        <IconComponent
          iconName="Tick02Icon"
          size={12}
          color="currentColor"
          className="text-white"
        />
      </span>
    );
  }

  if (state === 'current') {
    return <span className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-primary" />;
  }

  return <span className="h-5 w-5 flex-shrink-0 rounded-full bg-gray-100" />;
};

export const ResumeDraft = ({
  draft,
  onContinue,
  onClearAndStartFresh,
  isClearing = false,
}: ResumeDraftProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const steps = buildDraftSteps(draft);
  const completedCount = steps.filter((step) => step.state === 'done').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Pick up where you left off</h1>
      <p className="mt-2 text-sm text-gray-500">
        You have an unfinished experience saved. Continue it, or clear it to start something new —
        only one draft can be saved at a time.
      </p>

      <div className="mt-6 rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Draft
          </span>
          <span className="text-sm text-gray-400">
            Last saved {formatLastSaved(getLastSavedAt(draft))}
          </span>
        </div>

        <p className="mt-3 text-xl font-bold text-gray-900">
          {draft.title?.trim() || 'Untitled experience'}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex-shrink-0 text-sm text-gray-600">
            {completedCount} of {steps.length} steps complete
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-lime transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {steps.map((step) => (
            <li key={step.id} className="flex items-center gap-3">
              <StepCheckCircle state={step.state} />
              <span
                className={`text-sm ${
                  step.state === 'done'
                    ? 'text-gray-900'
                    : step.state === 'current'
                      ? 'font-semibold text-gray-900'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          onClick={onContinue}
          variant="gradient"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full"
        >
          Continue draft
          <IconComponent iconName="ArrowRight01Icon" size={16} color="currentColor" />
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-400">
        Starting something different?{' '}
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isClearing}
          className="font-semibold text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isClearing ? 'Clearing…' : 'Clear draft and start fresh'}
        </button>
      </p>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="max-w-md gap-5 rounded-2xl p-6">
          <AlertDialogHeader className="space-y-4 text-left sm:text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <IconComponent
                iconName="Delete02Icon"
                size={20}
                color="currentColor"
                className="text-red-500"
              />
            </span>

            <div className="space-y-2">
              <AlertDialogTitle className="text-lg font-bold text-gray-900">
                Clear this draft?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-gray-500">
                &ldquo;{draft.title?.trim() || 'Untitled experience'}&rdquo; will be deleted and you
                will start the wizard from scratch. This cannot be undone.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-3">
            {/* Plain text, so the destructive action is the only thing that reads
                as a button */}
            <AlertDialogCancel className="border-0 bg-transparent font-medium text-gray-600 shadow-none hover:bg-transparent hover:text-gray-900">
              Keep draft
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onClearAndStartFresh}
              className="rounded-lg bg-destructive px-5 text-destructive-foreground hover:bg-destructive/90"
            >
              Clear and start fresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
