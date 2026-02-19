'use client';

import { useRef } from 'react';

import { z } from 'zod';

import { Button } from '@/components/ui/button';
import PaymentForm, { paymentFormSchema } from '@/components/ui/paymentForm';
import { toast } from '@/hooks/use-toast';

export default function PaymentDetails({
  onSuccess,
}: {
  onSuccess: (paymentMethod: {
    paymentMethodId: string;
    phoneNumber: string;
    paymentOption: string;
    verificationResponse: string;
  }) => void;
}) {
  const formRef = useRef<any>();

  async function onSubmit(values: z.infer<typeof paymentFormSchema>, paymentOption: string) {
    const data: any = {
      type: 'billingDetails',
      paymentOption: paymentOption,
      countryCode: values.country,
    };

    if (paymentOption === 'mobile_money') {
      data.phoneNumber = values.phoneNumber;
    }

    const response = await fetch('/auth/subscribe/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (!response.ok) {
      toast({
        title: 'Subscription Failure',
        description: res.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Subscription successful!',
      variant: 'success',
    });

    onSuccess({
      paymentMethodId: res.data.paymentMethod.id,
      phoneNumber: values.phoneNumber || '',
      paymentOption: paymentOption,
      verificationResponse: res.data.verificationResponse?.authorizationUrl,
    });
  }

  return (
    <>
      <div className="mb-2">
        <p className="text-xs text-gray-700">
          We send you reminders every month before making any deductions.
        </p>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-700">Please select your preferred payment method below:</p>
      </div>

      <PaymentForm ref={formRef} onSubmit={onSubmit} />

      <Button
        size="lg"
        className="mt-3 w-full"
        type="submit"
        disabled={formRef.current?.formState.isSubmitting}
        onClick={() => formRef.current?.submit()}
      >
        {formRef.current?.formState.isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </>
  );
}
