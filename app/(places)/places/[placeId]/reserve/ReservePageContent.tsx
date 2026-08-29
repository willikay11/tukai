'use client';

import { useState } from 'react';

import moment from 'moment';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { ExperienceCreatedModal } from '@/app/(experiences)/experiences/create/components/ExperienceCreatedModal';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { SectionShell } from '@/app/shared/components/Sections';
import {
  useCreatePlaceBookingRequest,
  usePlaceAvailability,
  usePlaceReservationProfiles,
} from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InviteMembers, InvitedMember } from '@/components/ui/invite-members';
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
import { zodErrorsToMap } from '@/utils/zod-errors';

import { DateTimePicker } from './components/DateTimePicker';
import { ReservationSummary } from './components/ReservationSummary';
import { RESERVATION_FIELD_SECTIONS, reservationSchema } from './schema';

const NAME_PRESETS = [
  'Birthday Dinner',
  'Date Night',
  'Family Lunch',
  'Team Catch-up',
  'Celebration',
];

export const ReservePageContent = ({ place }: { place: Place }) => {
  const { toast } = useToast();

  const [reservationName, setReservationName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [message, setMessage] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);
  // Raised by the request button rather than as the reader types: nothing is
  // marked wrong until they say they are done
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Held open until the reader dismisses it, rather than navigating out from
  // under them the moment the request lands
  const [isRequestedModalOpen, setIsRequestedModalOpen] = useState(false);

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

  // Clears one field's error the moment it is answered, so a corrected field
  // stops shouting before the next attempt
  const clearError = (field: string) =>
    setErrors((current) => {
      if (!current[field]) return current;

      return Object.fromEntries(Object.entries(current).filter(([key]) => key !== field));
    });

  const handleSubmit = () => {
    if (!profile) return;

    const result = reservationSchema.safeParse({
      name: reservationName,
      date: selectedDate ?? undefined,
      time: selectedTime ?? undefined,
      partySize,
      message,
      invitedEmails: invitedMembers.map((member) => member.email ?? ''),
    });

    if (!result.success) {
      const fieldErrors = zodErrorsToMap(result.error);
      setErrors(fieldErrors);

      // Take the reader to the first thing that needs them, in the order the
      // form asks for it
      const firstField = Object.keys(RESERVATION_FIELD_SECTIONS).find(
        (field) => fieldErrors[field],
      );
      if (firstField) {
        document
          .getElementById(RESERVATION_FIELD_SECTIONS[firstField])
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      return;
    }

    setErrors({});

    requestBooking(
      {
        // `result.data` is the parsed form, so the date is a real Date and the
        // required fields are known present
        requestedDate: moment(result.data.date).format('YYYY-MM-DD'),
        requestedTime: result.data.time,
        partySize: result.data.partySize,
        // The serializer has no field for what the reader called the booking,
        // so it rides in special_requests, where the venue sees it
        specialRequests: result.data.name,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => setIsRequestedModalOpen(true),
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
      <PageContainer variant="detail" className="py-6">
        <div className="h-96 animate-pulse rounded-3xl bg-gray-100" />
      </PageContainer>
    );
  }

  // Reaching this page for a place that never opened reservations
  if (!profile) {
    return (
      <PageContainer variant="detail" className="py-6">
        <BackToExplore href={`/places/${place.id}`} label={`Back to ${place.title}`} />
        <p className="py-16 text-center text-sm text-gray-400">
          {place.title} has not opened up reservations yet.
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="detail" className="py-6">
      <BackToExplore href={`/places/${place.id}`} label={`Back to ${place.title}`} />

      <div className="mt-4">
        <h1 className="text-3xl font-bold text-gray-900">Make a reservation</h1>
        <p className="mt-2 text-sm text-gray-500">
          Fill in the details below - everything updates live in your summary, then confirm.
        </p>
      </div>

      {/* The same modal the create-experience flow ends on */}
      <ExperienceCreatedModal
        open={isRequestedModalOpen}
        onOpenChange={setIsRequestedModalOpen}
        href={`/places/${place.id}`}
        title="Reservation Requested Successfully!"
        description={`${place.title} has your request and will confirm your table shortly. You'll hear from us as soon as they respond.`}
        // No onViewExperience: given only an href the modal renders a real
        // link, which middle-clicks and opens in a new tab like any other
        viewExperienceLabel={`View ${place.title}`}
      />

      <div className="mt-6 grid grid-cols-12 gap-8">
        <div className="col-span-12 space-y-10 lg:col-span-7">
          <SectionShell
            id="reserve-name"
            title="Name your reservation"
            subtitle="Give it a name so everyone knows what it's for."
          >
            <Input
              value={reservationName}
              onChange={(event) => {
                setReservationName(event.target.value);
                clearError('name');
              }}
              placeholder="e.g. Valentine's Dinner Date"
              aria-invalid={Boolean(errors.name)}
              className="text-[14px] leading-[18px]"
              containerClassName={cn(errors.name && 'border-red-500')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {NAME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setReservationName(preset);
                    clearError('name');
                  }}
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
          </SectionShell>

          <SectionShell
            id="reserve-when"
            title="Date & time"
            subtitle={`Pick a day and a time slot at ${place.title}.`}
          >
            <DateTimePicker
              rules={rules}
              exceptions={exceptions}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
                clearError('date');
              }}
              onSelectTime={(time) => {
                setSelectedTime(time);
                clearError('time');
              }}
            />
            {(errors.date || errors.time) && (
              <p className="mt-2 text-xs text-red-500">{errors.date ?? errors.time}</p>
            )}
          </SectionShell>

          <SectionShell id="reserve-guests" title="Guests" subtitle="How many people are coming?">
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
          </SectionShell>

          <SectionShell
            id="reserve-message"
            title="Add a message (Optional)"
            subtitle="Anything the place should know: a celebration, allergies, a seating preference."
          >
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a short note to the place..."
              rows={4}
            />
          </SectionShell>

          <SectionShell
            id="reserve-invites"
            title="Invite people (Optional)"
            subtitle="Bring people along by email. They'll get the details and can RSVP."
          >
            {/* The create-experience guest field: several addresses at once,
                separated by commas */}
            <InviteMembers
              invitedMembers={invitedMembers}
              onMembersChange={setInvitedMembers}
              placeholder="Add guest emails, separated by commas"
            />
          </SectionShell>
        </div>

        <div className="col-span-12 lg:col-span-5">
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
