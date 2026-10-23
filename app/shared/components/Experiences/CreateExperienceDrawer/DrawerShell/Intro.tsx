'use client';

import { useState } from 'react';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';

interface IntroProps {
  onCreateExperience: () => void;
}

/**
 * tk-empty-hero - shown only to a host who has never created an experience
 * before (everyone else starts straight on Date & type).
 */
export const Intro = ({ onCreateExperience }: IntroProps) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 px-1 pb-2 pt-7 text-center">
      <div className="relative h-[170px] w-[210px]" aria-hidden="true">
        <span className="absolute left-2 top-[22px] block h-[134px] w-[118px] -rotate-[9deg] rounded-[14px] bg-surface-brand" />
        <span className="absolute right-2 top-[22px] block h-[134px] w-[118px] rotate-[9deg] rounded-[14px] bg-surface-brand" />
        <span className="absolute left-[43px] top-1 flex h-[156px] w-[124px] items-center justify-center rounded-[14px] bg-surface shadow-[0_12px_26px_rgba(1,51,52,.25)]">
          <IconComponent iconName="RocketIcon" size={40} color="#066349" />
        </span>
      </div>

      <h2 className="mt-2.5 text-22 font-bold leading-tight tracking-[-0.3px] text-gray-800">
        No experiences... yet!
      </h2>
      <p className="max-w-[38ch] text-[15.5px] leading-relaxed text-gray-800">
        You are not hosting any experiences. Create one to get started.
      </p>

      <button
        type="button"
        aria-expanded={isInfoOpen}
        onClick={() => setIsInfoOpen((open) => !open)}
        className="inline-flex min-h-11 items-center gap-2 text-15 font-semibold text-brand hover:underline"
      >
        <IconComponent iconName="InformationCircleIcon" size={20} color="#066349" />
        What is experience hosting?
      </button>

      {isInfoOpen && (
        <p className="max-w-[46ch] rounded-xl bg-surface-brand px-4 py-3 text-left text-[14.5px] leading-relaxed text-brand-ink">
          Hosting means publishing an experience under a community you own. You set the date, the
          tickets and who can come, and Tukai looks after bookings, payments and entry codes.
        </p>
      )}

      <p className="mt-[18px] max-w-[44ch] text-15 leading-[1.6] text-gray-800">
        By creating an experience, you agree to our{' '}
        <Link href="/terms" className="font-semibold text-brand hover:underline">
          Terms of Use
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="font-semibold text-brand hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <Button
        type="button"
        variant="lime"
        onClick={onCreateExperience}
        className="mt-1 h-14 w-full max-w-[420px] rounded-full px-[30px] text-base font-semibold"
      >
        Create experience
      </Button>
    </div>
  );
};
