'use client';

import { signIn } from 'next-auth/react';

import { AppleIcon, GoogleIcon } from '@hugeicons/react-pro';

import { Button } from '@/components/ui/button';

/**
 * The two one-tap ways in, which is what most readers use.
 *
 * Kept apart from the rest of the card so the sign-up page and the sign-in
 * dialog offer exactly the same thing — they used to declare these separately
 * and had drifted in shape and order.
 */
export const SocialAuthButtons = ({ callbackUrl = '/' }: { callbackUrl?: string }) => (
  <div className="space-y-3">
    <Button
      type="button"
      onClick={() => signIn('google', { redirect: false, callbackUrl })}
      className="h-[52px] w-full rounded-full bg-[#5B7BF5] text-base font-semibold text-white hover:bg-[#4a6ae4] focus:bg-[#4a6ae4]"
    >
      <span className="inline-flex items-center gap-3">
        <GoogleIcon className="text-white" variant="solid" type="sharp" />
        Continue with Google
      </span>
    </Button>

    <Button
      type="button"
      onClick={() => signIn('apple', { redirect: false, callbackUrl })}
      className="h-[52px] w-full rounded-full bg-black text-base font-semibold text-white hover:bg-gray-900 focus:bg-gray-900"
    >
      <span className="inline-flex items-center gap-3">
        <AppleIcon className="text-white" variant="solid" type="sharp" />
        Continue with Apple
      </span>
    </Button>
  </div>
);
