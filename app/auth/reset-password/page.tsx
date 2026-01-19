// noinspection TypeScriptValidateTypes

'use client';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { useRouter } from 'next/navigation';

import { LockKeyIcon, RefreshIcon } from '@hugeicons/react-pro';
import { set } from 'lodash';

import { Input } from '@/app/components/form';
import OtpInput from '@/app/components/form/otpInput';
import SuccessMessage from '@/app/components/messages/success';
import MobileStore from '@/app/components/mobileStore';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type Inputs = {
  password: string;
  confirmPassword: string;
};

export default function Page() {
  const router = useRouter();
  const account = useSelector((state: any) => state.resetReducer.account);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ mode: 'onChange' });
  const [token, setToken] = useState<string | undefined>();
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [enterPassword, setEnterPassword] = useState<boolean>(false);
  const [passwordChanged, setPasswordChanged] = useState<boolean>(false);

  const onNext = () => {
    setEnterPassword(true);
  };

  const onResend = async () => {
    setIsResending(true);
    const response = await fetch('/auth/forgot-password/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: account?.email?.payload,
      }),
    });

    const res = await response.json();

    setIsResending(false);
    if (!response.ok) {
      setIsSubmitting(false);
      toast({
        title: 'Failure',
        description: res.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Verification code resent successfully',
      variant: 'success',
    });
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    const response = await fetch('/auth/reset-password/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: data.password, email: account?.email?.payload }),
    });

    const res = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setIsSubmitting(false);
      toast({
        title: 'Failure',
        description: res.message,
        variant: 'destructive',
      });

      if (res.message.includes('provided token is invalid or has expired.')) {
        setEnterPassword(false);
      }
      return;
    }
    setEnterPassword(false);
    setPasswordChanged(true);
  };

  return (
    <>
      {enterPassword ? (
        <div className="mx-4">
          <div className="mb-2">
            <p className="text-xl font-black text-gray-700">Complete Reset Password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <Input
                name="password"
                placeholder="Create Password"
                type="password"
                icon={<LockKeyIcon size={16} />}
                refs={register('password', {
                  required: 'Please enter your password',
                  // onBlur: (e) => (password = e.target.value),
                })}
                error={errors.password?.message}
              />
            </div>

            <div className="mb-4">
              <Input
                name="confirmPassword"
                placeholder="Confirm Password"
                type="password"
                icon={<LockKeyIcon size={16} />}
                refs={register('confirmPassword', {
                  required: 'Please enter your password',
                  // pattern: {
                  //     value: /apple/,
                  //     message: 'Passwords do not match'
                  // }
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="mb-2.5">
              <Button className="h-[50px] w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>

            <div className="mb-4 mt-4 flex justify-center">
              <span className="mr-1 text-xs">Wrong Token?</span>
              <Button variant="link" className="h-fit p-0" onClick={() => setEnterPassword(false)}>
                Edit
              </Button>
            </div>
          </form>
        </div>
      ) : passwordChanged ? (
        <SuccessMessage
          icon="CheckmarkCircle03Icon"
          title="Password reset complete"
          description="Your new password was reset successfully."
          buttonTitle="Done"
          onContinue={() => router.push('/auth/sign-in')}
        />
      ) : (
        <div className="mx-4">
          <div className="mb-2">
            <p className="text-xl font-black text-gray-700">Enter verification code</p>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700">
              A four digit code was sent to{' '}
              <span className="text-primary">{account?.email?.payload}</span>.
            </p>
          </div>

          <OtpInput onComplete={(token) => setToken(token)} />
          <div className="mb-4 mt-4 inline-flex w-full justify-center">
            <Button variant="link" className="h-fit p-0" onClick={onResend}>
              <RefreshIcon variant="twotone" size={16} className="mr-2" />
              {isResending ? 'Resending...' : 'Resend Code'}
            </Button>
          </div>
          <Button className="h-[50px] w-full" onClick={onNext}>
            Submit
          </Button>
        </div>
      )}
      <div className="-mx-[1.875rem] mb-4 mt-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]" />

      <MobileStore />
    </>
  );
}
