'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { useAuthDialog } from '@/context/AuthDialogContext';

import { DigitCodeInput } from './DigitCodeInput';

const formatCountdown = (seconds: number) => {
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

/**
 * Forgot password, step 2: the 6-digit code. Nothing is verified here - the
 * real check happens on the final submit, so entering 6 digits just moves on
 * (same as typing the 6th digit does).
 */
export const ForgotCodeScreen = () => {
  const {
    forgotEmail,
    forgotCode,
    forgotCodeErr,
    forgotResendSecondsLeft,
    setForgotCode,
    continueFromForgotCode,
    resendForgotCode,
  } = useAuthDialog();

  const full = forgotCode.length === 6;

  return (
    <>
      <h1 className="mt-7 text-[28px] font-bold leading-[1.15] tracking-[-0.5px] text-ink-pill">
        Check your email
      </h1>
      <p className="mt-2 text-[15.5px] leading-[1.5] text-ink-muted">
        Enter the 6-digit code we sent to{' '}
        <strong className="font-semibold text-ink-pill [overflow-wrap:anywhere]">{forgotEmail}</strong>
      </p>

      <div className="mt-7 flex flex-col items-stretch gap-3">
        <DigitCodeInput
          length={6}
          groups={[3, 3]}
          value={forgotCode}
          onChange={setForgotCode}
          error={!!forgotCodeErr}
          autoFocus
          ariaLabel="6-digit code"
        />

        {forgotCodeErr && (
          <p role="alert" className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-danger-deep">
            <IconComponent
              iconName="InformationCircleIcon"
              size={17}
              color="currentColor"
              className="mt-px flex-shrink-0"
            />
            {forgotCodeErr}
          </p>
        )}

        <button
          type="button"
          onClick={continueFromForgotCode}
          disabled={!full}
          className={`mt-1 flex h-14 items-center justify-center gap-2.5 rounded-full px-5 text-base font-semibold transition active:scale-[0.98] motion-reduce:active:scale-100 ${
            full
              ? 'cursor-pointer bg-gradient-to-b from-brand-mid to-brand-deep text-white'
              : 'cursor-not-allowed bg-surface-muted text-ink-subtle'
          }`}
        >
          Continue
        </button>

        <p className="mt-1.5 text-center text-[14.5px] leading-[1.5] text-ink-muted">
          Didn&apos;t get it? Check your spam folder.
        </p>

        <div className="-mt-1.5 flex flex-wrap items-center justify-center gap-x-[18px]">
          {forgotResendSecondsLeft === 0 ? (
            <button
              type="button"
              onClick={() => void resendForgotCode()}
              className="inline-flex min-h-11 items-center px-1 text-[15px] font-bold text-brand"
            >
              Resend code
            </button>
          ) : (
            <span className="inline-flex min-h-11 items-center px-1 text-[15px] font-semibold tabular-nums text-ink-muted">
              Resend code in {formatCountdown(forgotResendSecondsLeft)}
            </span>
          )}
        </div>
      </div>
    </>
  );
};
