'use client';

import { FormEvent } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Input } from '@/components/ui/input';
import { useAuthDialog } from '@/context/AuthDialogContext';

import { AuthSpinner } from './SocialGlyphs';

/** Forgot password, step 3: set a new password. AU-08. */
export const ForgotNewPasswordScreen = () => {
  const {
    forgotPassword,
    forgotConfirmPassword,
    forgotPwShow,
    forgotSubmitErr,
    forgotSubmitBusy,
    setForgotPassword,
    setForgotConfirmPassword,
    toggleForgotPwShow,
    submitNewPassword,
  } = useAuthDialog();

  const pwHasLength = forgotPassword.length >= 8;
  const pwHasNumber = /\d/.test(forgotPassword);
  const pwOk = pwHasLength && pwHasNumber;
  const mismatch = forgotConfirmPassword.length > 0 && forgotPassword !== forgotConfirmPassword;
  const submitDisabled = !pwOk || !forgotConfirmPassword || mismatch;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submitNewPassword();
  };

  const eyeToggle = (
    <button
      type="button"
      onClick={toggleForgotPwShow}
      aria-label={forgotPwShow ? 'Hide password' : 'Show password'}
      aria-pressed={forgotPwShow}
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-surface"
    >
      <IconComponent
        iconName={forgotPwShow ? 'ViewOffSlashIcon' : 'ViewIcon'}
        size={20}
        color="currentColor"
      />
    </button>
  );

  return (
    <>
      <h1 className="mt-7 text-[28px] font-bold leading-[1.15] tracking-[-0.5px] text-ink-pill">
        Create a new password
      </h1>
      <p className="mt-2 text-[15.5px] leading-[1.5] text-ink-muted">
        Choose a new password for your account.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col items-stretch gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="forgot-pw" className="text-[15px] font-semibold text-ink-pill">
            New password
          </label>
          <Input
            id="forgot-pw"
            type={forgotPwShow ? 'text' : 'password'}
            value={forgotPassword}
            onChange={(e) => setForgotPassword(e.target.value.slice(0, 64))}
            autoFocus
            autoComplete="new-password"
            spellCheck={false}
            autoCapitalize="none"
            icon={<IconComponent iconName="SquareLock02Icon" size={20} color="currentColor" />}
            containerClassName="h-14 rounded-xl"
            suffixIcon={eyeToggle}
          />
          <p
            className={`flex items-center gap-2 text-[13.5px] leading-[1.45] ${pwOk ? 'text-brand' : 'text-ink-muted'}`}
          >
            <IconComponent
              iconName={pwOk ? 'CheckmarkCircle02Icon' : 'CircleIcon'}
              size={17}
              color="currentColor"
              className="flex-shrink-0"
            />
            At least 8 characters, including a number
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="forgot-pw-confirm" className="text-[15px] font-semibold text-ink-pill">
            Confirm new password
          </label>
          <Input
            id="forgot-pw-confirm"
            type={forgotPwShow ? 'text' : 'password'}
            value={forgotConfirmPassword}
            onChange={(e) => setForgotConfirmPassword(e.target.value.slice(0, 64))}
            autoComplete="new-password"
            spellCheck={false}
            autoCapitalize="none"
            aria-invalid={mismatch}
            icon={<IconComponent iconName="SquareLock02Icon" size={20} color="currentColor" />}
            containerClassName={`h-14 rounded-xl transition-colors ${mismatch ? 'border-danger-deep' : ''}`}
            suffixIcon={eyeToggle}
          />
          {mismatch && (
            <p role="alert" className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-danger-deep">
              <IconComponent
                iconName="InformationCircleIcon"
                size={17}
                color="currentColor"
                className="mt-px flex-shrink-0"
              />
              Those passwords don&apos;t match.
            </p>
          )}
        </div>

        {forgotSubmitErr && (
          <p role="alert" className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-danger-deep">
            <IconComponent
              iconName="InformationCircleIcon"
              size={17}
              color="currentColor"
              className="mt-px flex-shrink-0"
            />
            {forgotSubmitErr}
          </p>
        )}

        <button
          type="submit"
          disabled={submitDisabled || forgotSubmitBusy}
          aria-busy={forgotSubmitBusy}
          className={`mt-1 flex h-14 items-center justify-center gap-2.5 rounded-full px-5 text-base font-semibold transition active:scale-[0.98] motion-reduce:active:scale-100 ${
            submitDisabled || forgotSubmitBusy
              ? 'cursor-not-allowed bg-surface-muted text-ink-subtle'
              : 'cursor-pointer bg-gradient-to-b from-brand-mid to-brand-deep text-white'
          }`}
        >
          {forgotSubmitBusy && <AuthSpinner />}
          {forgotSubmitBusy ? 'Resetting password' : 'Reset password'}
        </button>
      </form>
    </>
  );
};
