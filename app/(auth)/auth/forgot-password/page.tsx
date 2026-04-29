// noinspection TypeScriptValidateTypes,JSRemoveUnnecessaryParentheses
'use client';

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/navigation';

import { Mail02Icon } from '@hugeicons/react-pro';

import { Anchor, Input } from '@/app/shared/components/Forms';
import { SuccessMessage } from '@/app/shared/components/Messages/messages/success';
import { MobileStore } from '@/app/shared/components/Download';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { addEmail } from '@/slices/resetSlice';

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
                <span className="font-medium text-primary">{email}</span>. Please check your email
                and enter the code.
              </>
            }
            onContinue={() => router.push('/auth/reset-password')}
          />

          <div className="mb-4 mt-4 flex justify-center font-medium">
            <span className="mr-1 text-xs">Wrong email?</span>
            <Button variant="link" className="h-fit p-0" onClick={() => setVerificationSent(false)}>
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
            <p className="text-xs font-medium text-gray-700">
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
              <Button className="h-[50px] w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
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
