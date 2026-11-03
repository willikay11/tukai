'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { useTukai } from '@/context/TukaiContext';
import type { TukaiPaywallReason } from '@/types/tukai';
import { TUKAI_PRICE_LABEL } from '@/utils/tukai';

import { TukaiMark } from './TukaiMark';

const COPY: Record<TukaiPaywallReason, { title: string; text: string }> = {
  chats: {
    title: 'Keep going with TukAI',
    text: 'You have used your 2 free chats. Get TukAI for unlimited chats and longer plans.',
  },
  cap: {
    title: 'Keep going with TukAI',
    text: 'This chat has reached its 10 messages. Get TukAI for unlimited messages and chats.',
  },
  upgrade: {
    title: 'Get more from TukAI',
    text: 'Unlimited chats, longer plans and writing help right inside forms.',
  },
  helper: {
    title: 'Writing help is part of TukAI',
    text: 'Get TukAI to write captions, reviews, replies and descriptions right inside the form.',
  },
};

const FEATURES = [
  'Unlimited chats, with no message limit',
  'Day-by-day plans you can save as bucket lists',
  'Writing help in forms, from captions to replies to guests',
  'Experience drafts for the communities you own',
];

/** What TukAI costs and what it unlocks, worded for why it showed. */
export const TukaiPaywall = () => {
  const { paywallReason, goToPay, backFromPaywall } = useTukai();
  const copy = COPY[paywallReason ?? 'upgrade'];

  return (
    <div className="flex w-full max-w-[460px] flex-shrink-0 flex-col gap-[18px] self-center px-0.5 pb-1">
      <div>
        <TukaiMark size="xl" className="mb-3.5" />
        <h2 className="m-0 text-balance text-[22px] font-bold leading-[1.25] tracking-[-0.3px] text-brand-ink">
          {copy.title}
        </h2>
        <p className="mt-1.5 text-pretty text-[14.5px] leading-normal text-ink-note">{copy.text}</p>
      </div>

      <div className="flex flex-shrink-0 flex-col gap-3.5 rounded-14 bg-lime-soft p-[18px]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base font-bold text-brand-ink">TukAI</span>
          <span className="whitespace-nowrap">
            <span className="text-[26px] font-bold tabular-nums leading-none tracking-[-0.03em] text-brand-ink">
              {TUKAI_PRICE_LABEL}
            </span>
            <span className="ml-[5px] text-sm text-ink-muted">/ month</span>
          </span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm leading-[1.45] text-gray-800"
            >
              <IconComponent
                iconName="Tick02Icon"
                size={17}
                color="currentColor"
                className="mt-px flex-shrink-0 text-brand-ink"
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={goToPay}
        className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-6 text-base font-semibold text-white hover:brightness-[1.06]"
      >
        Get TukAI for {TUKAI_PRICE_LABEL} a month
      </button>
      <p className="-mt-1.5 text-pretty text-center text-[13px] leading-normal text-ink-muted">
        Cancel any time. TukAI keeps working until the end of the month you paid for.
      </p>
      <button
        type="button"
        onClick={backFromPaywall}
        className="min-h-11 self-center rounded-full px-[18px] text-[15px] font-semibold text-ink-muted hover:bg-surface"
      >
        Not now
      </button>
    </div>
  );
};
