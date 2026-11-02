'use client';

import { ReactNode, useEffect, useRef } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { canvasIcon } from '@/utils/canvas-icons';

/** The round disc every drawer's header controls sit in. */
export const DISC =
  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface';

/**
 * One screen of the bucket list panel: the 68px header, the body, and the
 * action bar when the screen has one.
 *
 * The title takes focus whenever a screen opens, so a keyboard or screen
 * reader lands on what just appeared rather than on the card behind it.
 */
export const BucketListPanelFrame = ({
  title,
  // A screen with a blank title still needs a name - Created
  ariaTitle,
  onBack,
  onInvite,
  onShare,
  onClose,
  footer,
  children,
}: {
  title: string;
  ariaTitle?: string;
  onBack?: () => void;
  onInvite?: () => void;
  onShare?: () => void;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className={`${DISC} text-brand transition-colors hover:bg-surface-brand`}
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
        )}

        <h2
          ref={titleRef}
          tabIndex={-1}
          aria-label={title ? undefined : ariaTitle}
          className="min-w-0 flex-1 truncate px-1.5 text-2xl font-bold tracking-[-0.4px] text-gray-800 outline-none"
        >
          {title}
        </h2>

        {onInvite && (
          <button
            type="button"
            onClick={onInvite}
            aria-label="Invite members"
            className={`${DISC} text-brand transition-colors hover:bg-surface-brand`}
          >
            <IconComponent
              iconName={canvasIcon('hgi-user-add-02')!}
              size={20}
              color="currentColor"
            />
          </button>
        )}

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            aria-label="Share"
            className={`${DISC} text-brand transition-colors hover:bg-surface-brand`}
          >
            <IconComponent iconName={canvasIcon('hgi-share-08')!} size={20} color="currentColor" />
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`${DISC} text-danger transition-colors hover:bg-danger-surface`}
        >
          <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
        </button>
      </div>

      <div className="flex-1 px-6 pb-9 pt-5">{children}</div>

      {footer && (
        <footer className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 pb-[calc(18px+env(safe-area-inset-bottom))] pt-[18px]">
          {footer}
        </footer>
      )}
    </div>
  );
};
