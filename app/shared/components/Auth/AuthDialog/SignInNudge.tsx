'use client';

import { FormEvent, useEffect, useState } from 'react';

import Image from 'next/image';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useAuthDialog } from '@/context/AuthDialogContext';

import { AppleGlyph, AuthSpinner, GoogleGlyph } from './SocialGlyphs';
import { DialogCloseButton } from './DialogIconButtons';

const DISMISSED_KEY = 'tukai_nudge_dismissed';
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const METHOD_BUTTON =
  'flex h-[52px] items-center justify-center gap-3 rounded-full px-5 text-[15.5px] font-semibold whitespace-nowrap transition active:scale-[0.98] motion-reduce:active:scale-100';

/**
 * The corner card offering to sign in, for anyone signed out. AU-07.
 *
 * Hides itself while the auth dialog is open. The design also hides it
 * behind side panels, the create menu, filters and the gallery - those each
 * live in their own context providers scattered across the app, and wiring
 * all of them in is left for a follow-up; this covers the one case that
 * matters most (not stacking on top of the thing it's offering to help with).
 */
export const SignInNudge = () => {
  const { data: session, status } = useSession();
  const { view, busy, signInSocial, setEmail, openRegister, goToEmailStep } = useAuthDialog();

  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(DISMISSED_KEY) === '1',
  );
  const [ngEmail, setNgEmail] = useState('');
  const [ngEmailErr, setNgEmailErr] = useState('');

  useEffect(() => {
    if (status === 'loading' || session?.user || dismissed) return;
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, [status, session?.user, dismissed]);

  const show = visible && !dismissed && !session?.user && !view;

  const onClose = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, '1');
  };

  const onEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = ngEmail.trim();
    if (!trimmed) return;
    if (!EMAIL_RE.test(trimmed)) {
      setNgEmailErr('Enter a valid email address, like name@example.com.');
      return;
    }
    setEmail(trimmed);
    openRegister();
    goToEmailStep();
    setVisible(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Sign in or sign up"
      className={`fixed bottom-[calc(84px_+_env(safe-area-inset-bottom))] left-3 right-3 z-[58] box-border flex flex-col items-center rounded-[18px] bg-white px-6 pb-6 pt-7 text-center shadow-[0_2px_8px_rgba(1,51,52,.06),0_18px_48px_rgba(1,51,52,.18)] transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none min-[720px]:bottom-6 min-[720px]:left-auto min-[720px]:right-6 min-[720px]:w-[360px] ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <DialogCloseButton onClose={onClose} inset="flat" />

      <Image
        src="/images/logo.svg"
        alt="Tukai"
        width={107}
        height={28}
        className="mt-1 h-[30px] w-auto flex-shrink-0"
      />

      <h2 className="mt-[18px] text-[19px] font-bold leading-[1.3] tracking-[-0.2px] text-ink-pill">
        Sign in or sign up for free
      </h2>
      <p className="mt-1.5 text-[14.5px] leading-[1.45] text-ink-muted">
        Save places, join communities and book experiences.
      </p>

      <div className="mt-[22px] flex w-full flex-col gap-2.5">
        <button
          type="button"
          onClick={() => void signInSocial('google')}
          disabled={!!busy}
          aria-busy={busy === 'google'}
          className={`${METHOD_BUTTON} bg-[#4285F4] text-white hover:bg-[#3B78E7]`}
        >
          {busy === 'google' ? <AuthSpinner /> : <GoogleGlyph />}
          {busy === 'google' ? 'Connecting to Google' : 'Continue with Google'}
        </button>

        <button
          type="button"
          onClick={() => void signInSocial('apple')}
          disabled={!!busy}
          aria-busy={busy === 'apple'}
          className={`${METHOD_BUTTON} bg-black text-white hover:bg-[#1A1A1A]`}
        >
          {busy === 'apple' ? <AuthSpinner /> : <AppleGlyph />}
          {busy === 'apple' ? 'Connecting to Apple' : 'Continue with Apple'}
        </button>

        <div aria-hidden="true" className="my-1.5 h-px bg-surface-muted" />

        <form onSubmit={onEmailSubmit} noValidate className="flex flex-col gap-2.5">
          <input
            type="email"
            value={ngEmail}
            onChange={(e) => {
              setNgEmail(e.target.value);
              setNgEmailErr('');
            }}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Enter your email"
            aria-label="Email address"
            aria-invalid={!!ngEmailErr}
            className="h-[52px] w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink-pill outline-none transition-colors focus:border-brand"
          />
          {ngEmailErr && (
            <p role="alert" className="flex items-start gap-2 text-left text-[13.5px] leading-[1.45] text-danger-deep">
              <IconComponent
                iconName="InformationCircleIcon"
                size={17}
                color="currentColor"
                className="mt-px flex-shrink-0"
              />
              {ngEmailErr}
            </p>
          )}
          <button
            type="submit"
            disabled={!ngEmail.trim()}
            className={`h-[52px] rounded-full text-[15.5px] font-semibold transition ${
              ngEmail.trim()
                ? 'cursor-pointer bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                : 'cursor-not-allowed bg-surface-muted text-ink-subtle'
            }`}
          >
            Continue with email
          </button>
        </form>
      </div>
    </aside>
  );
};
