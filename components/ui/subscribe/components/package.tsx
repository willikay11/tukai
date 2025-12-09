'use client';
import IconComponent from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';
import { SubscriptionPlan } from '@/types/subscription';
import { toast } from '@/hooks/use-toast';
import clsx from 'clsx';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Package({
  subscriptionPlans,
  selectedSubscriptionPlan,
  setSelectedSubscriptionPlan,
  onEdit,
  paymentMethod,
}: {
  subscriptionPlans: SubscriptionPlan[];
  selectedSubscriptionPlan: string | null;
  setSelectedSubscriptionPlan: (subscriptionPlan: string) => void;
  onEdit: () => void;
  paymentMethod: { paymentMethodId: string; phoneNumber: string; paymentOption: string } | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    setIsSubmitting(true);

    const response = await fetch('/auth/subscribe/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'subscription',
        plan: selectedSubscriptionPlan,
      }),
    });

    const res = await response.json();
    setIsSubmitting(false);

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

    router.push('/');
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700">
        {paymentMethod?.paymentOption === 'mobile_money' ? 'Mobile Money Details' : 'Card Details'}
      </p>

      <div>
        <div className="mt-4 flex flex-row justify-between rounded-[12px] border-[1px] border-gray-100 bg-gray-50 p-4">
          <div className="flex flex-col gap-2">
            {paymentMethod?.paymentOption === 'mobile_money' ? (
              <>
                <p className="text-sm font-normal text-gray-700">
                  Mobile Money Number:{' '}
                  <span className="text-gray-500">{paymentMethod.phoneNumber}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-normal text-gray-700">
                  Card Type: <span className="text-gray-500">Visa</span>
                </p>
                <p className="text-sm font-normal text-gray-700">
                  Card No.: <span className="text-gray-500">**** **** **** 8793</span>
                </p>
                <p className="text-sm font-normal text-gray-700">
                  Expiry Date: <span className="text-gray-500">01/2025</span>
                </p>
                <p className="text-sm font-normal text-gray-700">
                  Name on Card: <span className="text-gray-500">John Doe</span>
                </p>
              </>
            )}
          </div>
          <div>
            <Button variant="text" size="sm" onClick={onEdit}>
              <IconComponent iconName="Edit02Icon" size={20} color="green" />
            </Button>
          </div>
        </div>
        <p className="mb-2.5 mt-4 text-sm font-semibold text-gray-700">
          Select your preferred package
        </p>

        <div className="mb-2 flex flex-col">
          {subscriptionPlans?.map((subscriptionPlan: SubscriptionPlan) => (
            <div
              key={subscriptionPlan.id}
              className={clsx(
                'mb-2 inline-flex cursor-pointer items-center justify-between rounded-md border-[1px] p-4',
                {
                  'border-primary bg-green-50': selectedSubscriptionPlan === subscriptionPlan.id,
                  'border-gray-500': selectedSubscriptionPlan !== subscriptionPlan.id,
                },
              )}
              onClick={() => setSelectedSubscriptionPlan(subscriptionPlan.id)}
            >
              <div className="flex flex-col">
                <p className={clsx('inline-flex items-center text-xs font-bold text-gray-700')}>
                  {subscriptionPlan.name}
                  {subscriptionPlan?.discount && (
                    <span className="ml-2 rounded-[40px] bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Save {subscriptionPlan.discount}
                    </span>
                  )}
                </p>
                <p className="mt-2 text-xs text-gray-700">
                  {subscriptionPlan.price.currency} {subscriptionPlan.price.amount} per{' '}
                  {subscriptionPlan.name.toLocaleLowerCase() === 'annual' ? 'year' : 'month'}{' '}
                </p>
              </div>
              <div
                className={clsx(
                  'inline-flex h-4 w-4 items-center justify-center rounded-full border-[1px] bg-white checked:text-orange-600 checked:hover:bg-orange-600 focus:border-transparent focus:ring-0 focus:ring-blue-300 checked:focus:bg-orange-600 checked:active:bg-orange-600',
                  {
                    'border-primary': selectedSubscriptionPlan === subscriptionPlan.id,
                    'border-gray-300': selectedSubscriptionPlan !== subscriptionPlan.id,
                  },
                )}
              >
                <div
                  className={clsx('h-2.5 w-2.5 rounded-full bg-primary', {
                    hidden: selectedSubscriptionPlan !== subscriptionPlan.id,
                    block: selectedSubscriptionPlan === subscriptionPlan.id,
                  })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button size="lg" className="w-full" type="submit" disabled={isSubmitting} onClick={onSubmit}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </div>
  );
}
