'use client';

import { useMemo, useState } from 'react';

import { WEEKDAYS } from '@/app/shared/components/Places/WeekdayPills';
import { useSaveReservationSettings } from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Photo } from '@/types/photo';
import {
  PlaceAvailabilityRule,
  PlaceReservationProfile,
  ReservationSettingsDraft,
} from '@/types/placeReservation';

import { reservationErrorSentence } from './errorSentence';
import { ReservationSettingsValues, reservationSettingsSchema, zodErrorsToMap } from './schemas';

/** Prices are shown and typed in whole shillings: "500.00" reads as "500". */
const wholeAmount = (amount?: string | null): string =>
  amount && Number(amount) > 0 ? String(Number(amount)) : '';

const asText = (value?: number | null, fallback = ''): string => (value ? String(value) : fallback);

export const DEFAULT_RESPOND_WITHIN = '2';
export const DEFAULT_PAY_WITHIN = '3';

export const useReservationSettingsForm = ({
  placeId,
  profile,
  rules,
  placePhotos,
}: {
  placeId: string;
  profile?: PlaceReservationProfile;
  rules: PlaceAvailabilityRule[];
  placePhotos?: Photo[];
}) => {
  const { toast } = useToast();
  const { mutate: save, isPending } = useSaveReservationSettings(placeId);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Partial<ReservationSettingsValues>>({});
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  const currency =
    profile?.depositAmount?.currency ?? profile?.entryFees?.[0]?.price.currency ?? 'KES';

  const loaded: ReservationSettingsValues = useMemo(() => {
    const [first] = rules;

    return {
      reservationType: profile?.reservationType ?? 'restaurant_reservation',
      paymentType: profile?.paymentType ?? 'free',
      depositAmount: wholeAmount(profile?.depositAmount?.amount),
      entryFees: (profile?.entryFees ?? []).map((fee) => ({
        guestType: fee.guestType,
        amount: wholeAmount(fee.price.amount),
      })),
      seatingCapacity: asText(profile?.seatingCapacity),
      partySize: asText(profile?.maxPartySize),
      days: rules.map((rule) => WEEKDAYS[rule.dayOfWeek]).filter(Boolean),
      opensAt: first?.openTime?.slice(0, 5) ?? '',
      closesAt: first?.closeTime?.slice(0, 5) ?? '',
      bufferMinutes: asText(first?.slotIntervalMinutes),
      respondWithinHours: asText(profile?.respondWithinHours, DEFAULT_RESPOND_WITHIN),
      payWithinHours: asText(profile?.payWithinHours, DEFAULT_PAY_WITHIN),
    };
  }, [profile, rules]);

  const values: ReservationSettingsValues = { ...loaded, ...touched };

  const set = (patch: Partial<ReservationSettingsValues>) =>
    setTouched((current) => ({ ...current, ...patch }));

  const reset = () => {
    setTouched({});
    setErrors({});
    setHasAttemptedSave(false);
  };

  const errorSummary = hasAttemptedSave ? reservationErrorSentence(values) : null;

  /** Checks the form; on a problem shows the error box and returns false. */
  const validate = (): boolean => {
    const parsed = reservationSettingsSchema.safeParse(values);
    setErrors(parsed.success ? {} : zodErrorsToMap(parsed.error));
    setHasAttemptedSave(!parsed.success);
    return parsed.success;
  };

  const submit = (onSaved: () => void) => {
    if (!validate()) return;

    const money = (amount: string) => ({ amount, currency });

    const draft: ReservationSettingsDraft = {
      profileId: profile?.id,
      profile: {
        reservationType: values.reservationType,
        ...(values.seatingCapacity ? { seatingCapacity: Number(values.seatingCapacity) } : {}),
        ...(values.partySize ? { maxPartySize: Number(values.partySize) } : {}),
        respondWithinHours: Number(values.respondWithinHours),
        payWithinHours: Number(values.payWithinHours),
        paymentType: values.paymentType,
        // The terms of the other types are cleared, so a switch back to free
        // leaves nothing behind for guests to be charged
        depositAmount: values.paymentType === 'deposit' ? money(values.depositAmount) : null,
        entryFees:
          values.paymentType === 'entry_fee'
            ? values.entryFees.map((fee) => ({
                guestType: fee.guestType,
                price: money(fee.amount),
              }))
            : [],
      },
      rules: values.days.map((day) => ({
        dayOfWeek: WEEKDAYS.indexOf(day as (typeof WEEKDAYS)[number]),
        openTime: values.opensAt,
        closeTime: values.closesAt,
        ...(values.bufferMinutes ? { slotIntervalMinutes: Number(values.bufferMinutes) } : {}),
      })),
      isActive: profile?.status === 'active',
      placePhotos,
    };

    save(draft, {
      onSuccess: () => onSaved(),
      onError: (error: Error) =>
        toast({ title: 'Could not save', description: error.message, variant: 'destructive' }),
    });
  };

  return {
    values,
    errors,
    errorSummary,
    currency,
    set,
    reset,
    validate,
    submit,
    isSaving: isPending,
  };
};
