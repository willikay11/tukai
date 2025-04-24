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
        phoneNumber: '',
      },
    });

    // Expose the submit function to the parent component
    useImperativeHandle(ref, () => ({
      submit: () => form.handleSubmit((values) => {
        onSubmit(values, selectedOption);
      })(),
      formState: form.formState,
    }));

    return (
      <>
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
