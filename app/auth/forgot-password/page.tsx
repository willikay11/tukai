// noinspection TypeScriptValidateTypes,JSRemoveUnnecessaryParentheses
'use client';

import React, { useContext, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Anchor, Button, Input } from '@/app/ui/form';
import { Mail02Icon, MailSend02Icon } from '@hugeicons/react-pro';
import { NotificationContext } from '@/providers/NotificationProvider';
import { useRouter } from 'next/navigation';
import MobileStore from '@/app/ui/mobileStore';
import { useDispatch } from 'react-redux';
import { addEmail } from '@/slices/resetSlice';

type Inputs = {
  email: string;
};
export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const toast: any = useContext(NotificationContext);
  const [email, setEmail] = useState<string>();
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ mode: 'onChange' });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    setEmail(data.email);
    const response = await fetch('/auth/forgot-password/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (!response.ok) {
      setIsSubmitting(false);
      toast.open('error', 'Failure', res.message);
      return;
    }

    dispatch(addEmail(data.email));
    setIsSubmitting(false);
    setVerificationSent(true);
  };

  return (
    <>
      {verificationSent ? (
        <div className="mx-4">
          <div className="mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <MailSend02Icon variant="duotone" className="text-green-800" size={30} />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xl font-black text-gray-700">Verification Code Sent</p>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-700">
              A verification code was sent to your email;{' '}
              <span className="text-primary">{email}</span>. Please check your email and enter the
              code.
            </p>
          </div>

          <Button block onClick={() => router.push('/auth/reset-password')}>
            Continue
          </Button>

          <div className="mb-4 mt-4 flex justify-center">
            <span className="mr-1 text-xs">Wrong email?</span>
            <Button type="link" onClick={() => setVerificationSent(false)}>
              Edit
            </Button>
          </div>
        </div>
      ) : (
        <div className="mx-4">
          <div className="mb-2">
            <p className="text-xl font-black text-gray-700">Add email address</p>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-700">
              Enter the email address you used to register so that we can sen you the Password Reset
              Link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <Input
                name="email"
                placeholder="Enter Email Address"
                type="text"
                icon={<Mail02Icon size={16} variant="twotone" />}
                refs={register('email', {
                  required: 'Please enter your email address',
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email?.message}
              />
            </div>

            <div className="mb-6">
              <Button block htmlType="submit" loading={isSubmitting}>
                Sign In
              </Button>
            </div>

            <div className="mb-6 flex justify-center">
              <Anchor link="/auth/sign-in">Back to Log In</Anchor>
            </div>
          </form>
        </div>
      )}

      <div className="-mx-[1.875rem] mb-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]" />

      <MobileStore />
    </>
  );
}
