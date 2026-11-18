'use client';

import { useEffect, useRef } from 'react';

import { DigitCodeInput } from '@/app/shared/components/Auth/AuthDialog/DigitCodeInput';
import { IconComponent } from '@/app/shared/components/Icons';

import { useWalletVerification } from './useWalletVerification';

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

interface VerifyMpesaWalletProps {
  walletId: string;
  /** The wallet's number, shown before a code is sent. */
  phone?: string;
  onVerified: () => void;
  /** Send the code as soon as this shows, e.g. straight after saving the number. */
  sendOnOpen?: boolean;
}

/**
 * Verifying an M-Pesa wallet with a texted code (DEV-448). Payouts only go to
 * a verified wallet, and withdrawing to one that isn't fails. Laid out like
 * the sign-in code screen: six boxes over one real input, so SMS autofill
 * works, checked as soon as the 6th digit is in.
 */
export const VerifyMpesaWallet = ({
  walletId,
  phone,
  onVerified,
  sendOnOpen = false,
}: VerifyMpesaWalletProps) => {
  const verification = useWalletVerification(walletId, onVerified);
  const { sentTo, code, setCode, error, isSending, isVerifying, resendSecondsLeft, send } =
    verification;

  const sentOnOpen = useRef(false);
  useEffect(() => {
    if (sendOnOpen && !sentOnOpen.current) {
      sentOnOpen.current = true;
      void send();
    }
  }, [sendOnOpen, send]);

  const full = code.length === verification.codeLength;

  return (
    <section aria-label="Verify your M-Pesa number" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[17px] font-bold leading-tight text-gray-900">
          Verify your M-Pesa number
        </h3>
        <p className="text-[14.5px] leading-[1.5] text-ink-muted">
          {sentTo ? (
            <>
              Enter the 6-digit code we sent to{' '}
              <strong className="font-semibold text-gray-900">{sentTo}</strong>.
            </>
          ) : (
            <>
              Payouts only go to a verified number. We&apos;ll text a code to{' '}
              {phone ? <strong className="font-semibold text-gray-900">{phone}</strong> : 'it'}.
            </>
          )}
        </p>
      </div>

      {sentTo ? (
        <>
          <DigitCodeInput
            length={verification.codeLength}
            groups={[3, 3]}
            value={code}
            onChange={setCode}
            error={!!error}
            busy={isVerifying}
            autoFocus
            ariaLabel="6-digit code"
          />

          <button
            type="button"
            onClick={() => void verification.verify()}
            disabled={!full || isVerifying}
            aria-busy={isVerifying}
            className="flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-5 text-[15px] font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-surface-muted disabled:bg-none disabled:text-ink-subtle"
          >
            {isVerifying ? 'Verifying' : 'Verify'}
          </button>

          <div className="flex justify-center">
            {resendSecondsLeft === 0 ? (
              <button
                type="button"
                onClick={() => void send()}
                disabled={isSending}
                className="inline-flex min-h-11 items-center px-1 text-[15px] font-bold text-brand disabled:opacity-60"
              >
                {isSending ? 'Sending code' : 'Resend code'}
              </button>
            ) : (
              <span className="inline-flex min-h-11 items-center px-1 text-[15px] font-semibold tabular-nums text-ink-muted">
                Resend code in {formatCountdown(resendSecondsLeft)}
              </span>
            )}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => void send()}
          disabled={isSending}
          aria-busy={isSending}
          className="flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-5 text-[15px] font-semibold text-white transition disabled:opacity-60"
        >
          {isSending ? 'Sending code' : 'Send code'}
        </button>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-danger-deep"
        >
          <IconComponent
            iconName="InformationCircleIcon"
            size={17}
            color="currentColor"
            className="mt-px flex-shrink-0"
          />
          {error}
        </p>
      )}
    </section>
  );
};
