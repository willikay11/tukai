'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PRESSABLE } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';

/**
 * Starting a community.
 *
 * Two placements, one control: a button in the page header from md up, and a
 * floating pill along the bottom edge on a phone — where it stands in for the
 * main navigation, which this tab hides.
 */
export const CreateCommunityCta = ({
  variant = 'header',
  className,
}: {
  variant?: 'header' | 'floating';
  className?: string;
}) => {
  const label = (
    <>
      <IconComponent iconName="UserGroupIcon" size={18} color="currentColor" />
      Create Community
    </>
  );

  if (variant === 'floating') {
    return (
      <div className={cn('fixed bottom-6 left-1/2 z-50 -translate-x-1/2', className)}>
        <Link
          href="/communities/create"
          className={cn(
            'flex items-center gap-2 whitespace-nowrap rounded-full bg-lime px-6 py-3.5 text-sm font-medium text-primary shadow-lg ring-4 ring-white',
            PRESSABLE,
          )}
        >
          {label}
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/communities/create"
      className={cn(
        'flex flex-shrink-0 items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-medium text-primary hover:bg-lime/90',
        PRESSABLE,
        className,
      )}
    >
      {label}
    </Link>
  );
};
