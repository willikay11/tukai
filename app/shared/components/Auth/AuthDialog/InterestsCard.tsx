'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { useGetInterestCategories } from '@/app/shared/hooks/useAuth';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Interest } from '@/types/interest';

import { DialogCloseButton } from './DialogIconButtons';
import { AuthSpinner } from './SocialGlyphs';

const PHOTO_SRC = '/images/auth-camp-night.jpg';

const InterestChip = ({
  interest,
  on,
  onClick,
}: {
  interest: Interest;
  on: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={onClick}
    className={`inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full py-0 pl-3.5 pr-[18px] backdrop-blur-[8px] transition-colors active:scale-[0.97] motion-reduce:active:scale-100 ${
      on ? 'bg-lime text-brand-ink font-semibold' : 'bg-white/[.14] font-medium text-white'
    }`}
  >
    {interest.icon && (
      <IconComponent
        iconName={interest.icon}
        size={18}
        color="currentColor"
        variant="twotone"
      />
    )}
    <span className="text-[15px]">{interest.name}</span>
  </button>
);

/**
 * Select your interests: onboarding (no account action pending) and editing
 * from the profile. AU-05.
 */
export const InterestsCard = () => {
  const { intsMode, intsDraft, intsBusy, toggleInterest, submitInterests, close } =
    useAuthDialog();
  const { data: categories, isLoading } = useGetInterestCategories();

  const isEdit = intsMode === 'edit';
  const count = intsDraft.length;

  return (
    <div className="relative flex h-[100dvh] w-screen flex-col overflow-hidden bg-auth-night min-[720px]:h-[min(640px,calc(100dvh-48px))] min-[720px]:w-[min(960px,calc(100vw-48px))] min-[720px]:rounded-[18px] min-[720px]:shadow-[0_30px_80px_rgba(0,0,0,.35)]">
      <Image
        src={PHOTO_SRC}
        alt=""
        fill
        sizes="960px"
        className="object-cover object-[50%_50%] min-[720px]:object-[50%_72%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg,rgba(5,16,26,.62) 0%,rgba(5,16,26,.5) 45%,rgba(5,16,26,.6) 75%,rgba(5,16,26,.9) 100%)',
        }}
      />

      {/* Not available during sign-up onboarding - submitting is the only way out */}
      {isEdit && <DialogCloseButton onClose={close} />}

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pb-3 pt-[calc(68px_+_env(safe-area-inset-top))] text-center text-white min-[720px]:px-12 min-[720px]:pb-2 min-[720px]:pt-9">
        <Image src="/images/logo.svg" alt="Tukai" width={107} height={28} className="h-[30px] w-auto flex-shrink-0 brightness-0 invert" />

        <h1 className="mt-5 text-[34px] font-bold leading-[1.12] tracking-[-0.8px] text-white">
          {isEdit ? 'Your interests' : 'Select your interests'}
        </h1>
        <p className="mt-2.5 max-w-[460px] text-base leading-[1.5] text-white">
          {isEdit
            ? 'Pick what you like doing. You can change these any time.'
            : 'What are some of your favourite experiences? Tap or click to select.'}
        </p>

        <div className="mt-6 flex max-w-[860px] flex-wrap justify-center gap-2.5">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-12 w-28 animate-pulse rounded-full bg-white/10" />
              ))
            : (categories ?? []).map((interest: Interest) => (
                <InterestChip
                  key={interest.id}
                  interest={interest}
                  on={intsDraft.includes(interest.id)}
                  onClick={() => toggleInterest(interest.id)}
                />
              ))}
        </div>
      </div>

      <div className="relative flex flex-shrink-0 flex-col items-center gap-2.5 px-6 pb-[calc(22px_+_env(safe-area-inset-bottom))] pt-3">
        <span aria-live="polite" className="text-[13px] text-white">
          {count ? `${count} selected` : 'Pick as many as you like'}
        </span>
        <button
          type="button"
          onClick={() => void submitInterests()}
          disabled={count === 0 || intsBusy}
          className={`flex h-14 w-full max-w-[360px] items-center justify-center gap-2 rounded-full text-base font-semibold transition ${
            count === 0 || intsBusy
              ? 'cursor-not-allowed bg-white/[.16] text-[#C9D1CF]'
              : 'cursor-pointer bg-gradient-to-b from-brand-mid to-brand-deep text-white'
          }`}
        >
          {intsBusy && <AuthSpinner />}
          {isEdit ? 'Save interests' : 'Submit'}
        </button>
      </div>
    </div>
  );
};
