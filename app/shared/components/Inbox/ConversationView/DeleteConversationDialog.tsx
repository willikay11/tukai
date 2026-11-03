'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Asks before a conversation goes. Focus starts on Keep conversation, stays
 * inside while it is open, and Escape or the scrim cancels.
 *
 * Escape is caught on the way down, so it closes only this and not the side
 * panel underneath, which listens for Escape too.
 */
export const DeleteConversationDialog = ({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  // Held in a ref so a re-render behind the dialog (a poll for new messages)
  // does not re-run the effect and pull focus back to Keep
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;

  useEffect(() => {
    keepRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        cancelRef.current();
        return;
      }

      // Two buttons; Tab goes round them rather than out to the page
      if (event.key === 'Tab' && dialogRef.current) {
        const buttons = Array.from(dialogRef.current.querySelectorAll('button'));
        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-6">
      <div aria-hidden="true" onClick={onCancel} className="absolute inset-0 bg-brand-ink/[.42]" />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex w-full max-w-[420px] flex-col gap-5 rounded-18 bg-white p-6 shadow-[0_24px_60px_rgba(1,51,52,.24)]"
      >
        <div className="flex flex-col gap-2">
          <h2
            id={titleId}
            className="text-pretty text-[21px] font-bold leading-[1.3] tracking-[-0.3px] text-gray-800"
          >
            Delete this conversation?
          </h2>
          <p id={descriptionId} className="text-pretty text-15 leading-[1.55] text-ink-muted">
            Your messages with {name} are removed from your inbox. This can’t be undone.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 rounded-full bg-danger text-15 font-semibold text-white transition-colors hover:bg-danger-hover active:scale-[0.98]"
          >
            Delete conversation
          </button>
          <button
            ref={keepRef}
            type="button"
            onClick={onCancel}
            className="h-12 rounded-full bg-surface text-15 font-semibold text-gray-800 transition-colors hover:bg-surface-hover"
          >
            Keep conversation
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
