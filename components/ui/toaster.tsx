'use client';

import { ReactNode } from 'react';

import { useToast } from '@/app/shared/hooks/useToast';
import { Toast, ToastDescription, ToastProvider, ToastViewport } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

/**
 * The canvas's toast: one dark pill of white text, centred along the bottom
 * edge - no icon, no close button. On a phone it clears the bottom tab bar -
 * 69px plus the home-indicator inset, and a 15px gap - and from 720px it sits
 * 26px up. Every toast in the app comes through here, the location bar's
 * included.
 */
const TOAST_PILL =
  'w-max max-w-full justify-center rounded-full bg-brand-ink px-[22px] py-3.5 text-center text-sm leading-snug text-white shadow-[0_14px_34px_rgba(1,51,52,.3)]';

/** How long the canvas keeps a toast up. One shows at a time - see TOAST_LIMIT. */
const TOAST_DURATION_MS = 4200;

/**
 * The canvas has one line of copy where callers pass a title and a
 * description, so the two are read as one sentence: "Saved to Weekend. The
 * Good Grain is on your list."
 */
export const toastSentence = (title?: ReactNode, description?: ReactNode): ReactNode => {
  if (!title) return description;
  if (!description) return title;

  if (typeof title === 'string' && typeof description === 'string') {
    const lead = title.trim();
    return `${/[.!?]$/.test(lead) ? lead : `${lead}.`} ${description.trim()}`;
  }

  return (
    <>
      {title} {description}
    </>
  );
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={TOAST_DURATION_MS}>
      {/* `variant` passes through, but TOAST_PILL's colours win the merge:
          the canvas draws an error the same as a success */}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className={cn(TOAST_PILL, props.className)}>
            <ToastDescription className="block text-sm leading-snug text-white opacity-100">
              {toastSentence(title, description)}
            </ToastDescription>
            {action}
          </Toast>
        );
      })}
      <ToastViewport className="bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 top-auto w-max max-w-[min(560px,calc(100vw-32px))] -translate-x-1/2 items-center gap-2 p-0 sm:right-auto sm:top-auto sm:flex-col min-[720px]:bottom-[26px] md:min-w-0 md:max-w-[min(560px,calc(100vw-32px))]" />
    </ToastProvider>
  );
}
