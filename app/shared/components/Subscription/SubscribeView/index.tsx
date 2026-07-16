'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import { useSubscriptionPlans } from '@/app/(auth)/hooks/useSubscriptions';
import { Paystack } from '@/components/ui/paystack';
import { StepIndicator } from '@/components/ui/stepIndicator';

import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperNav
} from '@/components/ui/stepper'

import { Package } from '../package';
import { PaymentDetails } from '../paymentDetails';

const steps = [
  { id: 'details', title: 'Payment Details' },
  { id: 'package', title: 'Package Selection' },
  { id: 'done', title: 'Done' }
];

// The full subscribe flow, extracted verbatim from the /auth/subscribe page so
// it can also render inside the Join Tukai Premium modal. Orchestration only —
// the business logic lives unchanged in PaymentDetails and Package.
export const SubscribeView = () => {
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
        <Stepper steps={steps} className='flex items-center max-md:w-xs md:w-full md:max-w-xl'>
            <StepperNav>
              {steps.map(step => (
                <StepperItem key={step.id} stepId={step.id}>
                  <StepperTrigger>
                    <StepperIndicator>{step.title}</StepperIndicator>
                  </StepperTrigger>
                  <StepperSeparator />
                </StepperItem>
              ))}
            </StepperNav>
          </Stepper>
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
};
