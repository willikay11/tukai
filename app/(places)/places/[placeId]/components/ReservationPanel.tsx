'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ExperienceCreatedModal } from '@/app/(experiences)/experiences/create/components/ExperienceCreatedModal';
import { IconComponent } from '@/app/shared/components/Icons';
import {
  useCancelPlaceBookingRequest,
  usePlaceBookingRequests,
  usePlaceManager,
  usePlaceOwnership,
  usePlaceReservationProfiles,
} from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { PlaceBookingRequest, PlaceReservationProfile } from '@/types/placeReservation';

import { ClaimPlacePrompt } from './ClaimPlacePrompt';
import { PlaceOwnerPanel } from './PlaceOwnerPanel';
import { PlaceReservationsCalendar } from './PlaceReservationsCalendar';

export const ReservationPanel = ({
  placeId,
  placeName,
}: {
  placeId: string;
  placeName: string;
}) => {
  const { toast } = useToast();
  // Cancelling is confirmed with the same modal the rest of the app uses, not a
  // toast that slides away while the reader is still reading it
  const [isCancelledModalOpen, setIsCancelledModalOpen] = useState(false);

  const { data: profilesResponse, isLoading } = usePlaceReservationProfiles(placeId);

  // Asked only of a signed-in reader: the endpoint 401s without a token, and
  // claiming needs an account anyway
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const router = useRouter();
  const { openSignInWithCallback } = useAuthDialog();

  const reservePath = `/places/${placeId}/reserve`;

  // Signing in lands on the form, so the one press the reader made is the one
  // that gets them there
  const startReservation = () => openSignInWithCallback(() => router.push(reservePath));

  const { data: ownership, isLoading: isLoadingOwnership } = usePlaceOwnership(
    placeId,
    Boolean(session?.user?.id),
  );

  // Only a 404 answered successfully means nobody owns it. A request that
  // failed, or was never made, is "we do not know" — and a place must never be
  // called unclaimed on that.
  const isUnclaimed = ownership?.success === true && !ownership.data;

  // Reading the place as its owner is a different job from reading it as a
  // customer, so the column answers whichever one applies
  const { isManager, isLoading: isLoadingManager } = usePlaceManager(placeId);
  const profiles: PlaceReservationProfile[] = profilesResponse?.data?.results ?? [];

  // A place may hold up to two profiles (restaurant and cinema); only an active
  // one can take bookings
  const profile = profiles.find(
    (entry) => entry.reservationType === 'restaurant_reservation' && entry.status === 'active',
  );

  const { data: bookingsResponse, isLoading: isLoadingReservations } = usePlaceBookingRequests(
    placeId,
    profile?.id,
  );
  const reservations: PlaceBookingRequest[] = bookingsResponse?.data?.results ?? [];

  const { mutate: cancelBooking, isPending: isCancelling } = useCancelPlaceBookingRequest(
    placeId,
    profile?.id,
  );

  const handleCancel = (purchaseId: string) => {
    cancelBooking(purchaseId, {
      onSuccess: () => setIsCancelledModalOpen(true),
      onError: (error: Error) =>
        toast({
          title: 'Could not cancel',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  if (isLoading || isLoadingOwnership || isLoadingManager) {
    return <div className="h-64 animate-pulse rounded-3xl bg-gray-50" />;
  }

  // An owner is not going to book their own table, so the panel offers what
  // they came for instead — the same slot, a different job.
  if (isManager) {
    return (
      <div className="rounded-3xl bg-gray-50 p-5">
        <PlaceOwnerPanel placeId={placeId} placeName={placeName} />
      </div>
    );
  }

  // Nobody has claimed it, so it cannot take bookings and nobody can hold one.
  // Offering a reservation here would only ever reach a disabled button, so the
  // panel offers the way out of the state instead.
  if (isUnclaimed) {
    return (
      <div className="rounded-3xl bg-gray-50 p-5">
        <ClaimPlacePrompt placeId={placeId} placeName={placeName} />
      </div>
    );
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

      {/* Signed out, this asks at the door rather than at the end: the dialog
          opens over the place, and signing in carries straight on to the form.
          Sending them to the form first meant filling the whole thing in
          before the API turned the booking away. */}
      <Button
        asChild={isBookable && isSignedIn}
        variant="gradient"
        disabled={!isBookable}
        title={isBookable ? undefined : 'This place does not take reservations yet'}
        onClick={isBookable && !isSignedIn ? startReservation : undefined}
        className="w-full rounded-full"
      >
        {isBookable && isSignedIn ? (
          <Link href={reservePath}>
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

      <ExperienceCreatedModal
        open={isCancelledModalOpen}
        onOpenChange={setIsCancelledModalOpen}
        title="Reservation Cancelled Successfully"
        description={`Your table at ${placeName} has been released. You can request another one whenever you like.`}
        viewExperienceLabel="Done"
        // Nowhere to go — the reader is already on the place
        onViewExperience={() => setIsCancelledModalOpen(false)}
      />

      {(isLoadingReservations || reservations.length > 0) && (
        <PlaceReservationsCalendar
          reservations={reservations}
          placeName={placeName}
          isLoading={isLoadingReservations}
          isCancelling={isCancelling}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};
