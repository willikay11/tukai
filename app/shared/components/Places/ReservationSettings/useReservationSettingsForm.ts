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

/** Has nowhere to live on the API - see the reservation_settings_backend_gaps memory. */
type LocalOnlyValues = Pick<ReservationSettingsValues, 'partySize' | 'expiryHours'>;

const DEFAULT_LOCAL_ONLY: LocalOnlyValues = { partySize: '', expiryHours: '2' };

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
  // Max party size and the answer-by window have no field on the API, so this
  // is the closest thing to a "saved" value they get: it survives Cancel (like
  // a real saved field would) but resets once the drawer is reopened fresh.
  const [localOnly, setLocalOnly] = useState<LocalOnlyValues>(DEFAULT_LOCAL_ONLY);

  const loaded: ReservationSettingsValues = useMemo(() => {
    const [first] = rules;

    return {
      reservationType: profile?.reservationType ?? 'restaurant_reservation',
      seatingCapacity: profile?.seatingCapacity ? String(profile.seatingCapacity) : '',
      partySize: localOnly.partySize,
      days: rules.map((rule) => WEEKDAYS[rule.dayOfWeek]).filter(Boolean),
      opensAt: first?.openTime?.slice(0, 5) ?? '',
      closesAt: first?.closeTime?.slice(0, 5) ?? '',
      bufferMinutes: first?.slotIntervalMinutes ? String(first.slotIntervalMinutes) : '',
      expiryHours: localOnly.expiryHours,
    };
  }, [profile, rules, localOnly]);

  const values: ReservationSettingsValues = { ...loaded, ...touched };

  const set = (patch: Partial<ReservationSettingsValues>) =>
    setTouched((current) => ({ ...current, ...patch }));

  const reset = () => {
    setTouched({});
    setErrors({});
    setHasAttemptedSave(false);
  };

  const errorSummary = hasAttemptedSave ? reservationErrorSentence(values) : null;

  const submit = (onSaved: () => void) => {
    const parsed = reservationSettingsSchema.safeParse(values);
    const nextErrors = parsed.success ? {} : zodErrorsToMap(parsed.error);

    setErrors(nextErrors);

    if (!parsed.success) {
      setHasAttemptedSave(true);
      return;
    }

    const draft: ReservationSettingsDraft = {
      profileId: profile?.id,
      profile: {
        reservationType: values.reservationType,
        ...(values.seatingCapacity ? { seatingCapacity: Number(values.seatingCapacity) } : {}),
      },
      rules: values.days.map((day) => ({
        dayOfWeek: WEEKDAYS.indexOf(day as (typeof WEEKDAYS)[number]),
        openTime: values.opensAt,
        closeTime: values.closesAt,
        ...(values.bufferMinutes ? { slotIntervalMinutes: Number(values.bufferMinutes) } : {}),
      })),
      existingRules: rules,
      isActive: profile?.status === 'active',
      placePhotos,
      // partySize/expiryHours are deliberately left out: no field exists yet
      // for either on the API. They are kept in `localOnly` instead.
    };

    save(draft, {
      onSuccess: () => {
        setLocalOnly({ partySize: values.partySize, expiryHours: values.expiryHours });
        onSaved();
      },
      onError: (error: Error) =>
        toast({ title: 'Could not save', description: error.message, variant: 'destructive' }),
    });
  };

  return { values, errors, errorSummary, localOnly, set, reset, submit, isSaving: isPending };
};
