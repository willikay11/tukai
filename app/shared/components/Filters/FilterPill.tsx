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
      isSelected ? 'bg-green-100 text-primary' : 'bg-gray-100 text-gray-500',
      className,
    )}
  >
    {icon && <IconComponent iconName={icon} size={18} />}
    <span
      className={clsx('text-nowrap text-xs', icon && 'ml-2', {
        'font-semibold text-primary': isSelected,
        'font-medium text-gray-700': !isSelected,
      })}
    >
      {label}
    </span>
  </button>
);
