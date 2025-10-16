'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { z } from 'zod';
import clsx from 'clsx';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { CallIcon, PinLocation02Icon, GlobalIcon } from '@hugeicons/react-pro';

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

export const paymentFormSchema = z.object({
  postCode: z.string().min(2, {
    message: 'Please enter a postcode.',
  }),
  country: z.string().min(2, {
    message: 'Please enter a country.',
  }),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => val === '', {
      message: 'Please enter a valid phone number.',
    }),
});

const PaymentForm = forwardRef(
  (
    {
      onSubmit,
    }: { onSubmit: (values: z.infer<typeof paymentFormSchema>, paymentOption: string) => void },
    ref,
  ) => {
    const [selectedOption, setSelectedOption] = useState('mobile_money');

    const form = useForm<z.infer<typeof paymentFormSchema>>({
      resolver: zodResolver(paymentFormSchema),
      defaultValues: {
        postCode: '',
        country: '',
        // phoneNumber: '',
      },
    });

    // Expose the submit function to the parent component
    useImperativeHandle(ref, () => ({
      submit: () =>
        form.handleSubmit((values) => {
          onSubmit(values, selectedOption);
        })(),
      formState: form.formState,
    }));

    return (
      <>
        <div className="mb-2 inline-flex">
          {options.map((option) => (
            <div
              key={option.value}
              className="mb-2 inline-flex cursor-pointer items-center"
              onClick={() => setSelectedOption(option.value)}
            >
              <span
                className={clsx('ml-2 inline-flex items-center text-xs text-gray-700 p-3 rounded-lg', {
                  'font-bold bg-green-50 border-[1px] border-green-700': selectedOption === option.value,
                  'font-normal bg-gray-100': selectedOption !== option.value,
                })}
              >
                <Image
                  src={option.icon.src}
                  alt={option.label}
                  className={`h-[${option.icon.height}px] !w-[${option.icon.width}px] mr-2`}
                  height={option.icon.height}
                  width={option.icon.width}
                />
                {option.label}
              </span>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form className="space-y-4">
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
          </form>
        </Form>
      </>
    );
  },
);

export default PaymentForm;
