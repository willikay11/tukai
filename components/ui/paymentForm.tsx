'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Location04TwotoneRounded,
  Mail02TwotoneRounded,
  MapsGlobal02TwotoneRounded,
  SquareLock01TwotoneRounded,
  UserTwotoneRounded,
} from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon } from '@hugeicons/react-pro';
import clsx from 'clsx';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { PhoneNumber } from './phoneNumber';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

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

export const paymentFormSchema = z
  .object({
    firstName: z.string().min(2, { message: 'Please enter your first name.' }),
    lastName: z.string().min(2, { message: 'Please enter your last name.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    postCode: z.string().optional(),
    country: z.string(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    paymentOption: z.string().optional(),
    paid: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate card fields if paid is true
    if (data.paid) {
      if (data.paymentOption === 'mobile_money') {
        if (!data.phoneNumber || !/^\+\d{6,15}$/.test(data.phoneNumber)) {
          ctx.addIssue({
            path: ['phoneNumber'],
            code: z.ZodIssueCode.custom,
            message: 'Please enter a valid phone number.',
          });
        }
      } else if (data.paymentOption === 'card') {
        if (!data.country) {
          ctx.addIssue({
            path: ['country'],
            code: z.ZodIssueCode.custom,
            message: 'Please enter your country.',
          });
        }

        if (!data.postCode || data.postCode.length < 2) {
          ctx.addIssue({
            path: ['postCode'],
            code: z.ZodIssueCode.custom,
            message: 'Please enter your postcode.',
          });
        }

        if (!data.address || data.address.length < 2) {
          ctx.addIssue({
            path: ['address'],
            code: z.ZodIssueCode.custom,
            message: 'Please enter your address',
          });
        }
      }
    }
  });

export const PaymentForm = forwardRef(
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
    const { data: session } = useSession();

    const form = useForm<z.infer<typeof paymentFormSchema>>({
      resolver: zodResolver(paymentFormSchema),
      defaultValues: {
        firstName: session?.user?.name?.split(' ')[0] || '',
        lastName: session?.user?.name?.split(' ')[1] || '',
        email: session?.user?.email || '',
        postCode: '',
        country: 'KE',
        phoneNumber: '',
        paymentOption: 'mobile_money', // Add default value
      },
    });

    // Expose the submit function to the parent component
    useImperativeHandle(ref, () => ({
      submit: () =>
        form.handleSubmit((values) => {
          onSubmit(values, selectedOption);
        })(),
      reset: () => {
        form.reset();
        setSelectedOption('mobile_money');
      },
      formState: form.formState,
    }));

    // Update paymentOption in form when selectedOption changes
    const handleOptionChange = (value: string) => {
      setSelectedOption(value);
      form.setValue('paymentOption', value);
    };

    useEffect(() => {
      form.setValue('paid', paid);
    }, [paid]);

    // Update form values when session data becomes available
    useEffect(() => {
      if (session?.user) {
        form.setValue('firstName', session.user.name?.split(' ')[0] || '');
        form.setValue('lastName', session.user.name?.split(' ')[1] || '');
        form.setValue('email', session.user.email || '');
      }
    }, [session, form]);

    return (
      <>
        <Form {...form}>
          <form className="space-y-4">
            {!session?.user && (
              <>
                <p className="mb-2 text-sm font-bold text-gray-700">Contact Details</p>

                <p className="mb-2 text-sm text-gray-700">
                  *Your ticket will be sent to your email on successful completion.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="First Name"
                            type="text"
                            icon={
                              <HugeiconsIcon
                                icon={UserTwotoneRounded}
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Last Name"
                            type="text"
                            icon={
                              <HugeiconsIcon
                                icon={UserTwotoneRounded}
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
              </>
            )}

            {paid && (
              <>
                <p className="mb-2 text-sm font-bold text-gray-700">Payment Method</p>

                <div className="mb-2 inline-flex space-x-2">
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className="mb-2 flex cursor-pointer items-center"
                      onClick={() => handleOptionChange(option.value)}
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
                                    icon={MapsGlobal02TwotoneRounded}
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
                                    icon={Location04TwotoneRounded}
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
