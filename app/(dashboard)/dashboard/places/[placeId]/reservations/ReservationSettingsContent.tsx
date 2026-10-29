'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ExperienceCreatedModal } from '@/app/(experiences)/experiences/create/components/ExperienceCreatedModal';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { ReservationSettingsFields } from '@/app/shared/components/Places/ReservationSettings/ReservationSettingsFields';
import { useReservationSettingsForm } from '@/app/shared/components/Places/ReservationSettings/useReservationSettingsForm';
import {
  usePlaceAvailability,
  usePlaceManager,
  usePlaceReservationProfiles,
} from '@/app/shared/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Place } from '@/types/place';
import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';

export const ReservationSettingsContent = ({ place }: { place: Place }) => {
  const router = useRouter();
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
  const existingRules: PlaceAvailabilityRule[] = useMemo(
    () => availabilityResponse?.data?.rules ?? [],
    [availabilityResponse],
  );

  const { values, errors, set, submit, isSaving } = useReservationSettingsForm({
    placeId: place.id,
    profile,
    rules: existingRules,
    placePhotos: place.photos,
  });
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

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

  return (
    <PageContainer className="py-6">
      <h1 className="text-2xl font-bold text-gray-900">Reservation Settings</h1>

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
              <ReservationSettingsFields values={values} errors={errors} set={set} />

              <div className="flex gap-2 pt-2 lg:gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/places/${place.id}`)}
                  className="text-xs font-medium text-destructive hover:text-destructive/80"
                >
                  Cancel
                </button>
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="lime"
                  isLoading={isSaving}
                  onClick={() => submit(() => setIsSavedModalOpen(true))}
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
          if (!open) router.push(`/dashboard/places/${place.id}`);
        }}
        title="Reservations Are Open!"
        description={`${place.title} now takes reservations on the days and hours you set. Requests will appear here for you to accept or decline.`}
        viewExperienceLabel="Done"
        onViewExperience={() => setIsSavedModalOpen(false)}
      />
    </PageContainer>
  );
};
