'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar04TwotoneRounded,
  CreditCardAddTwotoneRounded,
  Mail02TwotoneRounded,
  MapsGlobalIconTwotoneRounded,
  PinLocationIconTwotoneRounded,
  SquareLock01TwotoneRounded,
} from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { z } from 'zod';
import clsx from 'clsx';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { CallIcon } from '@hugeicons/react-pro';
import { PhoneNumber } from './phoneNumber';
import { Select, SelectValue, SelectTrigger, SelectItem, SelectContent } from './select';

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
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  cardNumber: z.string().min(12, {
    message: 'Please enter a valid card number.',
  }),
  expirtyDate: z.string().min(4, {
    message: 'Please enter a valid expiry date.',
  }),
  cvv: z.string().min(3, {
    message: 'Please enter a valid CVV.',
  }),
  postCode: z.string().min(2, {
    message: 'Please enter your postcode.',
  }),
  country: z.string().min(2, {
    message: 'Please enter your country.',
  }),
  address: z.string().min(2, {
    message: 'Please enter your address',
  }),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\+\d{6,15}$/.test(val), {
      message: 'Please enter a valid phone number.',
    }),
});

const PaymentForm = forwardRef(
  (
    {
      onSubmit,
      paid = true,
    }: {
      onSubmit: (values: z.infer<typeof paymentFormSchema>, paymentOption?: string) => void;
      paid: boolean;
    },
    ref,
  ) => {
    const [selectedOption, setSelectedOption] = useState('mobile_money');

    const form = useForm<z.infer<typeof paymentFormSchema>>({
      resolver: zodResolver(paymentFormSchema),
      defaultValues: {
        postCode: '',
        country: 'KE',
        phoneNumber: '',
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
        <Form {...form}>
          <form className="space-y-4">
            <p className="mb-2 text-sm font-bold text-gray-700">Contact Details</p>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      type="email"
                      icon={
                        <HugeiconsIcon
                          icon={Mail02TwotoneRounded}
                          size={20}
                          className="text-gray-600"
                        />
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paid && (
              <>
                <p className="mb-2 text-sm font-bold text-gray-700">Payment Method</p>

                <div className="mb-2 inline-flex space-x-2">
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className="mb-2 flex cursor-pointer items-center"
                      onClick={() => setSelectedOption(option.value)}
                    >
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-lg p-3 text-xs text-gray-700',
                          {
                            'border-[1px] border-green-700 bg-green-50 font-bold':
                              selectedOption === option.value,
                            'bg-gray-100 font-normal': selectedOption !== option.value,
                          },
                        )}
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

                {selectedOption === 'mobile_money' ? (
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PhoneNumber
                            placeholder="Enter M-Pesa number"
                            type="text"
                            icon={<CallIcon size={20} className="text-gray-600" />}
                            onChange={(val) => field.onChange(val)}
                            // value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : selectedOption === 'card' ? (
                  <>
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Card Number"
                              type="text"
                              icon={
                                <HugeiconsIcon
                                  icon={CreditCardAddTwotoneRounded}
                                  size={20}
                                  className="text-gray-600"
                                />
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="expirtyDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Expiry Date(mm/yy)"
                                type="text"
                                icon={
                                  <HugeiconsIcon
                                    icon={Calendar04TwotoneRounded}
                                    size={20}
                                    className="text-gray-600"
                                  />
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="CVV"
                                type="text"
                                icon={
                                  <HugeiconsIcon
                                    icon={SquareLock01TwotoneRounded}
                                    size={20}
                                    className="text-gray-600"
                                  />
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <p className="text-sm font-bold text-gray-700">Billing Address</p>

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select {...field}>
                              <SelectTrigger
                                className="h-[55px] w-full"
                                prefixIcon={
                                  <HugeiconsIcon
                                    icon={MapsGlobalIconTwotoneRounded}
                                    size={20}
                                    className="text-gray-600"
                                  />
                                }
                              >
                                <SelectValue placeholder="KE" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="KE">Kenya</SelectItem>
                                <SelectItem value="UG">Uganda</SelectItem>
                                <SelectItem value="TZ">Tanzania</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Town/City"
                                type="text"
                                icon={
                                  <HugeiconsIcon
                                    icon={PinLocationIconTwotoneRounded}
                                    size={20}
                                    className="text-gray-600"
                                  />
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Postcode"
                                type="text"
                                icon={
                                  <HugeiconsIcon
                                    icon={SquareLock01TwotoneRounded}
                                    size={20}
                                    className="text-gray-600"
                                  />
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                ) : null}
              </>
            )}
          </form>
        </Form>
      </>
    );
  },
);

export default PaymentForm;
