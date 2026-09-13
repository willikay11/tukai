'use client';

import { ReactNode } from 'react';

import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * The box the {@link AuthCard} is shown in.
 *
 * The shared DialogContent is 720px from md — a page width for a sign-in form,
 * and every surface that showed the card had to remember to cap it. Two of them
 * did not, so the same card appeared at two very different sizes. This is the
 * one place that decides.
 *
 * Both caps are set on purpose: the base declares only the `md:` one, so an
 * unprefixed max-width alone would never reach the desktop width.
 */
export const AuthDialogContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <DialogContent
    className={cn(
      'max-w-[460px] gap-0 rounded-[15px] px-6 py-8 md:max-w-[460px] md:px-8',
      className,
    )}
  >
    {children}
  </DialogContent>
);
