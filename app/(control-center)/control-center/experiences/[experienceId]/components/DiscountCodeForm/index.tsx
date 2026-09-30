'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { IconComponent } from '@/app/shared/components/Icons';
import { useCreatePromoCode, useUpdatePromoCode } from '@/app/shared/hooks/usePromoCodes';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { PROMO_CODE_MAX, PromoCode, normalisePromoCode } from '@/types/promoCode';

import { DiscountCodeValues, currencyName, discountCodeSchema, valueCopy } from './schema';

interface DiscountCodeFormProps {
  experienceId: string;
  currency: string;
  /** Every code already on this experience, for the duplicate check. */
  existingCodes: string[];
  /** The code being edited, or null when generating a new one. */
  editing: PromoCode | null;
  isOpen: boolean;
  onClose: () => void;
}

const TYPES: Array<{ value: 'fixed' | 'percentage'; label: string }> = [
  { value: 'fixed', label: 'Fixed amount' },
  { value: 'percentage', label: 'Percentage (%)' },
];

const EMPTY: DiscountCodeValues = { code: '', discountType: 'fixed', value: '' };

const valuesFor = (code: PromoCode | null): DiscountCodeValues =>
  code
    ? {
        code: code.code,
        discountType: code.discountType,
        value: String(
          code.discountType === 'percentage'
            ? (code.discountPercentage ?? '')
            : (code.discountAmount ?? ''),
        ),
      }
    : EMPTY;

export const DiscountCodeForm = ({
  experienceId,
  currency,
  existingCodes,
  editing,
  isOpen,
  onClose,
}: DiscountCodeFormProps) => {
  const { toast } = useToast();
  const { mutate: createCode, isPending: isCreating } = useCreatePromoCode();
  const { mutate: updateCode, isPending: isSaving } = useUpdatePromoCode();

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<DiscountCodeValues>(
    {
      resolver: zodResolver(discountCodeSchema(existingCodes, editing?.code)),
      defaultValues: valuesFor(editing),
      mode: 'onChange',
    },
  );

  // The drawer keeps mounted between openings, so the fields follow whichever
  // code was opened rather than the one before it
  useEffect(() => {
    if (isOpen) reset(valuesFor(editing));
  }, [isOpen, editing, reset]);

  const discountType = watch('discountType');
  const copy = valueCopy(discountType, currencyName(currency));
  const isPending = isCreating || isSaving;
  const heading = editing ? 'Edit discount code' : 'Generate discount code';

  const submit = handleSubmit((values) => {
    const amount = Number(values.value);
    const payload = {
      code: values.code,
      experience: experienceId,
      discountType: values.discountType,
      ...(values.discountType === 'percentage'
        ? { discountPercentage: amount }
        : { discountAmount: amount }),
    };

    const onError = (error: Error) =>
      toast({
        title: editing ? 'Could not save this code' : 'Could not generate this code',
        description: error.message,
        variant: 'destructive',
      });

    if (editing) {
      updateCode(
        { id: editing.id, payload },
        {
          onSuccess: () => {
            toast({
              title: 'Changes saved',
              description: `Changes to ${values.code} are saved.`,
              variant: 'success',
            });
            onClose();
          },
          onError,
        },
      );
      return;
    }

    createCode(payload, {
      onSuccess: () => {
        toast({
          title: `${values.code} is ready`,
          description: 'Share it with your community to promote this experience.',
          variant: 'success',
        });
        onClose();
      },
      onError,
    });
  });

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && onClose()} width="narrow">
      <form onSubmit={submit} className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-brand"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
          <h2 className="text-19 font-bold tracking-tight text-gray-900">{heading}</h2>
        </div>

        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="dc-code" className="text-15 font-semibold text-gray-900">
              Discount code{' '}
              <span className="font-normal text-ink-muted">
                (not more than {PROMO_CODE_MAX} characters)
              </span>
            </label>
            <input
              id="dc-code"
              type="text"
              autoComplete="off"
              placeholder="Enter discount code e.g. TRVL2026"
              {...register('code', {
                // The canvas normalises as you type: uppercase, letters and
                // digits only, and it stops at ten
                onChange: (event) =>
                  setValue('code', normalisePromoCode(event.target.value), {
                    shouldValidate: true,
                  }),
              })}
              className={cn(
                'h-[52px] w-full rounded-14 border bg-white px-4 text-15 tracking-wide text-gray-900 outline-none',
                'focus:border-brand focus:ring-4 focus:ring-surface-brand',
                formState.errors.code ? 'border-danger' : 'border-line',
              )}
            />
            {formState.errors.code && (
              <span role="alert" className="text-13 text-danger">
                {formState.errors.code.message}
              </span>
            )}
          </div>

          <div aria-hidden="true" className="-mx-6 h-px bg-surface-muted" />

          <div className="flex flex-col gap-2.5">
            <span id="dc-type" className="text-15 font-semibold text-gray-900">
              Discount value
            </span>
            <div role="radiogroup" aria-labelledby="dc-type" className="flex flex-wrap gap-2">
              {TYPES.map((type) => {
                const isOn = discountType === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    role="radio"
                    aria-checked={isOn}
                    // Switching the type clears the value: a percentage and an
                    // amount are not the same number
                    onClick={() => {
                      setValue('discountType', type.value, { shouldValidate: true });
                      setValue('value', '', { shouldValidate: false });
                    }}
                    className={cn(
                      'h-12 rounded-full px-[22px] text-15 font-medium transition-colors active:scale-[0.98]',
                      isOn
                        ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                        : 'bg-surface text-gray-900',
                    )}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="dc-val" className="text-15 font-semibold text-gray-900">
              {copy.label}
            </label>
            <div className="relative">
              <input
                id="dc-val"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={copy.placeholder}
                {...register('value', {
                  onChange: (event) =>
                    setValue(
                      'value',
                      String(event.target.value || '')
                        .replace(/[^0-9.]/g, '')
                        .slice(0, 8),
                      { shouldValidate: true },
                    ),
                })}
                className={cn(
                  'h-[52px] w-full rounded-14 border bg-white pl-4 pr-14 text-15 text-gray-900 outline-none',
                  'focus:border-brand focus:ring-4 focus:ring-surface-brand',
                  formState.errors.value ? 'border-danger' : 'border-line',
                )}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-1 top-1 flex h-11 w-11 items-center justify-center text-gray-900"
              >
                <IconComponent iconName={copy.icon} size={22} color="currentColor" />
              </span>
            </div>
            {formState.errors.value ? (
              <span role="alert" className="text-13 text-danger">
                {formState.errors.value.message}
              </span>
            ) : (
              <span className="text-13 text-ink-muted">{copy.note}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose} className="text-danger">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="lime"
            className="rounded-full px-6"
            disabled={!formState.isValid}
            isLoading={isPending}
          >
            {editing ? 'Save changes' : 'Generate discount code'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
