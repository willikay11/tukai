'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';

/**
 * The Tickets created tab's action bar. Per the handoff's own Open items #5,
 * neither button does anything real yet - both just toast, same as
 * Redemptions already does in DiscountCodesSection.
 */
export const HostActionBar = ({ buyerCount }: { buyerCount: number }) => {
  const { toast } = useToast();

  return (
    <div className="flex min-h-[88px] flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
      <button
        type="button"
        onClick={() =>
          toast({
            description:
              buyerCount > 0
                ? `Write one message to all ${buyerCount} buyers. It arrives in their Tukai inbox.`
                : 'No one has bought a ticket yet. You can message buyers once sales start.',
          })
        }
        className="inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-6 text-15 font-semibold text-white transition-shadow hover:shadow-[0_6px_16px_rgba(1,51,52,.16)] active:scale-[0.97]"
      >
        <IconComponent iconName="MessageMultiple02Icon" size={20} color="currentColor" />
        Message all buyers
      </button>

      <button
        type="button"
        onClick={() =>
          toast({ description: 'Add a new ticket type with its own name, price and quantity.' })
        }
        className="inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-lime px-6 text-15 font-semibold text-brand-ink transition-shadow hover:bg-lime-dark hover:shadow-[0_6px_16px_rgba(176,232,0,.4)] active:scale-[0.97]"
      >
        <IconComponent iconName="Ticket01Icon" size={20} color="currentColor" />
        Create another ticket
      </button>
    </div>
  );
};
