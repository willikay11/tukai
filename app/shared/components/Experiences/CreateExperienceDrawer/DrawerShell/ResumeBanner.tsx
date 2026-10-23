'use client';

interface ResumeBannerProps {
  onStartOver: () => void;
  isStartingOver?: boolean;
}

/** tk-resume - shown once, the first view after "Continue" on a saved draft. */
export const ResumeBanner = ({ onStartOver, isStartingOver }: ResumeBannerProps) => (
  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-0 rounded-xl bg-surface-brand py-1.5 pl-4 pr-2">
    <p className="min-w-[240px] flex-1 text-14 leading-relaxed text-brand-ink">
      Continuing your saved draft. You can keep one draft at a time.
    </p>
    <button
      type="button"
      onClick={onStartOver}
      disabled={isStartingOver}
      className="min-h-11 flex-shrink-0 whitespace-nowrap rounded-full px-2 text-15 font-semibold text-brand disabled:opacity-60"
    >
      Start over
    </button>
  </div>
);
