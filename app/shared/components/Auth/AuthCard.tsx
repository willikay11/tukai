'use client';

import { useState } from 'react';

import Link from 'next/link';

import { MobileStore } from '@/app/shared/components/Download';

import { AuthTerms } from './AuthTerms';
import { EmailSignInForm } from './EmailSignInForm';
import { SocialAuthButtons } from './SocialAuthButtons';

/**
 * The way in, wherever it is asked for.
 *
 * Social first, because it is one tap, with email a step behind it rather than
 * a page away — the reader stays on the card either way. The dialog over a
 * place and the sign-up page render this same component, so the two cannot
 * drift apart again.
 */
export const AuthCard = ({
  onLogin,
  callbackUrl = '/',
  title = 'Create your free account',
}: {
  onLogin: () => void;
  callbackUrl?: string;
  title?: string;
}) => {
  const [isEmailMode, setIsEmailMode] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

      {isEmailMode ? (
        <>
          <EmailSignInForm onLogin={onLogin} />

          <button
            type="button"
            onClick={() => setIsEmailMode(false)}
            className="w-full text-center text-base font-medium text-primary hover:underline"
          >
            Back to all sign in options
          </button>
        </>
      ) : (
        <>
          <SocialAuthButtons callbackUrl={callbackUrl} />

          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-500">or</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* A step on the same card, not a page away — the reader keeps
              whatever brought them here */}
          <button
            type="button"
            onClick={() => setIsEmailMode(true)}
            className="w-full text-center text-base font-medium text-primary hover:underline"
          >
            Sign in with email
          </button>
        </>
      )}

      <AuthTerms />

      <div className="border-t border-gray-200 pt-6">
        <MobileStore />
      </div>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/auth/sign-up-free" className="font-medium text-primary hover:underline">
          Sign up for free
        </Link>
      </p>
    </div>
  );
};
