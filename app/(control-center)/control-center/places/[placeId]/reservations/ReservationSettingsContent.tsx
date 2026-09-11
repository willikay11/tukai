'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ExperienceCreatedModal } from '@/app/(experiences)/experiences/create/components/ExperienceCreatedModal';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import {
  usePlaceAvailability,
  usePlaceManager,
  usePlaceReservationProfiles,
  useSaveReservationSettings,
} from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimePicker, formatTimeLabel } from '@/components/ui/time-picker';
import { Place } from '@/types/place';
import {
  PlaceAvailabilityRule,
  PlaceReservationProfile,
  ReservationSettingsDraft,
} from '@/types/placeReservation';

import { SelectablePill, WEEKDAYS, WeekdayPills } from '../components/WeekdayPills';
import { ReservationSettingsValues, reservationSettingsSchema, zodErrorsToMap } from './schemas';

/**
 * How guests reserve.
 *
 * The API's two types are the restaurant's table booking and the cinema's seat
 * booking. Only the first is offered here — a place is what this screen
 * configures — and it is free, which is what the label says.
 */
const RESERVATION_TYPES: {
  value: ReservationSettingsValues['reservationType'];
  label: string;
  detail: string;
}[] = [
  {
    value: 'restaurant_reservation',
    label: 'Free Reservation',
    detail: 'Guests book for free and just show up. You’ll still see every reservation.',
  },
];

