'use client';

import { useState } from 'react';
import { useSubscriptionPlans } from '@/hooks/subscriptions';
import StepIndicator from '@/components/ui/stepIndicator';
import PaymentDetails from './components/paymentDetails';
import Package from './components/package';

export default function Page() {
  const [paymentMethod, setPaymentMethod] = useState<{
    paymentMethodId: string;
    phoneNumber: string;
    paymentOption: string;
  } | null>(null);
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const { data: subscriptionPlans } = useSubscriptionPlans();

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

      {currentStep === 0 && (
        <PaymentDetails
          onSuccess={({
            paymentMethodId,
            phoneNumber,
            paymentOption,
          }: {
            paymentMethodId: string;
            phoneNumber: string;
            paymentOption: string;
          }) => {
            setPaymentMethod({ paymentMethodId, phoneNumber, paymentOption });
            setCurrentStep(1);
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
