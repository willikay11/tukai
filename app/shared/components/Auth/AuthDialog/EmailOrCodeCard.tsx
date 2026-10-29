'use client';

import Image from 'next/image';

import { useAuthDialog } from '@/context/AuthDialogContext';

import { DialogBackButton, DialogCloseButton } from './DialogIconButtons';
import { EmailFormScreen } from './EmailFormScreen';
import { ForgotCodeScreen } from './ForgotCodeScreen';
import { ForgotEmailScreen } from './ForgotEmailScreen';
import { ForgotNewPasswordScreen } from './ForgotNewPasswordScreen';
import { OtpScreen } from './OtpScreen';

const PHOTO_SRC = '/images/auth-camp-night.jpg';

/**
 * The white, split card shared by the email form, the OTP screen and the
 * forgot/reset-password screens - all three steps swap inside the same
 * frame. AU-03 / AU-04 / AU-08.
 */
export const EmailOrCodeCard = () => {
  const { view, step, forgotStep, close, backFromEmailStep, goToEmailStep, backFromForgotStep } =
    useAuthDialog();

  const isForgot = view === 'forgot';
  const isRegister = view === 'register';
  // The register path's account already exists by the time the code screen
  // shows (AU-00 decision 3 - Interests is what creates it), so there is no
  // sane "go back and change your email" destination there. The sign-in
  // path's pending-verification case created nothing new, so it can.
  const codeCanGoBack = view === 'signin';
  const showBack = isForgot || step === 'email' || (step === 'code' && codeCanGoBack);

  const onBack = () => {
    if (isForgot) {
      backFromForgotStep();
      return;
    }
    if (step === 'code') {
      goToEmailStep();
      return;
    }
    backFromEmailStep();
  };

  const content = isForgot ? (
    forgotStep === 'email' ? (
      <ForgotEmailScreen />
    ) : forgotStep === 'code' ? (
      <ForgotCodeScreen />
    ) : (
      <ForgotNewPasswordScreen />
    )
  ) : step === 'email' ? (
    <EmailFormScreen />
  ) : (
    <OtpScreen />
  );

  return (
    <div className="relative flex h-[100dvh] w-screen overflow-hidden bg-white min-[720px]:h-[min(720px,calc(100dvh-48px))] min-[720px]:w-[min(960px,calc(100vw-48px))] min-[720px]:rounded-[18px] min-[720px]:shadow-[0_30px_80px_rgba(0,0,0,.35)]">
      {showBack && <DialogBackButton onBack={onBack} />}
      <DialogCloseButton onClose={close} />

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-7 pt-[calc(72px_+_env(safe-area-inset-top))] min-[720px]:px-10 min-[720px]:pb-7 min-[720px]:pt-12">
        <div className="flex w-full max-w-[360px] flex-1 flex-col items-stretch text-left text-ink-pill">
          <Image src="/images/logo.svg" alt="Tukai" width={72} height={21} className="h-8 w-auto self-start" />

          {content}

          <span aria-hidden="true" className="min-h-[28px] flex-1" />

          <p className="text-[13px] leading-[1.55] text-ink-muted">
            By continuing to use Tukai, you agree to our{' '}
            <a href="/terms" className="font-semibold text-brand">
              Terms of use
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-semibold text-brand">
              Privacy policy
            </a>
            .
          </p>
        </div>
      </div>

      <div className="relative hidden min-w-0 flex-[0_0_42%] bg-auth-night min-[720px]:block">
        <Image src={PHOTO_SRC} alt="" fill sizes="420px" className="object-cover object-[50%_60%]" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg,rgba(5,16,26,.6) 0%,rgba(5,16,26,.3) 45%,rgba(5,16,26,0) 70%)',
          }}
        />
        <div className="relative flex flex-col items-start px-10 pt-[104px]">
          {isForgot ? (
            <>
              <h2 className="max-w-[340px] text-[30px] font-bold leading-[1.15] tracking-[-0.6px] text-white">
                Let&apos;s get you back in
              </h2>
              <p className="mt-3 max-w-[320px] text-base leading-[1.5] text-white">
                A quick code to your email, then you&apos;re set with a new password.
              </p>
            </>
          ) : isRegister ? (
            <>
              <h2 className="max-w-[340px] text-[30px] font-bold leading-[1.15] tracking-[-0.6px] text-white">
                Places, experiences and communities near you
              </h2>
              <p className="mt-3 max-w-[320px] text-base leading-[1.5] text-white">
                Discover places worth visiting, book experiences and join the communities behind
                them.
              </p>
            </>
          ) : (
            <>
              <h2 className="max-w-[340px] text-[30px] font-bold leading-[1.15] tracking-[-0.6px] text-white">
                Welcome back
              </h2>
              <p className="mt-3 max-w-[320px] text-base leading-[1.5] text-white">
                Your bucket lists, communities and bookings are right where you left them.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
