'use client';

import { FormEvent } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Input } from '@/components/ui/input';
import { useAuthDialog } from '@/context/AuthDialogContext';

import { AuthSpinner } from './SocialGlyphs';

/** Forgot password, step 1: ask for the email to send a code to. AU-08. */
export const ForgotEmailScreen = () => {
  const { forgotEmail, forgotEmailErr, forgotSendBusy, setForgotEmail, submitForgotEmail } =
    useAuthDialog();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submitForgotEmail();
  };

  return (
    <>
      <h1 className="mt-7 text-[28px] font-bold leading-[1.15] tracking-[-0.5px] text-ink-pill">
        Reset your password
      </h1>
      <p className="mt-2 text-[15.5px] leading-[1.5] text-ink-muted">
        Enter your email and we&apos;ll send you a code to get back in.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col items-stretch gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold text-ink-pill">Email address</span>
          <Input
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            autoFocus
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="name@example.com"
            aria-invalid={!!forgotEmailErr}
            icon={<IconComponent iconName="Mail01Icon" size={20} color="currentColor" />}
            containerClassName={`h-14 rounded-xl transition-colors ${forgotEmailErr ? 'border-danger-deep' : ''}`}
          />
        </label>

        {forgotEmailErr && (
          <p role="alert" className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-danger-deep">
            <IconComponent
              iconName="InformationCircleIcon"
              size={17}
              color="currentColor"
              className="mt-px flex-shrink-0"
            />
            {forgotEmailErr}
          </p>
        )}

        <button
          type="submit"
          disabled={!forgotEmail.trim() || forgotSendBusy}
          aria-busy={forgotSendBusy}
          className={`mt-1 flex h-14 items-center justify-center gap-2.5 rounded-full px-5 text-base font-semibold transition active:scale-[0.98] motion-reduce:active:scale-100 ${
            !forgotEmail.trim() || forgotSendBusy
              ? 'cursor-not-allowed bg-surface-muted text-ink-subtle'
              : 'cursor-pointer bg-gradient-to-b from-brand-mid to-brand-deep text-white'
          }`}
        >
          {forgotSendBusy && <AuthSpinner />}
          {forgotSendBusy ? 'Sending code' : 'Send code'}
        </button>
      </form>
    </>
  );
};
