'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import moment from 'moment';

import { useToast } from '@/app/shared/hooks/useToast';
import { useCreateCommunityDrawer } from '@/context/CreateCommunityDrawerContext';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { HostingPlanId } from '@/types/hostingPlan';

type DrawerView = 'choose' | 'subscribe';

// What the Subscribe view's checkout frame shows: the Paystack iframe, or -
// once it reports a payment - the confirming panel in its place.
type CheckoutPhase = 'frame' | 'confirming';

// The handoff's own prototype timing for the confirming state - also gives
// the backend's webhook a moment to land before confirmSubscription reads
// the subscription back.
const CONFIRMING_DELAY_MS = 1600;

const PAYMENT_FAILED_MESSAGE =
  'The payment didn’t go through, so nothing was charged. Try again, or use another card or M-Pesa number.';

/**
 * All state and handlers for the Hosting plan drawer. Reads the real plan
 * store off HostingPlanContext and layers the drawer's own view/checkout
 * state on top of it.
 *
 * Paying for a plan is the same real mechanism as buying an experience
 * ticket (BookingPanel): no billing form of our own - "Continue with
 * {plan}" starts a subscription on the backend and the Subscribe view
 * loads the authorization_url it returns straight into <Paystack>, watched
 * for a postMessage success/cancel.
 *
 * There is no backend endpoint to change plans atomically: switching plans
 * cancels the current subscription, then starts and pays for a new one -
 * the same checkout path as a first subscription, just with that one extra
 * step first and different copy ("Switch to {plan}").
 */
export const useHostingPlanDrawer = () => {
  const hostingPlan = useHostingPlan();
  const createCommunityDrawer = useCreateCommunityDrawer();
  const { toast } = useToast();
  const router = useRouter();

  const [view, setView] = useState<DrawerView>('choose');
  const [selectedPlanId, setSelectedPlanId] = useState<HostingPlanId | null>(null);
  const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);
  const [initiationError, setInitiationError] = useState<string | null>(null);
  const [pendingSubscriptionId, setPendingSubscriptionId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>('frame');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isOpen = hostingPlan?.isOpen ?? false;
  const options = hostingPlan?.options;

  // Reset the drawer's own state every time it opens, so a prior session's
  // checkout never reappears for a different plan.
  useEffect(() => {
    if (!isOpen) return;

    setView(options?.view ?? 'choose');
    setSelectedPlanId(options?.planId ?? hostingPlan?.currentPlan.planId ?? null);
    setIsInitiatingCheckout(false);
    setInitiationError(null);
    setPendingSubscriptionId(null);
    setCheckoutUrl(null);
    setCheckoutPhase('frame');
    setPaymentError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, options]);

  if (!hostingPlan) return null;

  const {
    plans,
    currentPlan,
    hasActivePlan,
    isStartingCheckout,
    startCheckout,
    isConfirming,
    confirmSubscription,
    cancel,
    closeHostingPlanFlow,
  } = hostingPlan;

  // Already paying for something: Continue cancels it and starts a fresh
  // checkout for the new plan. No plan yet: Continue starts the first one.
  const isChangeMode = hasActivePlan;
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const isCurrentPlanSelected = isChangeMode && selectedPlanId === currentPlan.planId;
  const currentPlanRecord = plans.find((plan) => plan.id === currentPlan.planId) ?? null;
  const renewalDateLabel = currentPlan.currentPeriodEnd
    ? moment(currentPlan.currentPeriodEnd).format('ddd D MMM')
    : null;

  const handlePickPlan = (planId: HostingPlanId) => setSelectedPlanId(planId);

  const handleCompareFeatures = () => {
    closeHostingPlanFlow();
    router.push('/pricing');
  };

  // Analogous to BookingPanel's handlePay: this is the only action that
  // starts a checkout - Subscribe has no footer of its own, the frame loads
  // as soon as the view opens.
  const handleContinue = async () => {
    // The second check also catches a plan preselected via options.planId
    // (e.g. a Pricing page button) that turned out to have no backendId -
    // PlanCard's own disabled state only prevents picking one by hand.
    if (!selectedPlan || isCurrentPlanSelected || !selectedPlan.backendId) return;

    setIsInitiatingCheckout(true);
    setInitiationError(null);

    try {
      if (isChangeMode && currentPlan.subscriptionId) {
        await cancel();
      }

      const checkout = await startCheckout(selectedPlan.id);
      setPendingSubscriptionId(checkout.subscriptionId);
      setCheckoutUrl(checkout.authorizationUrl);
      setCheckoutPhase('frame');
      setView('subscribe');
    } catch (error: any) {
      const message = error?.message ?? 'Could not start this subscription. Try again.';
      setInitiationError(message);
      toast({ title: 'Something went wrong', description: message, variant: 'destructive' });
    } finally {
      setIsInitiatingCheckout(false);
    }
  };

  // Nothing further charged - clears the picked plan's checkout state, keeps the plan itself picked.
  const handleBackToChoose = () => {
    setView('choose');
    setCheckoutUrl(null);
    setCheckoutPhase('frame');
    setPaymentError(null);
  };

  // <Paystack>'s own postMessage listener reports true/false here.
  const handlePaystackResult = (paymentSuccess: boolean) => {
    if (!selectedPlan) return;

    // Paying again (after a failure) always clears the old error first.
    setPaymentError(null);

    if (!paymentSuccess) {
      setPaymentError(PAYMENT_FAILED_MESSAGE);
      return;
    }

    setCheckoutPhase('confirming');

    setTimeout(() => {
      if (!pendingSubscriptionId) return;

      confirmSubscription(pendingSubscriptionId)
        .then(() => {
          closeHostingPlanFlow();
          // A new host needs a community to publish an experience under -
          // straight into Create community next, rather than a toast.
          createCommunityDrawer?.openCreateCommunity();
        })
        .catch((error: any) => {
          setCheckoutPhase('frame');
          setPaymentError(
            error?.message ??
              'Paystack confirmed your payment, but we could not load your subscription. Contact support with your reference.',
          );
        });
    }, CONFIRMING_DELAY_MS);
  };

  return {
    isOpen,
    view,
    plans,
    currentPlan,
    currentPlanName: currentPlanRecord?.name,
    renewalDateLabel,
    isChangeMode,
    selectedPlanId,
    selectedPlan,
    isCurrentPlanSelected,
    isInitiatingCheckout,
    initiationError,
    isStartingCheckout,
    isConfirming,
    checkoutUrl,
    checkoutPhase,
    paymentError,
    handleClose: closeHostingPlanFlow,
    handlePickPlan,
    handleContinue,
    handleCompareFeatures,
    handleBackToChoose,
    handlePaystackResult,
  };
};
