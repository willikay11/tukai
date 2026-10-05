'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { PlanThisDrawer, PlanThisSubject } from './PlanThisDrawer';

/**
 * "Plan this" beside an experience or a place.
 *
 * Deliberately not a primary button: it sits near a ticket price, and anything
 * that reads like buying would be read as buying.
 */
export const PlanThisButton = ({
  subject,
  className,
}: {
  subject: PlanThisSubject;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium text-brand transition-colors hover:bg-surface-brand',
          className,
        )}
      >
        <IconComponent iconName="MapsIcon" size={18} color="currentColor" />
        Plan this
      </button>

      <PlanThisDrawer subject={subject} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
