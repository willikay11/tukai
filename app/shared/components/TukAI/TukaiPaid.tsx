'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { useTukai } from '@/context/TukaiContext';

/** The confirmation once the TukAI plan is paid for. */
export const TukaiPaid = () => {
  const { access, continueAfterPaid } = useTukai();
  const renews = access.renewsAt
    ? new Date(access.renewsAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-shrink-0 flex-col items-center gap-3 px-2 pb-2 pt-8 text-center">
      <span
        aria-hidden="true"
        className="mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-lime text-brand-ink"
      >
        <IconComponent iconName="Tick02Icon" size={32} color="currentColor" />
      </span>
      <h2 className="m-0 text-balance text-[22px] font-bold leading-[1.25] tracking-[-0.3px] text-brand-ink">
        You are on TukAI
      </h2>
      <p className="m-0 max-w-[34ch] text-pretty text-[14.5px] leading-normal text-ink-note">
        Unlimited chats are on, and TukAI can now help in forms across Tukai.
        {renews ? ` Renews on ${renews}.` : ''}
      </p>
      <button
        type="button"
        onClick={continueAfterPaid}
        className="mt-2.5 flex min-h-[52px] min-w-[200px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-6 text-base font-semibold text-white hover:brightness-[1.06]"
      >
        Continue
      </button>
    </div>
  );
};
