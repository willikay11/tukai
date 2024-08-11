// noinspection TypeScriptValidateTypes

'use client';
import React, { useContext, useState } from 'react';
import OtpInput from '@/app/ui/form/otpInput';
import { Button, Input } from '@/app/ui/form';
import { LockKeyIcon, RefreshIcon } from '@hugeicons/react-pro';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { SubmitHandler, useForm } from 'react-hook-form';
import MobileStore from '@/app/ui/mobileStore';
import { NotificationContext } from '@/providers/NotificationProvider';

type Inputs = {
  password: string;
  confirmPassword: string;
};
export default function Page() {
  const router = useRouter();
  const toast: any = useContext(NotificationContext);
  const account = useSelector((state: any) => state.resetReducer.account);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ mode: 'onChange' });
  const [token, setToken] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [enterPassword, setEnterPassword] = useState<boolean>(false);

  const onNext = () => {
    setEnterPassword(true);
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    const response = await fetch('/auth/reset-password/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: data.password }),
    });

    const res = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setIsSubmitting(false);
      toast.open('error', 'Failure', res.message);
      return;
    }
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
              <Button block htmlType="submit" loading={isSubmitting}>
                Submit
              </Button>
            </div>

            <div className="mb-4 mt-4 flex justify-center">
              <span className="mr-1 text-xs">Wrong Token?</span>
              <Button type="link" onClick={() => setEnterPassword(false)}>
                Edit
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mx-4">
          <div className="mb-2">
            <p className="text-xl font-black text-gray-700">Enter verification code</p>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-700">
              A four digit code was sent to{' '}
              <span className="text-primary">{account?.email?.payload}</span>.
            </p>
          </div>

          <OtpInput onComplete={(token) => setToken(token)} />
          <div className="mb-4 mt-4 inline-flex w-full justify-center">
            <Button type="link">
              <RefreshIcon variant="twotone" size={16} className="mr-2" />
              Resend Code
            </Button>
          </div>
          <Button block onClick={onNext}>
            Submit
          </Button>
        </div>
      )}
      <div className="-mx-[1.875rem] mb-4 mt-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]" />

      <MobileStore />
    </>
  );
}
