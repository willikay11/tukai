'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { useAuthDialog } from '@/context/AuthDialogContext';

import { EmailOrCodeCard } from './EmailOrCodeCard';
import { InterestsCard } from './InterestsCard';
import { WelcomeCard } from './WelcomeCard';

/**
 * The dialog shell: sizing, the scrim, Escape/outside-click, and which of the
 * three cards (Welcome, Email/Code, Interests) is on screen. AU-01.
 *
 * Built directly on the Radix primitives rather than the shared
 * `DialogContent` - that component bakes in its own Close button and a fixed
 * 720px cap, neither of which fits a dialog with three very differently
 * sized screens and its own Close/Back buttons per screen.
 */
export const AuthFlowDialog = () => {
  const { view, step, intsMode, close } = useAuthDialog();

  // The one place the design asks a dialog not to close: sign-up's interests
  // step has no way out except submitting.
  const blocked = view === 'interests' && intsMode !== 'edit';

  const ariaLabel =
    view === 'interests'
      ? 'Select your interests'
      : view === 'forgot'
        ? 'Reset your password'
        : view === 'register'
          ? 'Create your Tukai account'
          : 'Sign in to Tukai';

  const card =
    view === 'interests' ? (
      <InterestsCard />
    ) : view === 'forgot' || step ? (
      <EmailOrCodeCard />
    ) : (
      <WelcomeCard />
    );

  return (
    <DialogPrimitive.Root
      open={!!view}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[96] bg-[rgba(1,20,21,.62)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-label={ariaLabel}
          onEscapeKeyDown={(e) => {
            if (blocked) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (blocked) e.preventDefault();
          }}
          className="fixed left-1/2 top-1/2 z-[96] -translate-x-1/2 -translate-y-1/2 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {card}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
