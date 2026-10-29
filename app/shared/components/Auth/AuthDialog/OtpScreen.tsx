'use client';

import { useRef, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useAuthDialog } from '@/context/AuthDialogContext';

import { AuthSpinner } from './SocialGlyphs';

const formatCountdown = (seconds: number) => {
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

/**
 * Check your email: the 6-digit code. One real input over six visible boxes,
 * so email/SMS autofill keeps working - the boxes themselves are decorative.
 * AU-04.
 */
export const OtpScreen = () => {
  const { email, otp, otpErr, otpBusy, resendSecondsLeft, setOtp, verifyOtp, resendOtp } =
    useAuthDialog();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const full = otp.length === 6;
  const activeIndex = focused && !otpBusy ? Math.min(otp.length, 5) : -1;

  const boxClass = (i: number) => {
    if (otpErr) return 'border-danger-deep';
    if (i === activeIndex) return 'border-brand shadow-[0_0_0_3px_#E8F1ED]';
    return 'border-line';
  };

  const digitBoxes = (indices: number[]) => (
    <div className="grid flex-1 grid-cols-3 gap-2">
      {indices.map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`box-border flex h-14 items-center justify-center rounded-xl border bg-white text-2xl font-bold tabular-nums text-ink-pill transition-colors ${boxClass(i)}`}
        >
          {otp[i] ?? ''}
        </span>
      ))}
    </div>
  );

  return (
    <>
      <h1 className="mt-7 text-[28px] font-bold leading-[1.15] tracking-[-0.5px] text-ink-pill">
        Check your email
      </h1>
      <p className="mt-2 text-[15.5px] leading-[1.5] text-ink-muted">
        Enter the 6-digit code we sent to{' '}
        <strong className="font-semibold text-ink-pill [overflow-wrap:anywhere]">{email}</strong>
      </p>

      <div className="mt-7 flex flex-col items-stretch gap-3">
        <div className="relative flex gap-3.5">
          {digitBoxes([0, 1, 2])}
          {digitBoxes([3, 4, 5])}

          <input
            ref={inputRef}
            type="text"
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            aria-label="6-digit code"
            aria-invalid={!!otpErr}
            readOnly={otpBusy}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onClick={(e) => {
              const target = e.currentTarget;
              const n = target.value.length;
              target.setSelectionRange(n, n);
            }}
            className="absolute inset-0 m-0 h-full w-full cursor-text border-0 bg-transparent p-0 text-base opacity-0"
          />
        </div>

        {otpErr && (
          <p role="alert" className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-danger-deep">
            <IconComponent
              iconName="InformationCircleIcon"
              size={17}
              color="currentColor"
              className="mt-px flex-shrink-0"
            />
            {otpErr}
          </p>
        )}

        <button
          type="button"
          onClick={() => void verifyOtp()}
          disabled={!full && !otpBusy}
          aria-busy={otpBusy}
          className={`mt-1 flex h-14 items-center justify-center gap-2.5 rounded-full px-5 text-base font-semibold transition active:scale-[0.98] motion-reduce:active:scale-100 ${
            full || otpBusy
              ? 'cursor-pointer bg-gradient-to-b from-brand-mid to-brand-deep text-white'
              : 'cursor-not-allowed bg-surface-muted text-ink-subtle'
          }`}
        >
          {otpBusy && <AuthSpinner />}
          {otpBusy ? 'Verifying' : 'Verify'}
        </button>

        <p className="mt-1.5 text-center text-[14.5px] leading-[1.5] text-ink-muted">
          Didn&apos;t get it? Check your spam folder.
        </p>

        <div className="-mt-1.5 flex flex-wrap items-center justify-center gap-x-[18px]">
          {resendSecondsLeft === 0 ? (
            <button
              type="button"
              onClick={resendOtp}
              className="inline-flex min-h-11 items-center px-1 text-[15px] font-bold text-brand"
            >
              Resend code
            </button>
          ) : (
            <span className="inline-flex min-h-11 items-center px-1 text-[15px] font-semibold tabular-nums text-ink-muted">
              Resend code in {formatCountdown(resendSecondsLeft)}
            </span>
          )}
        </div>
      </div>
    </>
  );
};
