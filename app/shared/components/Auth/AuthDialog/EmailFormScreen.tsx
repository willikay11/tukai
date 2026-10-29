'use client';

import { FormEvent } from 'react';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { Input } from '@/components/ui/input';
import { useAuthDialog } from '@/context/AuthDialogContext';

import { AuthSpinner } from './SocialGlyphs';

/** The name/email/password form, shared by register and sign-in. AU-03. */
export const EmailFormScreen = () => {
  const router = useRouter();
  const {
    view,
    first,
    last,
    email,
    password,
    pwShow,
    emailErr,
    sendBusy,
    setFirst,
    setLast,
    setEmail,
    setPassword,
    togglePwShow,
    submitRegisterEmailForm,
    submitSignInEmailForm,
    close,
  } = useAuthDialog();

  const isRegister = view === 'register';
  const pwHasLength = password.length >= 8;
  const pwHasNumber = /\d/.test(password);
  const pwOk = pwHasLength && pwHasNumber;

  const submitDisabled = isRegister
    ? !first.trim() || !last.trim() || !email.trim() || !pwOk
    : !email.trim() || !password;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      submitRegisterEmailForm();
    } else {
      void submitSignInEmailForm();
    }
  };

  const onForgotPassword = () => {
    close();
    router.push('/auth/forgot-password');
  };

  return (
    <>
      <h1 className="mt-7 text-[28px] font-bold leading-[1.15] tracking-[-0.5px] text-ink-pill">
        {isRegister ? 'Continue with email' : 'Sign in with email'}
      </h1>
      <p className="mt-2 text-[15.5px] leading-[1.5] text-ink-muted">
        {isRegister
          ? "We'll email you a 6-digit code to verify your account."
          : 'Use the email and password you joined with.'}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col items-stretch gap-3">
        {isRegister && (
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[15px] font-semibold text-ink-pill">First name</span>
              <Input
                type="text"
                value={first}
                onChange={(e) => setFirst(e.target.value.slice(0, 40))}
                autoFocus={isRegister}
                autoComplete="given-name"
                autoCapitalize="words"
                spellCheck={false}
                icon={<IconComponent iconName="UserIcon" size={20} color="currentColor" />}
                containerClassName="h-14 rounded-xl"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[15px] font-semibold text-ink-pill">Last name</span>
              <Input
                type="text"
                value={last}
                onChange={(e) => setLast(e.target.value.slice(0, 40))}
                autoComplete="family-name"
                autoCapitalize="words"
                spellCheck={false}
                icon={<IconComponent iconName="UserIcon" size={20} color="currentColor" />}
                containerClassName="h-14 rounded-xl"
              />
            </label>
          </div>
        )}

        <label className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold text-ink-pill">Email address</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus={!isRegister}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="name@example.com"
            aria-invalid={!!emailErr}
            icon={<IconComponent iconName="Mail01Icon" size={20} color="currentColor" />}
            containerClassName={`h-14 rounded-xl transition-colors ${emailErr ? 'border-danger-deep' : ''}`}
          />
        </label>

        {emailErr && (
          <p role="alert" className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-danger-deep">
            <IconComponent
              iconName="InformationCircleIcon"
              size={17}
              color="currentColor"
              className="mt-px flex-shrink-0"
            />
            {emailErr}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex min-h-[22px] items-center justify-between gap-3">
            <label htmlFor="au-pw" className="text-[15px] font-semibold text-ink-pill">
              {isRegister ? 'Create a password' : 'Password'}
            </label>
            {!isRegister && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="-m-[11px] inline-flex min-h-11 items-center px-1 text-[14.5px] font-bold text-brand"
              >
                Forgot password?
              </button>
            )}
          </div>

          <Input
            id="au-pw"
            type={pwShow ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value.slice(0, 64))}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            spellCheck={false}
            autoCapitalize="none"
            icon={<IconComponent iconName="SquareLock02Icon" size={20} color="currentColor" />}
            containerClassName="h-14 rounded-xl"
            suffixIcon={
              <button
                type="button"
                onClick={togglePwShow}
                aria-label={pwShow ? 'Hide password' : 'Show password'}
                aria-pressed={pwShow}
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-surface"
              >
                <IconComponent
                  iconName={pwShow ? 'ViewOffSlashIcon' : 'ViewIcon'}
                  size={20}
                  color="currentColor"
                />
              </button>
            }
          />

          {isRegister && (
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
          )}
        </div>

        <button
          type="submit"
          disabled={submitDisabled || sendBusy}
          aria-busy={sendBusy}
          className={`mt-1 flex h-14 items-center justify-center gap-2.5 rounded-full px-5 text-base font-semibold transition active:scale-[0.98] motion-reduce:active:scale-100 ${
            submitDisabled || sendBusy
              ? 'cursor-not-allowed bg-surface-muted text-ink-subtle'
              : 'cursor-pointer bg-gradient-to-b from-brand-mid to-brand-deep text-white'
          }`}
        >
          {sendBusy && <AuthSpinner />}
          {isRegister ? 'Continue' : sendBusy ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </>
  );
};