export const ReservationSettingsContent = ({ place }: { place: Place }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { isManager, isLoading: isLoadingManager } = usePlaceManager(place.id);

  const { data: profilesResponse, isLoading: isLoadingProfiles } = usePlaceReservationProfiles(
    place.id,
  );
  const profiles: PlaceReservationProfile[] = profilesResponse?.data?.results ?? [];
  const profile = profiles.find((entry) => entry.reservationType === 'restaurant_reservation');

  const { data: availabilityResponse, isLoading: isLoadingAvailability } = usePlaceAvailability(
    place.id,
    profile?.id,
  );
  // Memoised because the fallback would otherwise be a new array on every
  // render, and the form below is derived from it
  const existingRules: PlaceAvailabilityRule[] = useMemo(
    () => availabilityResponse?.data?.rules ?? [],
    [availabilityResponse],
  );

  const { mutate: save, isPending } = useSaveReservationSettings(place.id);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [touched, setTouched] = useState<Partial<ReservationSettingsValues>>({});

  // What the place already holds, once both requests have landed. The form
  // reads through to it until something is actually typed, so it does not have
  // to wait on an effect to seed itself.
  const loaded: ReservationSettingsValues = useMemo(() => {
    const [first] = existingRules;

    return {
      reservationType: profile?.reservationType ?? 'restaurant_reservation',
      seatingCapacity: profile?.seatingCapacity ? String(profile.seatingCapacity) : '',
      maxPartySize: profile?.maxPartySize ? String(profile.maxPartySize) : '',
      days: existingRules.map((rule) => WEEKDAYS[rule.dayOfWeek]).filter(Boolean),
      opensAt: first?.openTime?.slice(0, 5) ?? '',
      closesAt: first?.closeTime?.slice(0, 5) ?? '',
      bufferMinutes: first?.slotIntervalMinutes ? String(first.slotIntervalMinutes) : '',
    };
  }, [profile, existingRules]);

  const values: ReservationSettingsValues = { ...loaded, ...touched };
  const set = (patch: Partial<ReservationSettingsValues>) =>
    setTouched((current) => ({ ...current, ...patch }));

  const handleSave = () => {
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
        ...(values.maxPartySize ? { maxPartySize: Number(values.maxPartySize) } : {}),
      },
      // One set of hours applies to every day chosen, which is what the form
      // asks for — the API stores a rule per day
      rules: values.days.map((day) => ({
        dayOfWeek: WEEKDAYS.indexOf(day as (typeof WEEKDAYS)[number]),
        openTime: values.opensAt,
        closeTime: values.closesAt,
        ...(values.bufferMinutes ? { slotIntervalMinutes: Number(values.bufferMinutes) } : {}),
      })),
      existingRules,
      isActive: profile?.status === 'active',
    };

    save(draft, {
      onSuccess: () => setIsSavedModalOpen(true),
      onError: (error: Error) =>
        toast({ title: 'Could not save', description: error.message, variant: 'destructive' }),
    });
  };

  if (isLoadingManager || isLoadingProfiles || isLoadingAvailability) {
    return (
      <PageContainer className="py-6">
        <div className="h-96 animate-pulse rounded-3xl bg-gray-100" />
      </PageContainer>
    );
  }

  if (!isManager) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">
          Only the community that owns {place.title} can set up its reservations.
        </p>
      </PageContainer>
    );
  }

  const selectedType = RESERVATION_TYPES.find((entry) => entry.value === values.reservationType);
  const hoursPreview =
    values.opensAt && values.closesAt
      ? `${formatTimeLabel(values.opensAt)} - ${formatTimeLabel(values.closesAt)}`
      : 'Set opening and closing time.';

  return (
    <PageContainer className="py-6">
      <h1 className="text-2xl font-bold text-gray-900">Reservation Settings</h1>

      {/* One step today, laid out as the wizard's steps are so the next one —
          blocked-out dates, which the API already takes — drops straight in */}
      <Tabs value="reservation-type" className="mt-6">
        <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 scrollbar-hide">
          <TabsTrigger
            value="reservation-type"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-800 data-[state=active]:border-b-[0px] data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
          >
            <IconComponent iconName="CalendarAdd01Icon" size={20} variant="twotone" />
            Reservation Type
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5">
            <TabsContent value="reservation-type" className="mt-6 space-y-8">
              <section className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Reservation Type</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose how guests reserve this place, it&apos;s exactly what they&apos;re making
                    a reservation
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {RESERVATION_TYPES.map((type) => (
                    <SelectablePill
                      key={type.value}
                      label={type.label}
                      isSelected={values.reservationType === type.value}
                      onClick={() => set({ reservationType: type.value })}
                    />
                  ))}
                </div>

                {selectedType && (
                  <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">
                    {selectedType.detail}
                  </p>
                )}
              </section>

              <Divider />

              <section className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Total Seating Capacity{' '}
                  <span className="text-muted-foreground">
                    (Maximum guests you can host at once)
                  </span>
                </label>
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  aria-label="Total Seating Capacity"
                  placeholder="Enter seating capacity"
                  value={values.seatingCapacity}
                  onChange={(event) => set({ seatingCapacity: event.target.value })}
                  suffixIcon={
                    <IconComponent iconName="UserGroupIcon" size={18} className="text-gray-400" />
                  }
                />
                {errors.seatingCapacity && (
                  <p className="text-xs text-red-500">{errors.seatingCapacity}</p>
                )}
              </section>

              <section className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Max Party Size Per Booking{' '}
                  <span className="text-muted-foreground">(Max party size per booking)</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  aria-label="Max Party Size Per Booking"
                  placeholder="Enter max party size"
                  value={values.maxPartySize}
                  onChange={(event) => set({ maxPartySize: event.target.value })}
                  suffixIcon={
                    <IconComponent iconName="UserGroupIcon" size={18} className="text-gray-400" />
                  }
                />
                {errors.maxPartySize && (
                  <p className="text-xs text-red-500">{errors.maxPartySize}</p>
                )}
              </section>

              <Divider />

              <section className="space-y-6">
                <div className="space-y-2">
                  <WeekdayPills selected={values.days} onChange={(days) => set({ days })} />
                  {errors.days && <p className="text-xs text-red-500">{errors.days}</p>}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">Opening and Closing Hours</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TimePicker
                      value={values.opensAt}
                      placeholder="Opening Time"
                      onChange={(opensAt) => set({ opensAt })}
                    />
                    <TimePicker
                      value={values.closesAt}
                      placeholder="Closing Time"
                      minTime={values.opensAt}
                      onChange={(closesAt) => set({ closesAt })}
                    />
                  </div>
                  {(errors.opensAt || errors.closesAt) && (
                    <p className="text-xs text-red-500">{errors.opensAt || errors.closesAt}</p>
                  )}

                  <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">
                    <span className="font-semibold text-gray-900">Operating Hours: </span>
                    {hoursPreview}
                  </p>
                </div>
              </section>

              <Divider />

              <section className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Buffer between bookings{' '}
                  <span className="text-muted-foreground">
                    (Time to reset space/table e.g., 30 min)
                  </span>
                </label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  aria-label="Buffer between bookings"
                  placeholder="Enter buffer in minutes"
                  value={values.bufferMinutes}
                  onChange={(event) => set({ bufferMinutes: event.target.value })}
                  suffixIcon={<span className="text-xs text-gray-400">minutes</span>}
                />
                {errors.bufferMinutes && (
                  <p className="text-xs text-red-500">{errors.bufferMinutes}</p>
                )}
              </section>

              <div className="flex gap-2 pt-2 lg:gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/control-center/places/${place.id}`)}
                  className="text-xs font-medium text-destructive hover:text-destructive/80"
                >
                  Cancel
                </button>
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="lime"
                  isLoading={isPending}
                  onClick={handleSave}
                  className="rounded-[50px] text-xs font-medium"
                >
                  Save Changes
                </Button>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      <ExperienceCreatedModal
        open={isSavedModalOpen}
        onOpenChange={(open) => {
          setIsSavedModalOpen(open);
          if (!open) router.push(`/control-center/places/${place.id}`);
        }}
        title="Reservations Are Open!"
        description={`${place.title} now takes reservations on the days and hours you set. Requests will appear here for you to accept or decline.`}
        viewExperienceLabel="Done"
        onViewExperience={() => setIsSavedModalOpen(false)}
      />
    </PageContainer>
  );
};

const Divider = () => <div className="border-t border-gray-100" />;
