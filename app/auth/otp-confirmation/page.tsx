'use client';

import OtpInput from '@/app/components/form/otpInput';
import { Button } from '@/app/components/form';
import { RefreshIcon } from '@hugeicons/react-pro';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';

export default function OtpConfirmation() {
  const router = useRouter();
  const newUser = useSelector((state: any) => state.userReducer.newUser);
  const [token, setToken] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  const { data: session } = useSession();

  const email = session?.user?.email || newUser?.payload?.email;

  const onSubmit = async () => {
    setIsSubmitting(true);
    const response = await fetch('/auth/otp-confirmation/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    });

    const res = await response.json();

    if (!response.ok) {
      setIsSubmitting(false);
      toast({
        title: 'OTP Failure',
        description: res.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Account verified successfully!',
      variant: 'success',
    });
    setIsSubmitting(false);
    router.push('/');
  };

  const resendCode = async () => {
    setIsResending(true);
    const response = await fetch('/auth/otp-confirmation/api', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setIsResending(false);
    const res = await response.json();

    if (!response.ok) {
      toast({
        title: 'OTP Failure',
        description: res.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'OTP sent successfully',
      description: `A four digit code was sent to ${email}`,
      variant: 'success',
    });
  };

  return (
    <>
      <div className="mx-4 mb-4">
        <p className="text-xl font-black text-gray-700">Enter verification code!</p>
        <p className="mb-4 mt-2.5 text-xs font-normal text-gray-700">
          A four digit code was sent to <span className="text-primary">{email}</span>
        </p>
        <OtpInput onComplete={(token) => setToken(token)} />
        <div className="my-2.5 inline-flex w-full justify-center">
          <Button type="link" onClick={resendCode} loading={isResending}>
            <RefreshIcon variant="twotone" size={16} className="mr-2" />
            Resend Code
          </Button>
        </div>
        <Button block loading={isSubmitting} onClick={onSubmit}>
          Verify Account
        </Button>
      </div>
    </>
  );
}
