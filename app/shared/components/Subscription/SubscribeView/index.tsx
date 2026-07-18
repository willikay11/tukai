'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import { useSubscriptionPlans } from '@/app/(auth)/hooks/useSubscriptions';
import { Paystack } from '@/components/ui/paystack';
import { StepIndicator } from '@/components/ui/stepIndicator';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper';
import { cn } from '@/lib/utils';

import { Package } from '../package';
import { PaymentDetails } from '../paymentDetails';

const steps = [
  { id: 'details', title: 'Payment Details' },
  { id: 'package', title: 'Package Selection' },
  { id: 'done', title: 'Done' },
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

  const showPaystack = currentStep === 1 && isPaystackOpen;

  return (
    <>
      <div className={cn('mb-2', showPaystack && 'mb-3')}>
        <p className="text-xl font-black text-gray-700">Subscribe to Tukai.</p>
      </div>

      {!showPaystack && (
        <div className={cn('mb-4', showPaystack && 'mb-0')}>
          <Stepper steps={steps} className="w-full">
            <StepperNav>
              {steps.map((step, index) => (
                <StepperItem key={step.id} stepId={step.id}>
                  <StepperTrigger>
                    <StepperIndicator>{index + 1}</StepperIndicator>

                    <StepperTitle>{step.title}</StepperTitle>
                  </StepperTrigger>

                  <StepperSeparator />
                </StepperItem>
              ))}
            </StepperNav>
          </Stepper>
        </div>
      )}

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
            setCurrentStep(1);
          }}
        />
      )}

      
      <div className="h-[calc(85dvh-4.5rem)] w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
        <Paystack
          onPaymentSuccess={() => setIsPaystackOpen(false)}
          url={paymentMethod?.verificationResponse || 'https://checkout.paystack.com/mgk99hs4wr21ejb'}
        />
      </div>
      

      {/* {currentStep === 1 && !showPaystack && (
        <Package
          subscriptionPlans={subscriptionPlans?.data?.results}
          selectedSubscriptionPlan={selectedSubscriptionPlan}
          setSelectedSubscriptionPlan={setSelectedSubscriptionPlan}
          onEdit={() => setCurrentStep(0)}
          paymentMethod={paymentMethod}
        />
      )} */}
    </>
  );
};
