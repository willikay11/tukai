'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import {
  useCreatePlaceBookingRequest,
  usePlaceAvailability,
  usePlaceReservationProfiles,
} from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';
import {
  PlaceAvailabilityException,
  PlaceAvailabilityRule,
  PlaceReservationProfile,
} from '@/types/placeReservation';

import { DateTimePicker } from './components/DateTimePicker';
import { InvitePeople } from './components/InvitePeople';
import { ReservationSummary } from './components/ReservationSummary';
import { ReserveCard } from './components/ReserveCard';

const NAME_PRESETS = [
  'Birthday Dinner',
  'Date Night',
  'Family Lunch',
  'Team Catch-up',
  'Celebration',
];

export const ReservePageContent = ({ place }: { place: Place }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [reservationName, setReservationName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [message, setMessage] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  const { data: profilesResponse, isLoading: isLoadingProfile } = usePlaceReservationProfiles(
    place.id,
  );
  const profiles: PlaceReservationProfile[] = profilesResponse?.data?.results ?? [];
  const profile = profiles.find(
    (entry) => entry.reservationType === 'restaurant_reservation' && entry.status === 'active',
  );

  const { data: availability } = usePlaceAvailability(place.id, profile?.id);
  const rules: PlaceAvailabilityRule[] = availability?.data?.rules ?? [];
  const exceptions: PlaceAvailabilityException[] = availability?.data?.exceptions ?? [];

  const { mutate: requestBooking, isPending } = useCreatePlaceBookingRequest(place.id, profile?.id);

  const coverPhoto =
    place.photos?.find((photo: Photo) => photo.isCover)?.photo || place.photos?.[0]?.photo;
  const category = place.categories?.find(
    (entry: PlaceCategory) => entry.group === 'interests',
  )?.name;
  const placeMeta = [category, place.location?.city].filter(Boolean).join(' · ');

  const maxParty =
    profile?.seatingCapacity && profile.seatingCapacity > 0
      ? Math.min(profile.seatingCapacity, 30)
      : 30;

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !profile) return;

    requestBooking(
      {
        ticketPurchases: [
          {
            quantity: 1,
            partySize,
            // The API takes one free-text field, so the reservation's name and
            // the reader's note travel together
            specialRequests:
              [reservationName.trim(), message.trim()].filter(Boolean).join(' — ') || undefined,
          },
        ],
      },
      {
        onSuccess: () => {
          toast({
            title: 'Reservation requested',
            description: `${place.title} will confirm your table shortly`,
            variant: 'success',
          });
          router.push(`/places/${place.id}`);
        },
        onError: (error: Error) =>
          toast({
            title: 'Could not request this reservation',
            description: error.message,
            variant: 'destructive',
          }),
      },
    );
  };

  if (isLoadingProfile) {
    return (
      <PageContainer className="py-6">
        <div className="h-96 animate-pulse rounded-3xl bg-gray-100" />
      </PageContainer>
    );
  }

  // Reaching this page for a place that never opened reservations
  if (!profile) {
    return (
      <PageContainer className="py-6">
        <BackToExplore href={`/places/${place.id}`} label={`Back to ${place.title}`} />
        <p className="py-16 text-center text-sm text-gray-400">
          {place.title} has not opened up reservations yet.
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <BackToExplore href={`/places/${place.id}`} label={`Back to ${place.title}`} />

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Make a reservation</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-lime">
            <IconComponent iconName="SparklesIcon" size={14} color="currentColor" />A type of
            experience
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Fill in the details below - everything updates live in your summary, then confirm.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <ReserveCard
            title="Name your reservation"
            optional
            description="Give it a name so everyone knows what it's for."
          >
            <Input
              value={reservationName}
              onChange={(event) => setReservationName(event.target.value)}
              placeholder="e.g. Valentine's Dinner Date"
              className="text-[14px] leading-[18px]"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {NAME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReservationName(preset)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm transition-colors',
                    reservationName === preset
                      ? 'bg-green-200 font-medium text-primary'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </ReserveCard>

          <ReserveCard
            title="Date & time"
            description={`Pick a day and a time slot at ${place.title}.`}
          >
            <DateTimePicker
              rules={rules}
              exceptions={exceptions}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
              onSelectTime={setSelectedTime}
            />
          </ReserveCard>

          <ReserveCard title="Guests" description="How many people are coming?">
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Party size</p>
                <p className="text-sm text-gray-400">Guests at the table</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 rounded-full p-0"
                  onClick={() => setPartySize((size) => Math.max(1, size - 1))}
                  disabled={partySize <= 1}
                  aria-label="Fewer guests"
                >
                  <IconComponent iconName="MinusSignIcon" size={16} color="currentColor" />
                </Button>
                <span className="w-6 text-center text-lg font-bold text-gray-900">{partySize}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 rounded-full p-0"
                  onClick={() => setPartySize((size) => Math.min(maxParty, size + 1))}
                  disabled={partySize >= maxParty}
                  aria-label="More guests"
                >
                  <IconComponent iconName="PlusSignIcon" size={16} color="currentColor" />
                </Button>
              </div>
            </div>
          </ReserveCard>

          <ReserveCard
            title="Add a message"
            optional
            description="Anything the place should know - a celebration, allergies, a seating preference."
          >
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a short note to the place..."
              rows={4}
            />
          </ReserveCard>

          <ReserveCard
            title="Invite people"
            optional
            description="Bring people along - they'll get the details and can RSVP."
          >
            <InvitePeople
              invitedEmails={invitedEmails}
              onInvite={(email) =>
                setInvitedEmails((current) =>
                  current.includes(email) ? current : [...current, email],
                )
              }
              onRemove={(email) =>
                setInvitedEmails((current) => current.filter((entry) => entry !== email))
              }
            />
          </ReserveCard>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <ReservationSummary
              placeName={place.title}
              placeMeta={placeMeta}
              coverPhoto={coverPhoto}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              partySize={partySize}
              isSubmitting={isPending}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
