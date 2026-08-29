'use client';

import { useState } from 'react';

import {
  Location01Icon as Location01Twotone,
  SquareLock01Icon as SquareLock01Twotone,
} from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';

import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Dedicated billing-address form for the in-modal subscription flow:
// country + town/city + postcode. Submits to the same billing-details API
// as PaymentDetails and exposes the same step-wiring callbacks.
export const BillingDetailsForm = ({
  onSuccess,
  onSubmitStart,
  onError,
}: {
  onSuccess: (paymentMethod: {
    paymentMethodId: string;
    phoneNumber: string;
    paymentOption: string;
    verificationResponse: string;
  }) => void;
  onSubmitStart?: () => void;
  onError?: (message?: string) => void;
}) => {
  const [country, setCountry] = useState('KE');
  const [townCity, setTownCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = Boolean(country && townCity.trim() && postcode.trim());

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    onSubmitStart?.();

    try {
      const response = await fetch('/auth/subscribe/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'billingDetails',
          paymentOption: 'card',
          countryCode: country,
          townCity: townCity.trim(),
          postcode: postcode.trim(),
        }),
      });

      const res = await response.json();

      if (!response.ok) {
        toast({
          title: 'Subscription Failure',
          description: res.message,
          variant: 'destructive',
        });
        onError?.(res.message);
        return;
      }

      onSuccess({
        paymentMethodId: res.data.paymentMethod.id,
        phoneNumber: '',
        paymentOption: 'card',
        verificationResponse: res.data.verificationResponse?.authorizationUrl,
      });
    } catch {
      toast({
        title: 'Subscription Failure',
        description: 'Could not create your checkout. Please try again.',
        variant: 'destructive',
      });
      onError?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900">Billing Address</h3>

      {/* Country */}
      <Select value={country} onValueChange={setCountry}>
        <SelectTrigger
          className="h-[50px] rounded-[10px] border-gray-300"
          prefixIcon={
            <HugeiconsIcon icon={Location01Twotone} size={20} className="text-gray-600" />
          }
        >
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="KE">Kenya</SelectItem>
          <SelectItem value="UG">Uganda</SelectItem>
          <SelectItem value="TZ">Tanzania</SelectItem>
        </SelectContent>
      </Select>

      {/* Town/City + Postcode */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Town/City"
          type="text"
          value={townCity}
          onChange={(e) => setTownCity(e.target.value)}
          icon={<HugeiconsIcon icon={Location01Twotone} size={20} className="text-gray-600" />}
        />
        <Input
          placeholder="Postcode"
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          icon={<HugeiconsIcon icon={SquareLock01Twotone} size={20} className="text-gray-600" />}
        />
      </div>

      <Button
        size="lg"
        className="w-full rounded-2xl"
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        isLoading={isSubmitting}
      >
        Continue to payment
      </Button>
    </div>
  );
};
