'use client';

import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { RefreshIcon } from '@hugeicons/react-pro';

import { Button } from '@/app/components/form';
import OtpInput from '@/app/components/form/otpInput';
import { toast } from '@/hooks/use-toast';

export default function OtpConfirmation() {
  const router = useRouter();
  const newUser = useSelector((state: any) => state.userReducer.newUser);
  const [token, setToken] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const INITIAL_COUNT = 120; // seconds
  const [remainingSeconds, setRemainingSeconds] = useState<number>(INITIAL_COUNT);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // start countdown on mount
    if (remainingSeconds > 0 && timerRef.current == null) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((s) => {
          if (s <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000) as unknown as number;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

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

    // restart countdown
    setRemainingSeconds(INITIAL_COUNT);
    if (timerRef.current == null) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((s) => {
          if (s <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000) as unknown as number;
    }
  };

  return (
    <>
      <div className="mx-4 mb-4">
        <p className="text-xl font-black text-gray-700">Enter verification code!</p>
        <p className="mb-4 mt-2.5 text-xs font-normal text-gray-700">
          A four digit code was sent to <span className="text-primary">{email}</span>
        </p>
        <OtpInput onComplete={(token) => setToken(token)} />
        <div className="my-4 inline-flex w-full justify-center">
          {remainingSeconds > 0 ? (
            <span className="inline-flex items-center justify-center text-sm text-primary">
              {/* <RefreshIcon variant="twotone" size={16} className="mr-2" /> */}
              Resend code in {formatTime(remainingSeconds)}
            </span>
          ) : (
            <Button type="link" onClick={resendCode} loading={isResending}>
              <RefreshIcon variant="twotone" size={16} className="mr-2" />
              Resend Code
            </Button>
          )}
        </div>
        <Button block loading={isSubmitting} onClick={onSubmit}>
          Verify Account
        </Button>
      </div>
    </>
  );
}
