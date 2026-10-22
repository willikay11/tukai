'use client';

import { useState } from 'react';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { getHostingPlan } from '@/services/hostingPlans';

/**
 * The Dashboard's "Hosting plan" card - mirrors WalletsSection/EarningsSection's
 * self-contained card shell, reading the mocked plan store straight off
 * HostingPlanContext rather than through props.
 */
export const HostingPlanCard = () => {
  const hostingPlan = useHostingPlan();
  const { toast } = useToast();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  if (!hostingPlan || !hostingPlan.isReady) return null;

  const { currentPlan, openHostingPlanFlow, cancel, resume, isCancelling, isResuming } =
    hostingPlan;
  const plan = currentPlan.planId ? getHostingPlan(currentPlan.planId) : undefined;
  const renewalLabel = currentPlan.currentPeriodEnd
    ? moment(currentPlan.currentPeriodEnd).format('ddd D MMM')
    : null;

  const handleCancel = () => {
    cancel().then(() => {
      setIsCancelConfirmOpen(false);
      toast({
        title: 'Plan cancelled',
        description: renewalLabel ? `You keep ${plan?.name} until ${renewalLabel}.` : undefined,
        variant: 'success',
      });
    });
  };

  const handleResume = () => {
    resume().then(() => {
      toast({
        title: 'Your plan renews',
        description: renewalLabel
          ? `Your ${plan?.name} plan renews on ${renewalLabel}.`
          : undefined,
        variant: 'success',
      });
    });
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3.5">
          <span className="text-13 leading-snug text-ink-muted">Hosting plan</span>

          {!plan ? (
            <>
              <span className="text-xl font-bold leading-snug text-gray-900">No plan yet</span>
              <p className="text-sm leading-relaxed text-ink-muted">
                You need a plan to create experiences. Plans start at $1 a month.
              </p>
              <Button
                variant="gradient"
                className="w-fit rounded-full px-5"
                onClick={() => openHostingPlanFlow({ view: 'choose' })}
              >
                Choose a plan
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-1 gap-x-4">
                <span className="text-xl font-bold leading-snug text-gray-900">{plan.name}</span>
                <span className="whitespace-nowrap text-sm font-semibold text-gray-800">
                  {plan.priceLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentPlan.status === 'cancel_pending' ? (
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-warn-surface px-2.5 text-13 font-semibold text-warn">
                    <IconComponent iconName="Clock01Icon" size={14} color="currentColor" />
                    {renewalLabel ? `Ends ${renewalLabel}` : 'Ending soon'}
                  </span>
                ) : (
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-brand px-2.5 text-13 font-semibold text-brand">
                    <IconComponent iconName="Calendar03Icon" size={14} color="currentColor" />
                    {renewalLabel ? `Renews ${renewalLabel}` : 'Active'}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-13 font-semibold text-brand">
                  <IconComponent iconName="Ticket01Icon" size={14} color="currentColor" />
                  {plan.commissionPct}% per paid ticket
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentPlan.status === 'cancel_pending' ? (
                  <Button
                    variant="lime"
                    className="h-11 rounded-full px-5 text-sm"
                    isLoading={isResuming}
                    onClick={handleResume}
                  >
                    Keep my plan
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      className="h-11 rounded-full bg-surface px-5 text-sm text-brand hover:bg-surface-brand"
                      onClick={() => openHostingPlanFlow({ view: 'choose' })}
                    >
                      Change plan
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="h-11 px-2 text-sm font-medium text-danger hover:underline"
                    >
                      Cancel plan
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <AlertDialog
        open={isCancelConfirmOpen}
        onOpenChange={(open) => !open && setIsCancelConfirmOpen(false)}
      >
        <AlertDialogContent className="max-w-[420px] gap-[22px] rounded-[18px] p-6">
          <AlertDialogHeader className="space-y-2 text-left sm:text-left">
            <AlertDialogTitle className="text-[21px] font-bold leading-tight tracking-[-0.3px] text-gray-900">
              Cancel your {plan?.name} plan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] leading-relaxed text-ink-muted">
              {renewalLabel
                ? `You keep ${plan?.name} until ${renewalLabel}. After that you’ll need a plan to create experiences.`
                : 'After this period ends you’ll need a plan to create experiences.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2 sm:space-x-0">
            <Button
              variant="destructive"
              isLoading={isCancelling}
              onClick={handleCancel}
              className="h-12 w-full rounded-full text-[15px]"
            >
              Cancel plan
            </Button>
            <button
              type="button"
              onClick={() => setIsCancelConfirmOpen(false)}
              className="h-12 w-full rounded-full bg-surface text-[15px] font-semibold text-gray-900 hover:bg-surface-brand"
            >
              Keep plan
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
