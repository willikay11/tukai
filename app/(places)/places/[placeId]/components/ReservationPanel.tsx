'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useCancelPlaceBookingRequest,
  usePlaceBookingRequests,
  usePlaceReservationProfiles,
} from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { PlaceBookingRequest, PlaceReservationProfile } from '@/types/placeReservation';

import { PlaceReservationsCalendar } from './PlaceReservationsCalendar';

export const ReservationPanel = ({
  placeId,
  placeName,
}: {
  placeId: string;
  placeName: string;
}) => {
  const { toast } = useToast();

  const { data: profilesResponse, isLoading } = usePlaceReservationProfiles(placeId);
  const profiles: PlaceReservationProfile[] = profilesResponse?.data?.results ?? [];

  // A place may hold up to two profiles (restaurant and cinema); only an active
  // one can take bookings
  const profile = profiles.find(
    (entry) => entry.reservationType === 'restaurant_reservation' && entry.status === 'active',
  );

  const { data: bookingsResponse } = usePlaceBookingRequests(placeId, profile?.id);
  const reservations: PlaceBookingRequest[] = bookingsResponse?.data?.results ?? [];

  const { mutate: cancelBooking, isPending: isCancelling } = useCancelPlaceBookingRequest(
    placeId,
    profile?.id,
  );

  const handleCancel = (purchaseId: string) => {
    cancelBooking(purchaseId, {
      onSuccess: () =>
        toast({
          title: 'Reservation cancelled',
          description: `Your table at ${placeName} has been released`,
          variant: 'success',
        }),
      onError: (error: Error) =>
        toast({
          title: 'Could not cancel',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-3xl bg-gray-50" />;
  }

  // A place only takes bookings once its owning community sets up a reservation
  // profile. Until then the panel still shows — hiding it would leave the whole
  // column empty on every place — but the button is disabled rather than
  // pointed at an endpoint that cannot serve it.
  const isBookable = Boolean(profile);

  return (
    <div className="space-y-4 rounded-3xl bg-gray-50 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-gray-900">Make a Reservation</p>
        {isBookable && (
          <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Free reservation
          </span>
        )}
      </div>

      {isBookable && (
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary">
            <IconComponent iconName="Calendar03Icon" size={18} className="text-lime" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900">Free to reserve</p>
            <p className="text-sm text-gray-500">Hold your table - no charge to book</p>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        {isBookable
          ? 'Pick a date & time, add your guests, and invite friends - all in one quick flow.'
          : `${placeName} has not opened up reservations yet.`}
      </p>

      <Button
        asChild={isBookable}
        disabled={!isBookable}
        title={isBookable ? undefined : 'This place does not take reservations yet'}
        className="w-full rounded-full"
      >
        {isBookable ? (
          <Link href={`/places/${placeId}/reserve`}>
            <span className="flex items-center justify-center gap-2">
              Make Reservation
              <IconComponent iconName="ArrowRight01Icon" size={16} color="currentColor" />
            </span>
          </Link>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Make Reservation
            <IconComponent iconName="ArrowRight01Icon" size={16} color="currentColor" />
          </span>
        )}
      </Button>

      {/* A place becomes bookable when its owning community claims it and sets
          up a profile, so the way out of this state is to claim it */}
      {!isBookable && (
        <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
          <IconComponent
            iconName="InformationCircleIcon"
            size={18}
            color="currentColor"
            className="mt-0.5 flex-shrink-0 text-primary"
          />
          <p className="text-sm text-gray-600">
            Own or manage this place?{' '}
            <Link
              href={`/places/claim?placeId=${placeId}`}
              className="font-medium text-primary hover:underline"
            >
              Claim it
            </Link>{' '}
            to take reservations on Tukai.
          </p>
        </div>
      )}

      {reservations.length > 0 && (
        <PlaceReservationsCalendar
          reservations={reservations}
          placeName={placeName}
          isCancelling={isCancelling}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};
