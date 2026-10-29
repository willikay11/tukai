'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { useAuthDialog } from '@/context/AuthDialogContext';

import { AppleGlyph, AuthSpinner, GoogleGlyph } from './SocialGlyphs';
import { DialogCloseButton } from './DialogIconButtons';
import { RotatingPhrase } from './RotatingPhrase';

const PHOTO_SRC = '/images/auth-camp-night.jpg';

const METHOD_BUTTON =
  'flex h-14 items-center justify-center gap-3 rounded-full px-5 text-base font-semibold whitespace-nowrap transition active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed';

/**
 * Welcome: the dialog's opening screen for Create account, Sign in and
 * Session expired. AU-02.
 */
export const WelcomeCard = () => {
  const {
    view,
    why,
    busy,
    close,
    goToEmailStep,
    switchView,
    signInSocial,
  } = useAuthDialog();

  const isRegister = view === 'register';
  const isSignin = view === 'signin';
  const isExpired = view === 'expired';

  return (
    <div className="relative flex h-[100dvh] w-screen flex-col overflow-hidden bg-auth-night min-[720px]:h-[min(640px,calc(100dvh-48px))] min-[720px]:w-[min(960px,calc(100vw-48px))] min-[720px]:rounded-[18px] min-[720px]:shadow-[0_30px_80px_rgba(0,0,0,.35)]">
      <Image
        src={PHOTO_SRC}
        alt=""
        fill
        priority
        sizes="960px"
        className="object-cover object-[50%_50%] min-[720px]:object-[50%_72%]"
      />

      {/* Shade: two gradients, swapped by breakpoint rather than computed in JS */}
      <div
        aria-hidden="true"
        className="absolute inset-0 min-[720px]:hidden"
        style={{
          background:
            'linear-gradient(180deg,rgba(5,16,26,.6) 0%,rgba(5,16,26,.25) 36%,rgba(5,16,26,.4) 60%,rgba(5,16,26,.92) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden min-[720px]:block"
        style={{
          background:
            'linear-gradient(180deg,rgba(5,16,26,.4) 0%,rgba(5,16,26,.16) 38%,rgba(5,16,26,.28) 66%,rgba(5,16,26,.8) 100%)',
        }}
      />

      <DialogCloseButton onClose={close} />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-7 pb-6 pt-[calc(64px_+_env(safe-area-inset-top))] text-center text-white min-[720px]:px-14 min-[720px]:pb-8 min-[720px]:pt-12">
        <Image src="/images/logo.svg" alt="Tukai" width={96} height={28} className="h-10 w-auto brightness-0 invert" />

        <h1 className="mt-11 text-[40px] font-bold leading-[1.08] tracking-[-1px] text-white min-[720px]:mt-8">
          <span className="block">{isExpired ? 'Your session expired' : 'Plan & discover'}</span>
          {!isExpired && <RotatingPhrase active={isRegister || isSignin} />}
        </h1>

        {!isRegister && (
          <p className="mt-[14px] max-w-[340px] text-[15.5px] leading-[1.5] text-white">
            {isSignin
              ? 'Welcome back. Sign in the way you joined: Google, Apple or email.'
              : 'For your security, you were signed out. Sign in again to pick up where you left off.'}
          </p>
        )}

        <div className="mt-9 flex w-full max-w-[360px] flex-col gap-3">
          {isRegister && why && (
            <span className="inline-flex min-h-[32px] items-center gap-2 self-center rounded-full bg-brand-ink/[.78] px-[14px] py-[6px] text-[13px] font-semibold text-white">
              <IconComponent iconName="LockIcon" size={15} color="#B0E800" />
              {why}
            </span>
          )}

          <button
            type="button"
            onClick={() => signInSocial('google')}
            disabled={!!busy}
            aria-busy={busy === 'google'}
            className={`${METHOD_BUTTON} bg-[#4285F4] text-white hover:bg-[#3B78E7]`}
          >
            {busy === 'google' ? <AuthSpinner /> : <GoogleGlyph />}
            {busy === 'google' ? 'Connecting to Google' : 'Continue with Google'}
          </button>

          <button
            type="button"
            onClick={() => signInSocial('apple')}
            disabled={!!busy}
            aria-busy={busy === 'apple'}
            className={`${METHOD_BUTTON} bg-black text-white hover:bg-[#1A1A1A]`}
          >
            {busy === 'apple' ? <AuthSpinner /> : <AppleGlyph />}
            {busy === 'apple' ? 'Connecting to Apple' : 'Continue with Apple'}
          </button>

          <button
            type="button"
            onClick={goToEmailStep}
            disabled={!!busy}
            className={`${METHOD_BUTTON} bg-white text-brand-ink hover:bg-surface-brand`}
          >
            <IconComponent iconName="Mail01Icon" size={22} color="currentColor" />
            Continue with email
          </button>

          {isSignin && (
            <p className="-mt-1.5 text-[15px] text-white">
              New to Tukai?{' '}
              <button
                type="button"
                onClick={() => switchView('register')}
                className="inline-flex min-h-11 items-center px-1 text-[15px] font-bold text-lime"
              >
                Create an account
              </button>
            </p>
          )}

          {isRegister && (
            <p className="-mt-1.5 text-[15px] text-white">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchView('signin')}
                className="inline-flex min-h-11 items-center px-1 text-[15px] font-bold text-lime"
              >
                Sign in
              </button>
            </p>
          )}

          {isExpired && (
            <button
              type="button"
              onClick={close}
              className="min-h-11 self-center rounded-full px-[18px] text-[15px] font-semibold text-white hover:bg-white/10"
            >
              Not now
            </button>
          )}
        </div>

        <span aria-hidden="true" className="min-h-[28px] flex-1" />

        <p className="max-w-[340px] text-[13px] leading-[1.55] text-white">
          By continuing to use Tukai, you agree to our{' '}
          <a href="/terms" className="font-semibold text-lime">
            Terms of use
          </a>{' '}
          and{' '}
          <a href="/privacy" className="font-semibold text-lime">
            Privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};
