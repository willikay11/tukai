'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';

import { ChoosePlanView } from './ChoosePlanView';
import { HostingSubscribeView } from './HostingSubscribeView';
import { useHostingPlanDrawer } from './useHostingPlanDrawer';

const DISC =
  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface transition-colors';

/**
 * The Hosting plan drawer: Choose a plan, then Subscribe (Paystack
 * checkout, no footer of its own) - switching plans with one already
 * active goes through the same checkout, just cancelling the old
 * subscription first (see useHostingPlanDrawer.ts; there's no atomic
 * "change plan" endpoint). Reads everything - open state, the plan catalog
 * and current plan - off HostingPlanContext.
 */
export const HostingPlanDrawer = () => {
  const drawer = useHostingPlanDrawer();

  if (!drawer) return null;

  const {
    isOpen,
    view,
    plans,
    currentPlan,
    currentPlanName,
    renewalDateLabel,
    isChangeMode,
    selectedPlanId,
    selectedPlan,
    isCurrentPlanSelected,
    isInitiatingCheckout,
    checkoutUrl,
    checkoutPhase,
    paymentError,
    handleClose,
    handlePickPlan,
    handleContinue,
    handleCompareFeatures,
    handleBackToChoose,
    handlePaystackResult,
  } = drawer;

  const title =
    view === 'subscribe' && selectedPlan
      ? `Subscribe to ${selectedPlan.name}`
      : isChangeMode
        ? 'Change plan'
        : 'Choose a plan';

  const continueLabel = isChangeMode
    ? selectedPlan
      ? `Switch to ${selectedPlan.name}`
      : 'Continue'
    : selectedPlan
      ? `Continue with ${selectedPlan.name}`
      : 'Continue';

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && handleClose()} width="narrow">
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
          {view === 'subscribe' && (
            <button
              type="button"
              onClick={handleBackToChoose}
              aria-label="Back"
              className={`${DISC} text-brand hover:bg-surface-brand`}
            >
              <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
            </button>
          )}

          <h2 className="min-w-0 flex-1 truncate px-1.5 text-2xl font-bold tracking-[-0.4px] text-gray-800">
            {title}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className={`${DISC} text-danger hover:bg-danger-surface`}
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-9 pt-5">
          {view === 'choose' && (
            <ChoosePlanView
              plans={plans}
              selectedPlanId={selectedPlanId}
              currentPlanId={currentPlan.planId}
              currentPlanName={currentPlanName}
              renewalDateLabel={renewalDateLabel}
              isChangeMode={isChangeMode}
              onChoose={handlePickPlan}
              onCompareFeatures={handleCompareFeatures}
              disabled={isInitiatingCheckout}
            />
          )}

          {view === 'subscribe' && selectedPlan && (
            <HostingSubscribeView
              plan={selectedPlan}
              checkoutUrl={checkoutUrl}
              checkoutPhase={checkoutPhase}
              error={paymentError}
              onPaymentSuccess={handlePaystackResult}
            />
          )}
        </div>

        {/* Subscribe has no footer - the checkout frame is the whole
            surface, same as Paystack's own flow for a ticket purchase. */}
        {view === 'choose' && (
          <footer className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
            <button
              type="button"
              onClick={handleClose}
              className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
            >
              Cancel
            </button>
            <span className="flex-1" aria-hidden="true" />

            <Button
              type="button"
              variant="lime"
              onClick={handleContinue}
              disabled={!selectedPlan || isCurrentPlanSelected || !selectedPlan.backendId}
              isLoading={isInitiatingCheckout}
              className="h-12 rounded-full px-6 text-[15px] disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:opacity-100"
            >
              {isCurrentPlanSelected ? 'Your current plan' : continueLabel}
            </Button>
          </footer>
        )}
      </div>
    </Drawer>
  );
};
