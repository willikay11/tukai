'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface MomentsShowMoreProps {
  isLoading: boolean;
  onClick: () => void;
}

/**
 * "Show more" under the feed. The reader asks for the next page rather than
 * having it load as they scroll, as the Moments design shows.
 */
export const MomentsShowMore = ({ isLoading, onClick }: MomentsShowMoreProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-surface px-5 text-[14.5px] font-bold text-brand transition-colors hover:bg-surface-brand disabled:opacity-50"
  >
    {isLoading ? (
      <span role="status" aria-label="Loading..." className="flex items-center gap-2">
        <IconComponent
          iconName="Loading03Icon"
          size={16}
          color="currentColor"
          className="animate-spin"
        />
        Show more
      </span>
    ) : (
      <>
        Show more
        <IconComponent
          iconName="ArrowDown01Icon"
          size={16}
          color="currentColor"
          className="flex-shrink-0"
        />
      </>
    )}
  </button>
);
