'use client';

import OtpInput from '@/app/components/form/otpInput';
import { Button } from '@/app/components/form';
import { RefreshIcon } from '@hugeicons/react-pro';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionContext } from '@/providers/SessionProvider';
import { toast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';

export default function OtpConfirmation() {
  const router = useRouter();
  const session: any = useContext(SessionContext);
  const newUser = useSelector((state: any) => state.userReducer.newUser);
  const [token, setToken] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit = async () => {
    setIsSubmitting(true);
    const response = await fetch('/auth/otp-confirmation/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, token }),
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
    router.push('/auth/payments');
  };

  return (
    <>
      <div className="mx-4 mb-4">
        <p className="text-xl font-black text-gray-700">Enter verification code!</p>
        <p className="mb-4 mt-2.5 text-xs font-normal text-gray-700">
          A four digit code was sent to <span className="text-primary">{newUser?.payload?.email}</span>
        </p>
        <OtpInput onComplete={(token) => setToken(token)} />
        <div className="inline-flex w-full justify-center my-2.5">
          <Button type="link">
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
