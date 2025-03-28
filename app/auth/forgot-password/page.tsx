// noinspection TypeScriptValidateTypes,JSRemoveUnnecessaryParentheses
'use client';

import React, { useContext, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Anchor, Button, Input } from '@/app/components/form';
import { Mail02Icon } from '@hugeicons/react-pro';
import { useRouter } from 'next/navigation';
import MobileStore from '@/app/components/mobileStore';
import { useDispatch } from 'react-redux';
import { addEmail } from '@/slices/resetSlice';
import SuccessMessage from '@/app/components/messages/success';
import { toast } from '@/hooks/use-toast';

type Inputs = {
  email: string;
};
export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
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
      toast({
        title: 'Failure',
        description: res.message,
        variant: 'destructive',
      });
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
          <SuccessMessage
            icon="MailSend02Icon"
            title="Verification Code Sent"
            description="A verification code was sent to your email, "
            subDescription={
              <>
                <span className="text-primary">{email}</span>. Please check your email and enter the
                code.
              </>
            }
            onContinue={() => router.push('/auth/reset-password')}
          />

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
