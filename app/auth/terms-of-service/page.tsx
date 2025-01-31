'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/app/ui/form';

export default function Page() {
  const router = useRouter();

  return (
    <>
      <div className="mb-4">
        <p className="mb-2.5 text-xl font-black text-gray-700">Terms of Service</p>
        <p className="text-xs font-semibold text-gray-700">
          Date of Last Revision: April 15th, 2024.
        </p>
      </div>

      <div className="h-72 overflow-scroll">
        <p className="mb-4 w-[80%] text-xs text-gray-700">
          This document outlines the terms and conditions ("Terms") upon which [Your Company Name]
          ("we," "us," or "our") offers access to and use of our services ("Services"). By accessing
          or using our Services, you agree to be bound by these Terms. If you do not agree with any
          part of these Terms, you may not access or use our Services
        </p>

        <p className="mb-4 w-[80%] text-xs font-bold text-gray-700">1. Acceptance of Terms</p>
        <p className="mb-4 w-[80%] text-xs text-gray-700">
          This document outlines the terms and conditions ("Terms") upon which [Your Company Name]
          ("we," "us," or "our") offers access to and use of our services ("Services"). By accessing
          or using our Services, you agree to be bound by these Terms. If you do not agree with any
          part of these Terms, you may not access or use our Services
        </p>
        <p className="mb-4 w-[80%] text-xs font-bold text-gray-700">2. Use of Services</p>
        <p className="mb-4 w-[80%] text-xs text-gray-700">
          You agree to use our Services only for lawful purposes and in a manner consistent with all
          applicable laws and regulations. You further agree not to: Violate any intellectual
          property rights; Transmit any content that is unlawful, harmful, threatening, abusive,
          defamatory, or otherwise objectionable; Attempt to gain unauthorized access to any part of
          our Services; Interfere with th
        </p>
      </div>

      <div
        className="-mx-[1.875rem] mb-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]"
        style={{ boxShadow: ' 0px -1px 4px 0px rgba(0, 0, 0, 0.12)' }}
      />

      <div className="mb-2.5">
        <Button block onClick={() => router.push('/auth/sign-in')}>
          Log In/Sign Up
        </Button>
      </div>
    </>
  );
}
