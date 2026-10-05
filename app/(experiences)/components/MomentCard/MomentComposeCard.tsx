'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { MOMENT_CARD_WIDTH } from './index';

/**
 * The tile that closes the Recent moments rail: an invitation to post one.
 *
 * It matches the height of the cards' PHOTOS rather than the whole card, the
 * same way SeeAllCard does, so it does not stretch past them to sit under the
 * bylines.
 */
export const MomentComposeCard = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex aspect-[3/4] flex-shrink-0 snap-start flex-col justify-between self-start rounded-2xl bg-surface-brand p-6 text-left transition-shadow hover:shadow-[0_8px_26px_rgba(1,51,52,.09)] active:scale-[0.98]',
      MOMENT_CARD_WIDTH,
    )}
  >
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
      <IconComponent
        iconName="Camera01Icon"
        size={24}
        color="currentColor"
        className="text-brand"
      />
    </span>

    <span className="flex flex-col gap-1.5">
      <span className="text-[17px] font-bold text-brand-ink">Been somewhere good?</span>
      <span className="text-[15px] leading-[1.45] text-ink-muted">
        Share a moment and tag the place, experience or community.
      </span>
    </span>
  </button>
);
