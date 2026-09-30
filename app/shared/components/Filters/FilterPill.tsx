'use client';

import clsx from 'clsx';

import { IconComponent } from '@/app/shared/components/Icons';
import { PRESSABLE } from '@/app/shared/components/Motion';

/**
 * The icon-and-label chip a page filters itself with.
 *
 * One component for every filter row in the app: the category bar over Explore
 * and Discover ({@link ScrollFilters}) and the "View by Type" row on
 * Communities. They were two implementations of the same chip, which is how
 * they drifted to different greens.
 *
 * Distinct from `CategoryPill` in `components/ui`, which is the deep-green chip
 * the create and interests flows *pick* categories with — choosing what
 * something is, rather than narrowing what is on screen.
 */
export const FilterPill = ({
  label,
  icon,
  isSelected = false,
  onClick,
  className,
}: {
  label: string;
  /** Hugeicons name */
  icon?: string;
  isSelected?: boolean;
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isSelected}
    className={clsx(
      'flex h-[2.5rem] flex-row items-center justify-center rounded-[2.5rem] px-4 py-2',
      PRESSABLE,
      // Canvas values, via the tokens: a chosen chip is #E8F1ED behind #066349,
      // a resting one #F3F4F2 behind #1F2937
      isSelected ? 'bg-surface-brand text-brand' : 'bg-surface text-gray-800',
      className,
    )}
  >
    {icon && <IconComponent iconName={icon} size={18} />}
    <span
      // 600 chosen, 500 resting — the canvas's own weights for a chip
      className={clsx('text-nowrap text-xs', icon && 'ml-2', {
        'font-semibold text-brand': isSelected,
        'font-medium text-gray-800': !isSelected,
      })}
    >
      {label}
    </span>
  </button>
);
