import { IconComponent } from '@/app/shared/components/Icons';

const BASE = 'absolute z-[2] flex h-11 w-11 items-center justify-center rounded-full border-0 transition-colors';

/**
 * Every card's top-right Close. Suppressed by the caller on the sign-up
 * interests step. `inset` picks the safe-area-aware offset the full-screen
 * dialog cards need; the corner nudge card (not full-screen) uses a plain 12px.
 */
export const DialogCloseButton = ({
  onClose,
  inset = 'safe-area',
}: {
  onClose: () => void;
  inset?: 'safe-area' | 'flat';
}) => (
  <button
    type="button"
    onClick={onClose}
    aria-label="Close"
    className={`${BASE} ${inset === 'safe-area' ? 'top-[calc(12px_+_env(safe-area-inset-top))]' : 'top-3'} right-3 bg-surface text-danger hover:bg-danger-surface`}
  >
    <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
  </button>
);

/** The email form and code screens' top-left Back. */
export const DialogBackButton = ({ onBack }: { onBack: () => void }) => (
  <button
    type="button"
    onClick={onBack}
    aria-label="Back"
    className={`${BASE} left-3 top-[calc(12px_+_env(safe-area-inset-top))] bg-surface text-ink-pill hover:bg-surface-brand`}
  >
    <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
  </button>
);
