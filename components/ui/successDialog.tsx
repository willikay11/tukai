'use client';

import { ReactNode } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

import { Button } from './button';

/**
 * The confirmation shown once something has been sent or completed: a tick in
 * a pale circle, what happened, and one way onwards.
 *
 * Distinct from {@link CreateSuccessDialog}, which is illustration-led and
 * offers two onward routes.
 */
export const SuccessDialog = ({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = 'Done',
  iconName = 'Tick02Icon',
  className,
  onAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  actionLabel?: string;
  iconName?: string;
  className?: string;
  onAction: () => void;
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent
      className={cn(
        'flex w-[calc(100%-32px)] flex-col items-center gap-0 rounded-3xl p-8 sm:w-[360px] sm:max-w-none',
        className,
      )}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
        <IconComponent
          iconName={iconName}
          size={48}
          color="currentColor"
          className="text-primary"
        />
      </div>

      <AlertDialogTitle className="mt-6 text-center text-2xl font-bold text-gray-900">
        {title}
      </AlertDialogTitle>

      <AlertDialogDescription className="mt-3 text-center text-base leading-7 text-gray-500">
        {description}
      </AlertDialogDescription>

      <Button variant="gradient" onClick={onAction} className="mt-8 h-[54px] w-full rounded-full">
        {actionLabel}
      </Button>
    </AlertDialogContent>
  </AlertDialog>
);
