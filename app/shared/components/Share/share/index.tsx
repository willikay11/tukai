'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons/IconComponent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ShareSheet } from '../ShareSheet';
import type { ShareContent } from '../shareContent';

/**
 * A Share control and the share sheet it opens.
 *
 * `content` comes from the builders in shareContent.ts - placeShare,
 * experienceShare, communityShare, momentShare - so every Share in the app
 * says the same thing about the same kind of thing.
 */
export const Share = ({
  content,
  variant = 'button',
  showLabel = false,
}: {
  content: ShareContent;
  /**
   * `icon` is the bare glyph, for a row of circular controls that supply
   * their own disc - the drawer headers, where a labelled pill beside two
   * icon buttons reads as a different kind of control.
   */
  variant?: 'button' | 'icon';
  /**
   * Adds a "Share" word beside the icon variant's glyph - the ticket detail
   * view's Share/Download row, where the bare glyph alone would not match its
   * labelled neighbour. Ignored by the `button` variant, which already has
   * its own label.
   */
  showLabel?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={showLabel ? undefined : 'Share'}
          className={cn(
            'flex items-center text-brand transition-opacity hover:opacity-70',
            showLabel ? 'gap-1.5 text-sm font-semibold' : 'h-full w-full justify-center',
          )}
        >
          <IconComponent iconName="Share08Icon" size={20} color="currentColor" />
          {showLabel && 'Share'}
        </button>
      ) : (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full"
          variant="outline"
        >
          <span>Share</span>
          <IconComponent iconName="Share08Icon" size={16} color="currentColor" className="ml-2" />
        </Button>
      )}

      <ShareSheet content={content} open={open} onOpenChange={setOpen} />
    </>
  );
};
