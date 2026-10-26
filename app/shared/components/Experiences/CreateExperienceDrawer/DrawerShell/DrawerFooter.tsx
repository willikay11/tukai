'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';

interface DrawerFooterProps {
  leftAction: { label: string; onClick: () => void; variant: 'cancel' | 'delete' };
  onSaveAndExit: () => void;
  isSavingAndExit?: boolean;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  isPrimaryLoading?: boolean;
  /** Select places has no "Save & exit" - it isn't a wizard step of its own. */
  hideSaveAndExit?: boolean;
}

/**
 * tk-drawer__foot, the same button cluster on every step and on Review:
 * Cancel/Delete, a spacer, Save & exit, then the primary action (its label
 * is the only thing that changes - "Save & continue", "Preview & publish" on
 * the last step, "Publish experience" on Review).
 */
export const DrawerFooter = ({
  leftAction,
  onSaveAndExit,
  isSavingAndExit,
  onPrimary,
  primaryLabel,
  primaryDisabled,
  isPrimaryLoading,
  hideSaveAndExit,
}: DrawerFooterProps) => (
  <footer className="flex min-h-[88px] flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
    {leftAction.variant === 'delete' ? (
      <button
        type="button"
        onClick={leftAction.onClick}
        className="inline-flex h-12 items-center gap-2 px-1.5 text-base font-medium text-gray-800 hover:underline"
      >
        <IconComponent iconName="Delete02Icon" size={20} color="#E02D3C" />
        {leftAction.label}
      </button>
    ) : (
      <button
        type="button"
        onClick={leftAction.onClick}
        className="h-12 px-1.5 text-base font-medium text-danger hover:underline"
      >
        {leftAction.label}
      </button>
    )}

    <span className="flex-1" aria-hidden="true" />

    {!hideSaveAndExit && (
      <Button
        type="button"
        variant="outline"
        onClick={onSaveAndExit}
        isLoading={isSavingAndExit}
        className="h-12 flex-shrink-0 rounded-full border-[1.5px] border-brand px-[22px] text-[15px] font-semibold text-brand hover:bg-surface-brand"
      >
        Save &amp; exit
      </Button>
    )}
    <Button
      type="button"
      variant="lime"
      onClick={onPrimary}
      disabled={primaryDisabled}
      isLoading={isPrimaryLoading}
      className="h-12 rounded-full px-6 text-[15px] disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:opacity-100"
    >
      {primaryLabel}
    </Button>
  </footer>
);
