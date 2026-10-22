'use client';

import { useEffect, useState } from 'react';

import { useToast } from '@/app/shared/hooks/useToast';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { HostingPaymentMethod, HostingPlanId } from '@/types/hostingPlan';

import { canSubmitPayment, formatCardNumber, formatExpiry } from './hosting-plan-drawer';

type DrawerView = 'choose' | 'subscribe';

/**
 * All state and handlers for the Hosting plan drawer. Reads the mocked
 * plan store off HostingPlanContext and layers the drawer's own
 * view/payment-form state on top of it.
 */
export const useHostingPlanDrawer = () => {
  const hostingPlan = useHostingPlan();
  const { toast } = useToast();

  const [view, setView] = useState<DrawerView>('choose');
  const [selectedPlanId, setSelectedPlanId] = useState<HostingPlanId | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<HostingPaymentMethod>('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isOpen = hostingPlan?.isOpen ?? false;
  const options = hostingPlan?.options;

  // Reset the drawer's own state every time it opens, so a prior session's
  // half-typed card number never reappears for a different plan.
  useEffect(() => {
    if (!isOpen) return;

    setView(options?.view ?? 'choose');
    setSelectedPlanId(options?.planId ?? hostingPlan?.currentPlan.planId ?? null);
    setPaymentMethod('mpesa');
    setMpesaNumber('');
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setPaymentError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, options]);

  if (!hostingPlan) return null;

  const {
    plans,
    currentPlan,
    hasActivePlan,
    isSubscribing,
    subscribe,
    isChangingPlan,
    changeToPlan,
    closeHostingPlanFlow,
  } = hostingPlan;

  // Already paying for something: Continue swaps the plan in immediately,
  // no checkout. No plan yet: Continue goes to Subscribe.
  const isChangeMode = hasActivePlan;
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const isCurrentPlanSelected = isChangeMode && selectedPlanId === currentPlan.planId;

  const handlePickPlan = (planId: HostingPlanId) => setSelectedPlanId(planId);

  const handleContinue = () => {
    if (!selectedPlan || isCurrentPlanSelected) return;

    if (isChangeMode) {
      changeToPlan(selectedPlan.id).then(() => {
        toast({
          title: `You're on ${selectedPlan.name} now`,
          description: `It costs ${selectedPlan.priceLabel} from your next renewal.`,
          variant: 'success',
        });
        closeHostingPlanFlow();
      });
      return;
    }

    setView('subscribe');
  };

  const handleBackToChoose = () => setView('choose');

  const canSubmit = selectedPlan
    ? canSubmitPayment(paymentMethod, mpesaNumber, cardNumber, expiry, cvc)
    : false;

  const handleSubscribe = () => {
    if (!selectedPlan) return;

    if (!canSubmit) {
      setPaymentError(
        paymentMethod === 'mpesa'
          ? 'Enter the M-Pesa number you’re paying from.'
          : 'Enter the card number, expiry date and security code.',
      );
      return;
    }

    setPaymentError(null);

    subscribe(selectedPlan.id, paymentMethod).then(() => {
      toast({
        title: 'Payment received',
        description: `You’re on ${selectedPlan.name}. Now create your experience.`,
        variant: 'success',
      });
      closeHostingPlanFlow();
    });
  };

  return {
    isOpen,
    view,
    plans,
    currentPlan,
    isChangeMode,
    selectedPlanId,
    selectedPlan,
    isCurrentPlanSelected,
    isSubscribing,
    isChangingPlan,
    paymentMethod,
    setPaymentMethod,
    mpesaNumber,
    setMpesaNumber,
    cardNumber,
    setCardNumber: (value: string) => setCardNumber(formatCardNumber(value)),
    expiry,
    setExpiry: (value: string) => setExpiry(formatExpiry(value)),
    cvc,
    setCvc,
    paymentError,
    canSubmit,
    handleClose: closeHostingPlanFlow,
    handlePickPlan,
    handleContinue,
    handleBackToChoose,
    handleSubscribe,
  };
};
