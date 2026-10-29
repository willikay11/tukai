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

import { ReservationSettingsValues, reservationSettingsSchema, zodErrorsToMap } from './schemas';

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

  const loaded: ReservationSettingsValues = useMemo(() => {
    const [first] = rules;

    return {
      reservationType: profile?.reservationType ?? 'restaurant_reservation',
      seatingCapacity: profile?.seatingCapacity ? String(profile.seatingCapacity) : '',
      days: rules.map((rule) => WEEKDAYS[rule.dayOfWeek]).filter(Boolean),
      opensAt: first?.openTime?.slice(0, 5) ?? '',
      closesAt: first?.closeTime?.slice(0, 5) ?? '',
      bufferMinutes: first?.slotIntervalMinutes ? String(first.slotIntervalMinutes) : '',
    };
  }, [profile, rules]);

  const values: ReservationSettingsValues = { ...loaded, ...touched };

  const set = (patch: Partial<ReservationSettingsValues>) =>
    setTouched((current) => ({ ...current, ...patch }));

  const reset = () => {
    setTouched({});
    setErrors({});
  };

  const submit = (onSaved: () => void) => {
    const parsed = reservationSettingsSchema.safeParse(values);
    const nextErrors = parsed.success ? {} : zodErrorsToMap(parsed.error);

    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      toast({
        title: 'Check the highlighted fields',
        description: nextErrors[firstError],
        variant: 'destructive',
      });
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
    };

    save(draft, {
      onSuccess: onSaved,
      onError: (error: Error) =>
        toast({ title: 'Could not save', description: error.message, variant: 'destructive' }),
    });
  };

  return { values, errors, set, reset, submit, isSaving: isPending };
};
