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
import { Community } from '@/types/community';

/** One name, "A and B" for two, "{n} communities" for three or more. */
const nameList = (communities: Community[]): string => {
  if (communities.length === 1) return communities[0].title;
  if (communities.length === 2) return `${communities[0].title} and ${communities[1].title}`;
  return `${communities.length} communities`;
};

/**
 * The Dashboard's "Hosting plan" card - mirrors the Dashboard balance card's
 * shell, reading the mocked plan store straight off HostingPlanContext rather
 * than through props. `ownedCommunities` is only used to word the
 * verified-business-aware note and cancel copy the handoff calls for.
 */
export const HostingPlanCard = ({ ownedCommunities }: { ownedCommunities: Community[] }) => {
  const hostingPlan = useHostingPlan();
  const { toast } = useToast();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  if (!hostingPlan) return null;

  const { currentPlan, openHostingPlanFlow, cancel, resume, isCancelling, isResuming } =
    hostingPlan;
  const plan = currentPlan.planId ? getHostingPlan(currentPlan.planId) : undefined;
  const renewalLabel = currentPlan.currentPeriodEnd
    ? moment(currentPlan.currentPeriodEnd).format('ddd D MMM')
    : null;
  const off = currentPlan.status === 'cancel_pending';

  const verifiedBusinesses = ownedCommunities.filter((community) => community.verified);
  const otherCommunities = ownedCommunities.filter((community) => !community.verified);

  const note = !plan
    ? null
    : plan.priceAmount > 0
      ? `Covers every community you own.${
          verifiedBusinesses.length ? ' Verified businesses pay 8% per paid ticket.' : ''
        }`
      : verifiedBusinesses.length
        ? `Free for ${nameList(verifiedBusinesses)}.${
            otherCommunities.length
              ? ` ${nameList(otherCommunities)} ${
                  otherCommunities.length === 1 ? 'needs' : 'need'
                } Premium or Business to host.`
              : ''
          }`
        : 'Free for verified businesses. Communities that own a claimed place host free on Basic.';

  const handleCancel = () => {
    cancel().then(() => {
      setIsCancelConfirmOpen(false);
      toast({
        title: 'Plan cancelled',
        description: renewalLabel
          ? `You keep ${plan?.name} until ${renewalLabel}${
              verifiedBusinesses.length ? ', then move to Basic.' : '.'
            }`
          : undefined,
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
      <div className="flex flex-col gap-1.5 rounded-xl border-[0.5px] border-line-shell bg-shell p-1.5">
        <div className="flex flex-col gap-3.5 rounded-xl border-[0.5px] border-surface bg-white p-[18px] shadow-[0_0_4px_0_rgba(0,0,0,.12)]">
          {!plan ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-[13.5px] text-ink-muted">Hosting plan</span>
                <span className="text-[21px] font-bold leading-[1.25] tracking-[-0.35px] text-brand-ink">
                  No plan yet
                </span>
              </div>
              <p className="m-0 text-sm leading-[1.5] text-ink-note">
                Your communities need Premium or Business to host. Communities that own a claimed
                place host free on Basic.
              </p>
              <Button
                type="button"
                variant="gradient"
                onClick={() => openHostingPlanFlow({ view: 'choose' })}
                className="w-fit self-start rounded-full px-[18px] text-[14.5px] font-semibold"
              >
                Choose a plan
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-[13.5px] text-ink-muted">Hosting plan</span>
                <div className="flex flex-wrap items-baseline justify-between gap-1 gap-x-3">
                  <span className="text-[21px] font-bold leading-[1.25] tracking-[-0.35px] text-brand-ink">
                    {plan.name}
                  </span>
                  <span className="whitespace-nowrap text-[14.5px] font-semibold text-gray-800">
                    {plan.priceLabel}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 gap-x-3">
                {off ? (
                  <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full bg-warn-surface px-2.5 text-[13px] font-semibold text-warn">
                    <IconComponent iconName="Clock01Icon" size={14} color="currentColor" />
                    {renewalLabel ? `Ends ${renewalLabel}` : 'Ending soon'}
                  </span>
                ) : (
                  <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-brand px-2.5 text-[13px] font-semibold text-brand">
                    <IconComponent
                      iconName={plan.priceAmount > 0 ? 'Calendar03Icon' : 'CheckmarkCircle02Icon'}
                      size={14}
                      color="currentColor"
                    />
                    {plan.priceAmount > 0
                      ? renewalLabel
                        ? `Renews ${renewalLabel}`
                        : 'Active'
                      : 'Always free'}
                  </span>
                )}
                {plan.commissionPct != null && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand">
                    <IconComponent iconName="Ticket01Icon" size={15} color="currentColor" />
                    {plan.commissionPct}% per paid ticket
                  </span>
                )}
              </div>

              {note && <p className="m-0 text-[13.5px] leading-[1.5] text-ink-muted">{note}</p>}

              <div className="flex flex-wrap items-center gap-2">
                {off ? (
                  <Button
                    type="button"
                    variant="lime"
                    className="h-11 rounded-full px-[18px] text-[14.5px] font-semibold"
                    isLoading={isResuming}
                    onClick={handleResume}
                  >
                    Keep my plan
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-11 rounded-full bg-surface px-[18px] text-[14.5px] font-semibold text-brand hover:bg-surface-tab"
                      onClick={() => openHostingPlanFlow({ view: 'choose' })}
                    >
                      Change plan
                    </Button>
                    {plan.priceAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCancelConfirmOpen(true)}
                        className="h-11 px-2.5 text-[14.5px] font-medium text-danger hover:underline"
                      >
                        Cancel plan
                      </button>
                    )}
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
                ? `You keep ${plan?.name} until ${renewalLabel}. ${
                    verifiedBusinesses.length
                      ? 'After that you move to Basic, which is free for your verified businesses.'
                      : 'After that your communities need a plan again to host.'
                  }`
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
