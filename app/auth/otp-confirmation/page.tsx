'use client';

import OtpInput from '@/app/ui/form/otpInput';
import { Button } from '@/app/ui/form';
import { RefreshIcon } from '@hugeicons/react-pro';

export default function OtpConfirmation() {
  return (
    <>
      <div className="mx-4 mb-4">
        <p className="text-xl font-black text-gray-700">Enter verification code!</p>
        <p className="mb-4 mt-2.5 text-xs font-normal text-gray-700">
          A four digit code was sent to <span className="text-primary">georgeralak@gmail.com</span>
        </p>
        <OtpInput />
        <div className="inline-flex w-full justify-center">
          <Button type="link">
            <RefreshIcon variant="twotone" size={16} className="mr-2" />
            Resend Code
          </Button>
        </div>
        <Button block>Create a Free Account</Button>
      </div>
    </>
  );
}
