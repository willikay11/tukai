'use client';

import { useState } from 'react';

import { useSubscriptionPlans } from '@/app/(auth)/hooks/useSubscriptions';
import { Loader } from '@/app/shared/components/Forms';
import { JoinTukaiPremium } from '@/app/shared/components/JoinTukaiPremium/JoinTukaiPremium';
import { Paystack } from '@/components/ui/paystack';
import { SubscriptionPlan } from '@/types/subscription';

import { BillingDetailsForm } from '../BillingDetailsForm';

type SubscribeStep = 'intro' | 'billing' | 'connecting' | 'checkout';

interface SubscriptionModalFlowProps {
  onClose: () => void;
}

// The whole subscription journey inside one modal: intro → billing →
// connecting → checkout. Step wiring only — the billing API call lives
// unchanged in PaymentDetails and payment runs through the existing Paystack
// authorization-url iframe.
export const SubscriptionModalFlow = ({ onClose }: SubscriptionModalFlowProps) => {
  const [step, setStep] = useState<SubscribeStep>('intro');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { data: subscriptionPlans } = useSubscriptionPlans();

  const plan: SubscriptionPlan | undefined = subscriptionPlans?.data?.results?.[0];
  const priceLabel = plan
    ? `${plan.name} · ${plan.price.currency} ${plan.price.amount.toFixed(2)}/month · cancel anytime`
    : 'Tukai Premium · KES 130.00/month · cancel anytime';

  if (step === 'intro') {
    return <JoinTukaiPremium onUpgrade={() => setStep('billing')} />;
  }

  return (
    <div className="mx-auto max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 md:p-5">
      {/* Shared header */}
      <div className="mb-3">
        <p className="text-xl font-black text-gray-700">Complete your subscription</p>
        <p className="mt-1 text-xs text-gray-500">{priceLabel}</p>
      </div>

      {/* Billing stays mounted (hidden) while connecting so the in-flight
          form submission is not unmounted mid-request */}
      <div className={step === 'billing' ? '' : 'hidden'}>
        <p className="mb-3 text-xs text-gray-700">
          We need your billing details to create a secure checkout with Paystack.
        </p>
        <BillingDetailsForm
          onSubmitStart={() => setStep('connecting')}
          onError={() => setStep('billing')}
          onSuccess={({ verificationResponse }) => {
            if (verificationResponse) {
              setCheckoutUrl(verificationResponse);
              setStep('checkout');
            } else {
              setStep('billing');
            }
          }}
        />
      </div>

      {step === 'connecting' && (
        <div className="flex flex-col items-center py-12 text-center">
          <Loader size="large" />
          <p className="mt-4 text-base font-bold text-gray-900">
            Creating your secure checkout...
          </p>
          <p className="mt-1 text-sm text-gray-500">Connecting to Paystack</p>
        </div>
      )}

      {step === 'checkout' && checkoutUrl && (
        <>
          <div className="h-[60vh] w-full overflow-hidden rounded-xl border border-gray-200">
            <Paystack
              url={checkoutUrl}
              onPaymentSuccess={(paymentSuccess) => {
                if (paymentSuccess) {
                  onClose();
                } else {
                  setStep('billing');
                }
              }}
            />
          </div>
          <p className="mt-3 text-center text-xs text-gray-500">
            We&rsquo;ll send a reminder before every renewal. Cancel anytime in Settings.
          </p>
        </>
      )}
    </div>
  );
};
