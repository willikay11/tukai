'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CallIcon, PinLocation02Icon, GlobalIcon } from '@hugeicons/react-pro';
import clsx from 'clsx';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
const options = [
  {
    label: 'M-Pesa',
    value: 'mobile_money',
    icon: {
      src: '/images/mpesa.png',
      height: 20,
      width: 40,
    },
  },
  {
    label: 'Credit Card',
    value: 'card',
    icon: {
      src: '/images/mastercard.png',
      height: 18,
      width: 30,
    },
  },
];

const formSchema = z.object({
  postCode: z.string().min(2, {
    message: 'Please enter a postcode.',
  }),
  country: z.string().min(2, {
    message: 'Please enter a country.',
  }),
  phoneNumber: z.string().optional().refine((val) => val === '', {
    message: 'Please enter a valid phone number.',
  }),
});

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
  const [selectedOption, setSelectedOption] = useState('mpesa');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postCode: '',
      country: '',
      phoneNumber: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data: any = {
      type: 'billingDetails',
      paymentOption: selectedOption,
      countryCode: values.country,
    };

    if (selectedOption === 'mobile_money') {
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
      phoneNumber: values.phoneNumber,
      paymentOption: selectedOption,
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

      <div className="mb-2 flex flex-col">
        {options.map((option) => (
          <div
            key={option.value}
            className="mb-2 inline-flex cursor-pointer items-center"
            onClick={() => setSelectedOption(option.value)}
          >
            <div
              className={clsx(
                'inline-flex h-4 w-4 items-center justify-center rounded-full border-[1px] bg-white checked:text-orange-600 checked:hover:bg-orange-600 focus:border-transparent focus:ring-0 focus:ring-blue-300 checked:focus:bg-orange-600 checked:active:bg-orange-600',
                {
                  'border-primary': selectedOption === option.value,
                  'border-gray-300': selectedOption !== option.value,
                },
              )}
            >
              <div
                className={clsx('h-2.5 w-2.5 rounded-full bg-primary', {
                  hidden: selectedOption !== option.value,
                  block: selectedOption === option.value,
                })}
              />
            </div>
            <span
              className={clsx('ml-2 inline-flex items-center text-xs text-gray-700', {
                'font-bold': selectedOption === option.value,
                'font-normal': selectedOption !== option.value,
              })}
            >
              {option.label}
              <div className="mx-2 h-[6px] w-[1px] rounded-[2px] bg-gray-300" />
              <Image
                src={option.icon.src}
                alt={option.label}
                className={`h-[${option.icon.height}px] !w-[${option.icon.width}px]`}
                height={option.icon.height}
                width={option.icon.width}
              />
            </span>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="postCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Postcode"
                    type="text"
                    icon={<PinLocation02Icon size={20} className="text-gray-600" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Country/Region"
                    type="text"
                    icon={<GlobalIcon size={20} className="text-gray-600" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedOption === 'mobile_money' ? (
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter M-Pesa number"
                      type="text"
                      icon={<CallIcon size={20} className="text-gray-600" />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <Button size="lg" className="w-full" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </Form>
    </>
  );
}
