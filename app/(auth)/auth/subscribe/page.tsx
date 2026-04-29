'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import { Paystack } from '@/components/ui/paystack';
import { StepIndicator } from '@/components/ui/stepIndicator';
import { useSubscriptionPlans } from '@/app/(auth)/hooks/useSubscriptions';

import { Package } from './components/package';
import { PaymentDetails } from './components/paymentDetails';

export default function Page() {
  const [paymentMethod, setPaymentMethod] = useState<{
    paymentMethodId: string;
    phoneNumber: string;
    paymentOption: string;
    verificationResponse: string;
  } | null>(null);
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPaystackOpen, setIsPaystackOpen] = useState<boolean>(false);
  const { data: subscriptionPlans } = useSubscriptionPlans();
  const { data: session } = useSession();

  // TODO: Add endpoint to pull billing details from the database
  useEffect(() => {
    if (session?.user?.hasBillingDetails) {
      setCurrentStep(1);
    }
  }, [session]);

  return (
    <>
      <div className="mb-2">
        <p className="text-xl font-black text-gray-700">Subscribe to Tukai.</p>
      </div>

      <div className="mb-4">
        <StepIndicator
          currentStep={currentStep}
          steps={[
            { label: 'Payment Details', completed: false },
            { label: 'Package Selection', completed: false },
          ]}
        />
      </div>

      <Paystack
        isOpen={isPaystackOpen}
        closeModal={() => setIsPaystackOpen(false)}
        url={paymentMethod?.verificationResponse || ''}
      />

      {currentStep === 0 && (
        <PaymentDetails
          onSuccess={({
            paymentMethodId,
            phoneNumber,
            paymentOption,
            verificationResponse,
          }: {
            paymentMethodId: string;
            phoneNumber: string;
            paymentOption: string;
            verificationResponse: string;
          }) => {
            setPaymentMethod({ paymentMethodId, phoneNumber, paymentOption, verificationResponse });
            setIsPaystackOpen(true);
            // setCurrentStep(1);
          }}
        />
      )}

      {currentStep === 1 && (
        <Package
          subscriptionPlans={subscriptionPlans?.data?.results}
          selectedSubscriptionPlan={selectedSubscriptionPlan}
          setSelectedSubscriptionPlan={setSelectedSubscriptionPlan}
          onEdit={() => setCurrentStep(0)}
          paymentMethod={paymentMethod}
        />
      )}
    </>
  );
}
