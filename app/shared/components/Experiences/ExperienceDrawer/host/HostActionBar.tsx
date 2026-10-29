'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';

export type HostActionBarButton = {
  label: string;
  iconName: string;
  onClick: () => void;
};

type ToastFn = ReturnType<typeof useToast>['toast'];

/**
 * "Message all buyers" is the same button, with the same copy, on both host
 * tabs that show an action bar (Tickets created and Sales) - a shared helper
 * so the two toast strings can't drift apart. Per the handoff's own Open item
 * #4, `count` here is meant to be buyers, but Tickets created only has
 * tickets-sold to hand it (no buyer grouping exists there) - each call site
 * passes whichever count it actually has.
 */
export const messageAllBuyersAction = (count: number, toast: ToastFn): HostActionBarButton => ({
  label: 'Message all buyers',
  iconName: 'MessageMultiple02Icon',
  onClick: () =>
    toast({
      description:
        count > 0
          ? `Write one message to all ${count} buyers. It arrives in their Tukai inbox.`
          : 'No one has bought a ticket yet. You can message buyers once sales start.',
    }),
});

/**
 * A host tab's action bar: two pill buttons, gradient then lime, sticky to
 * the bottom of the drawer's own scroll container. Per the handoff's own
 * Open items, neither button does anything real yet on either tab - both
 * just toast, same as Redemptions already does in DiscountCodesSection.
 */
export const HostActionBar = ({
  primary,
  secondary,
}: {
  primary: HostActionBarButton;
  secondary: HostActionBarButton;
}) => (
  <div className="sticky bottom-0 z-[4] flex min-h-[88px] flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
    <button
      type="button"
      onClick={primary.onClick}
      className="inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-6 text-15 font-semibold text-white transition-shadow hover:shadow-[0_6px_16px_rgba(1,51,52,.16)] active:scale-[0.97]"
    >
      <IconComponent iconName={primary.iconName} size={20} color="currentColor" />
      {primary.label}
    </button>

    <button
      type="button"
      onClick={secondary.onClick}
      className="inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-lime px-6 text-15 font-semibold text-brand-ink transition-shadow hover:bg-lime-dark hover:shadow-[0_6px_16px_rgba(176,232,0,.4)] active:scale-[0.97]"
    >
      <IconComponent iconName={secondary.iconName} size={20} color="currentColor" />
      {secondary.label}
    </button>
  </div>
);
