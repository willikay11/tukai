'use client';

import { ComponentPropsWithoutRef } from 'react';

import { ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

/**
 * One toolbar button.
 *
 * A rounded white chip on the grey bar — no `variant="outline"`, since a border
 * on each one makes the row read as fields rather than a toolbar. The active
 * state takes the light green the app selects with everywhere else (the date
 * and time pickers, the reservations calendar's day pills, the name presets);
 * it cannot be white, because that is the resting state.
 */
export const ToolbarToggleItem = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ToggleGroupItem>) => (
  <ToggleGroupItem
    size="sm"
    // Keeps the caret in the editor. Without this the click blurs the
    // contenteditable, and because the toolbar re-reads the editor's selection
    // on every render it reads one that has not taken the format yet — so the
    // button lit up and then flipped straight back off.
    onMouseDown={(event) => event.preventDefault()}
    className={cn(
      'rounded-lg bg-white font-medium hover:bg-gray-50',
      'data-[state=on]:bg-green-200 data-[state=on]:text-primary',
      className,
    )}
    {...props}
  />
);
