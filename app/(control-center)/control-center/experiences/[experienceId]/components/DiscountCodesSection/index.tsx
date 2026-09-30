'use client';

import { useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useMyPromoCodes, useUpdatePromoCode } from '@/app/shared/hooks/usePromoCodes';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { PromoCode } from '@/types/promoCode';

import { DeleteDiscountCodeDialog } from '../DeleteDiscountCodeDialog';
import { DiscountCodeForm } from '../DiscountCodeForm';
import { DiscountCodeRedemptions } from '../DiscountCodeRedemptions';

interface DiscountCodesSectionProps {
  experienceId: string;
  currency: string;
}

/**
 * The host's codes for one experience.
 *
 * `mine/` returns every code the host owns across all their experiences and
 * takes no experience filter, so the narrowing happens here.
 */
export const codesForExperience = (codes: PromoCode[], experienceId: string): PromoCode[] =>
  codes.filter((code) => code.experience === experienceId);

/** "32 times", and "1 time" — the canvas counts in words. */
export const redeemedLabel = (count: number): string =>
  `${count} ${count === 1 ? 'time' : 'times'}`;

const Stat = ({ label, value, muted }: { label: string; value: string; muted: boolean }) => (
  <div className="flex min-w-0 flex-col gap-1 bg-surface px-4 py-3">
    <span className="text-13 leading-snug text-ink-muted">{label}</span>
    <span
      className={cn(
        'break-words text-base font-semibold leading-snug',
        muted ? 'text-ink-muted' : 'text-gray-900',
      )}
    >
      {value}
    </span>
  </div>
);

const RowAction = ({
  icon,
  label,
  tone = 'brand',
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  tone?: 'brand' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full px-2.5 text-15 font-medium transition-colors disabled:opacity-50',
      tone === 'danger'
        ? 'text-danger hover:bg-danger-surface'
        : 'text-brand hover:bg-surface-brand',
    )}
  >
    <IconComponent iconName={icon} size={20} color="currentColor" />
    {label}
  </button>
);

const Dot = () => (
  <span aria-hidden="true" className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />
);

export const DiscountCodesSection = ({ experienceId, currency }: DiscountCodesSectionProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [viewing, setViewing] = useState<PromoCode | null>(null);
  const [deleting, setDeleting] = useState<PromoCode | null>(null);

  const { data: response, isLoading } = useMyPromoCodes();
  const { mutate: updateCode, isPending, variables } = useUpdatePromoCode();

  const codes = useMemo(() => {
    const all: PromoCode[] = response?.data?.results ?? response?.data ?? [];
    return Array.isArray(all) ? codesForExperience(all, experienceId) : [];
  }, [response, experienceId]);

  const open = (code: PromoCode | null) => {
    setEditing(code);
    setIsFormOpen(true);
  };

  const share = async (code: PromoCode) => {
    if (!code.isActive) {
      toast({
        title: `${code.code} is paused`,
        description: 'Resume it before you share it.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(code.code);
      toast({
        title: `${code.code} copied`,
        description: 'Share it with your community.',
        variant: 'success',
      });
    } catch {
      // Clipboard access can be refused; the code itself is still the answer
      toast({ title: code.code, description: 'Copy this code to share it.' });
    }
  };

  const toggleActive = (code: PromoCode) =>
    updateCode(
      { id: code.id, payload: { isActive: !code.isActive } },
      {
        onSuccess: () =>
          toast({
            title: code.isActive ? `${code.code} is paused` : `${code.code} is live again`,
            description: code.isActive
              ? 'It cannot be used until you resume it.'
              : 'It can be used again.',
            variant: 'success',
          }),
        onError: (error: Error) =>
          toast({
            title: 'Could not change this code',
            description: error.message,
            variant: 'destructive',
          }),
      },
    );

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h3 className="text-19 font-bold tracking-tight text-gray-900">Discount codes</h3>
        <button
          type="button"
          onClick={() => open(null)}
          className="inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full px-2.5 text-15 font-medium text-brand transition-colors hover:bg-surface-brand"
        >
          <IconComponent iconName="DiscountTag02Icon" size={20} color="currentColor" />
          Generate discount code
        </button>
      </div>

      <p className="text-15 leading-relaxed text-ink-muted">
        Generate discount codes to help promote this experience.
      </p>

      {isLoading && <p className="py-4 text-sm text-ink-subtle">Loading your codes…</p>}

      {!isLoading && codes.length === 0 && (
        <p className="py-4 text-sm text-ink-subtle">No discount codes yet for this experience.</p>
      )}

      {codes.map((code) => {
        const paused = !code.isActive;
        const busy = isPending && variables?.id === code.id;

        return (
          <div key={code.id} className="flex flex-col gap-3 pt-3">
            <div className="flex items-center gap-3">
              <IconComponent
                iconName="DiscountTag02Icon"
                size={24}
                color="currentColor"
                className={cn('flex-shrink-0', paused ? 'text-ink-subtle' : 'text-brand')}
              />
              <h4
                className={cn(
                  'min-w-0 flex-1 break-words text-xl font-bold tracking-wide',
                  paused ? 'text-ink-muted' : 'text-gray-900',
                )}
              >
                {code.code}
              </h4>
              {paused && (
                <span className="inline-flex h-[26px] flex-shrink-0 items-center rounded-full bg-surface px-2.5 text-13 font-semibold text-ink-muted">
                  Paused
                </span>
              )}
              <button
                type="button"
                onClick={() => share(code)}
                aria-label={`Share ${code.code}`}
                className={cn(
                  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-brand',
                  paused ? 'text-ink-subtle' : 'text-brand',
                )}
              >
                <IconComponent iconName="Share08Icon" size={20} color="currentColor" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-14">
              <Stat
                label="Discount type"
                value={code.discountType === 'percentage' ? 'Percentage' : 'Fixed amount'}
                muted={paused}
              />
              <Stat
                label="Amount"
                value={
                  code.discountType === 'percentage'
                    ? `${Number(code.discountPercentage ?? 0)}%`
                    : `${currency} ${Number(code.discountAmount ?? 0).toLocaleString('en-US')}`
                }
                muted={paused}
              />
              <Stat
                label="Redeemed"
                value={redeemedLabel(code.redeemedCount ?? 0)}
                muted={paused}
              />
            </div>

            <div className="-mt-1 flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1">
              <RowAction
                icon="ChartLineData01Icon"
                label="Redemptions"
                onClick={() => setViewing(code)}
              />
              <Dot />
              <RowAction
                icon={paused ? 'PlayIcon' : 'StopCircleIcon'}
                label={paused ? 'Resume code' : 'Pause code'}
                tone={paused ? 'brand' : 'danger'}
                onClick={() => toggleActive(code)}
                disabled={busy}
              />
              <Dot />
              <RowAction icon="PencilEdit02Icon" label="Edit code" onClick={() => open(code)} />
              <Dot />
              <RowAction
                icon="Delete02Icon"
                label="Delete"
                tone="danger"
                onClick={() => setDeleting(code)}
              />
            </div>
          </div>
        );
      })}

      <DiscountCodeRedemptions
        code={viewing}
        currency={currency}
        onClose={() => setViewing(null)}
      />

      <DeleteDiscountCodeDialog code={deleting} onClose={() => setDeleting(null)} />

      <DiscountCodeForm
        experienceId={experienceId}
        currency={currency}
        existingCodes={codes.map((code) => code.code)}
        editing={editing}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </section>
  );
};
