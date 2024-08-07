'use client';
import React, { useState } from 'react';
import OtpInput from '@/app/ui/form/otpInput';
import { Button } from '@/app/ui/form';
import { RefreshIcon } from '@hugeicons/react-pro';
import { useRouter } from 'next/navigation';
import { addToken } from '@/slices/resetSlice';
import { useDispatch } from 'react-redux';

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [token, setToken] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit = async () => {
    setIsSubmitting(true);
    dispatch(addToken(token));
    setIsSubmitting(false);
  };

  return (
    <div className="mx-4">
      <div className="mb-2">
        <p className="text-xl font-black text-gray-700">Enter verification code</p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-700">
          A four digit code was sent to <span className="text-primary">georgeralak@gmail.com</span>.
        </p>
      </div>

      <OtpInput onComplete={(token) => setToken(token)} />
      <div className="mb-4 mt-4 inline-flex w-full justify-center">
        <Button type="link">
          <RefreshIcon variant="twotone" size={16} className="mr-2" />
          Resend Code
        </Button>
      </div>
      <Button block loading={isSubmitting} onClick={onSubmit}>
        Submit
      </Button>
    </div>
  );
}
