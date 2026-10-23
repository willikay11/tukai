'use client';

import { format, isBefore, isValid, parseISO, startOfDay } from 'date-fns';

import type { useCreateExperienceFlow } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { OpenInMapsLink } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { itineraryDayDate } from '@/types/itinerary';

type Flow = ReturnType<typeof useCreateExperienceFlow>;

interface ReviewViewProps {
  flow: Flow;
  onPublish: () => void;
  isPublishing: boolean;
}

const DAY_ABBREV: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

/** ["sat","sun"] -> "Sat and Sun"; ["mon"] -> "Mon" */
const joinWithAnd = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};

/** ["a title","the date and time"] -> "a title and the date and time"; 3+ -> "a, b and c." */
const joinMissing = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return `${items[0]}.`;
  if (items.length === 2) return `${items[0]} and ${items[1]}.`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}.`;
};

const formatTime12h = (time: string | null | undefined): string => {
  if (!time) return '';
  const [hoursStr, minutes] = time.split(':');
  const hour = parseInt(hoursStr, 10);
  if (!Number.isFinite(hour)) return time;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minutes} ${period}`;
};

const formatDateShort = (date: string | null | undefined): string | null => {
  if (!date) return null;
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, 'EEE d MMM') : null;
};

// Same as above but without the weekday - the recurring date line already
// names the weekdays via "Every Sat and Sun", so the range beside it reads
// "24 Oct to 24 Jan" rather than repeating "Sat 24 Oct to Sat 24 Jan".
const formatDateShortNoWeekday = (date: string | null | undefined): string | null => {
  if (!date) return null;
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, 'd MMM') : null;
};

const isPast = (date: string | null | undefined): boolean => {
  if (!date) return false;
  const parsed = parseISO(date);
  return isValid(parsed) && isBefore(startOfDay(parsed), startOfDay(new Date()));
};

const RvSection = ({
  title,
  note,
  children,
  gap = 'gap-3.5',
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  gap?: string;
}) => (
  <div className={`flex flex-col ${gap}`}>
    <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">
      {title}
      {note && <span className="text-[14.5px] font-normal text-ink-muted"> {note}</span>}
    </h3>
    {children}
  </div>
);

const Divider = () => <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />;

/**
 * The Review screen (tk-rv__*) - a pure, read-only summary of `flow.formData`
 * plus a few derived fields (itinerary day dates, ticket buyer prices). The
 * drawer's shared footer renders Publish/Delete; this only renders the
 * scrollable content above it.
 *
 * Itinerary "flexible dates" is out of scope here too, matching
 * DateTypeStep - FormData only models specific dates, so this always reviews
 * an itinerary as a specific-dates run. Ticket currency isn't modeled on
 * FormData either (no currency field on `formData.tickets`); this hardcodes
 * "KES" to match the only currency the API path actually sends today.
 */
export const ReviewView = ({ flow }: ReviewViewProps) => {
  const { dateType, about, tickets, invite, wallet, itineraryDays } = flow.formData;
  const isItinerary = dateType.experienceType === 'itinerary';
  const isMultiDay = dateType.experienceType === 'multi-day';
  const isPaid = dateType.experiencePricing === 'paid';

  // ---- Missing items (joined "a, b and c.") ----------------------------
  const missing: string[] = [];
  if (!dateType.community) missing.push('a host community');
  if (!about.title?.trim()) missing.push('a title');
  if (!isItinerary && !about.location?.trim() && !about.placeId) {
    missing.push('where the experience takes place');
  }
  if (dateType.experienceType === 'one-time' && !dateType.isRecurring) {
    if (!dateType.date || !dateType.startTime || !dateType.endTime) missing.push('the date and time');
    else if (isPast(dateType.date)) missing.push('dates that are not in the past');
  }
  if (dateType.experienceType === 'one-time' && dateType.isRecurring) {
    const hasSlot = dateType.timeSlots.some((slot) => slot.startTime && slot.endTime);
    if (
      dateType.recurringDays.length === 0 ||
      !dateType.recurrenceStartDate ||
      !dateType.recurrenceEndDate ||
      !hasSlot
    ) {
      missing.push('the recurring days, active period and a time slot');
    }
  }
  if (isMultiDay) {
    if (!dateType.multiDayStartDate || !dateType.multiDayEndDate) missing.push('the date and time');
    else if (isPast(dateType.multiDayStartDate)) missing.push('dates that are not in the past');
  }
  if (isItinerary) {
    if (!dateType.itineraryStartDate || !dateType.itineraryEndDate) {
      missing.push('the period the itinerary runs');
    } else if (isPast(dateType.itineraryStartDate)) {
      missing.push('dates that are not in the past');
    }
    const hasAnyPlace = itineraryDays.some((day) => day.activities.length > 0);
    if (!hasAnyPlace) missing.push('at least one place in the itinerary');
  }
  const hasValidTicket = tickets.items.some((item) =>
    isPaid ? item.name.trim() && item.amount > 0 && item.quantity > 0 : item.name.trim() && item.quantity > 0,
  );
  if (!hasValidTicket) missing.push(isPaid ? 'a ticket with a price and quantity' : 'the number of spaces');
  if (isPaid && !flow.hasSavedWallets && !wallet.selectedWallet && !wallet.phoneNumber?.trim()) {
    missing.push('payout details');
  }

  // ---- Date line ---------------------------------------------------------
  const dateLine = (() => {
    if (dateType.experienceType === 'one-time' && !dateType.isRecurring) {
      if (!dateType.date) return 'Not added yet';
      if (isPast(dateType.date)) return 'The dates are in the past';
      return `${formatDateShort(dateType.date)}, ${formatTime12h(dateType.startTime)} - ${formatTime12h(dateType.endTime)}`;
    }
    if (dateType.experienceType === 'one-time' && dateType.isRecurring) {
      if (dateType.recurringDays.length === 0 || !dateType.recurrenceStartDate) return 'Not added yet';
      const days = joinWithAnd(dateType.recurringDays.map((d) => DAY_ABBREV[d] ?? d));
      const start = formatDateShortNoWeekday(dateType.recurrenceStartDate);
      const end = formatDateShortNoWeekday(dateType.recurrenceEndDate);
      const range = end ? `${start} to ${end}` : start;
      const slotsWithTimes = dateType.timeSlots.filter((s) => s.startTime && s.endTime);
      const timeLabel =
        slotsWithTimes.length > 1
          ? `${slotsWithTimes.length} time slots`
          : slotsWithTimes[0]
            ? `${formatTime12h(slotsWithTimes[0].startTime)} - ${formatTime12h(slotsWithTimes[0].endTime)}`
            : '';
      return `Every ${days}, ${range}${timeLabel ? `, ${timeLabel}` : ''}`;
    }
    if (isMultiDay) {
      if (!dateType.multiDayStartDate || !dateType.multiDayEndDate) return 'Not added yet';
      if (isPast(dateType.multiDayStartDate)) return 'The dates are in the past';
      return `${formatDateShort(dateType.multiDayStartDate)}, ${formatTime12h(dateType.multiDayStartTime)} - ${formatDateShort(dateType.multiDayEndDate)}, ${formatTime12h(dateType.multiDayEndTime)}`;
    }
    if (isItinerary) {
      if (!dateType.itineraryStartDate || !dateType.itineraryEndDate) return 'Not added yet';
      if (isPast(dateType.itineraryStartDate)) return 'The dates are in the past';
      return `${formatDateShort(dateType.itineraryStartDate)} to ${formatDateShort(dateType.itineraryEndDate)}`;
    }
    return 'Not added yet';
  })();

  // ---- Experience type line ----------------------------------------------
  const experienceTypeLine = (() => {
    if (dateType.experienceType === 'one-time' && !dateType.isRecurring) return 'One-time, single day';
    if (dateType.experienceType === 'one-time' && dateType.isRecurring) {
      return dateType.recurringDays.length === 0
        ? 'Recurring, days not chosen yet'
        : `Recurring, every ${joinWithAnd(dateType.recurringDays.map((d) => DAY_ABBREV[d] ?? d))}`;
    }
    if (isMultiDay) {
      return tickets.ticketMode === 'each-day'
        ? 'Multi-day, a ticket for each day'
        : 'Multi-day, one ticket for all days';
    }
    const dayCount = itineraryDays.length;
    const placeCount = itineraryDays.reduce((sum, day) => sum + day.activities.length, 0);
    if (!dateType.itineraryStartDate || !dateType.itineraryEndDate) {
      return `Itinerary, dates not chosen yet${dayCount ? `, ${dayCount} ${dayCount === 1 ? 'day' : 'days'}, ${placeCount} ${placeCount === 1 ? 'place' : 'places'}` : ''}`;
    }
    return `Itinerary with specific dates, ${dayCount} ${dayCount === 1 ? 'day' : 'days'}, ${placeCount} ${placeCount === 1 ? 'place' : 'places'}`;
  })();

  // ---- Location of the experience: maps link ------------------------------
  // `previewExperience.location` only resolves once the Preview *step*
  // (flow.activeStep === 'preview') has been open - the drawer's Review
  // screen is a separate overlay, so this is frequently still the bare
  // `about.location` string with no geocoded city/coordinates. The maps link
  // still works from the location text alone (see mapsHref's query fallback).
  const resolvedLocation = flow.previewExperience?.location;
  const locationAddressLine = [resolvedLocation?.city, resolvedLocation?.country]
    .filter(Boolean)
    .join(', ');
  const locationMapsQuery = [about.location, locationAddressLine].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-7">
      <p className="text-[14.5px] italic text-ink-muted">
        Please go through the details of the experience carefully before you publish.
      </p>

      {missing.length > 0 && (
        <p className="rounded-xl bg-amber-100 px-4 py-3 text-[14.5px] leading-relaxed text-gray-800">
          <strong className="font-bold">Before you publish, add</strong> {joinMissing(missing)}
        </p>
      )}

      {about.photos.length > 0 && (
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 scrollbar-hide">
          {about.photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt=""
              className="h-60 w-60 flex-shrink-0 rounded-xl bg-surface object-cover"
            />
          ))}
        </div>
      )}

      <div className="-mt-1.5 flex flex-col gap-2.5">
        <h2 className="text-[26px] font-bold leading-tight tracking-[-0.5px] text-gray-800">
          {about.title || 'Untitled experience'}
        </h2>
        {about.description && (
          <div
            className="flex flex-col gap-2 text-15 leading-relaxed text-gray-800 [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: about.description }}
          />
        )}
      </div>

      {about.whatsIncluded && (
        <RvSection title="What&rsquo;s included" gap="gap-2.5">
          {about.whatsIncluded
            .split('\n')
            .filter((line) => line.trim())
            .map((line, index) => (
              <div key={index} className="flex items-start gap-2.5 text-15 leading-relaxed text-gray-800">
                <IconComponent
                  iconName="Tick02Icon"
                  size={19}
                  color="#066349"
                  className="mt-px flex-shrink-0"
                />
                <span>{line}</span>
              </div>
            ))}
        </RvSection>
      )}

      {about.whatsNotIncluded && (
        <RvSection title="What&rsquo;s not included" gap="gap-2.5">
          {about.whatsNotIncluded
            .split('\n')
            .filter((line) => line.trim())
            .map((line, index) => (
              <div key={index} className="flex items-start gap-2.5 text-15 leading-relaxed text-gray-800">
                <IconComponent
                  iconName="Cancel01Icon"
                  size={19}
                  color="#E02D3C"
                  className="mt-px flex-shrink-0"
                />
                <span>{line}</span>
              </div>
            ))}
        </RvSection>
      )}

      <Divider />

      <RvSection title="Date of the experience">
        <div className="flex items-center gap-4">
          <span className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-xl bg-surface">
            <IconComponent iconName="Calendar03Icon" size={28} color="#1F2937" />
          </span>
          <span className="text-15 font-semibold text-gray-800">{dateLine}</span>
        </div>
      </RvSection>

      <RvSection title="Is this a free or paid experience?" gap="gap-2">
        <p className="text-15 text-gray-800">{isPaid ? 'Paid experience' : 'Free experience'}</p>
      </RvSection>

      <RvSection title="Visibility" note="(who can see and book it)" gap="gap-2">
        <p className="text-15 text-gray-800">
          {about.visibility === 'private' ? 'Private, only invited people' : 'Public, open to everyone'}
        </p>
      </RvSection>

      <RvSection title="Experience type" gap="gap-2">
        <p className="text-15 text-gray-800">{experienceTypeLine}</p>
      </RvSection>

      {about.categories.length > 0 && (
        <RvSection title="Categories">
          <div className="flex flex-wrap gap-2">
            {about.categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-[14.5px] text-gray-800"
              >
                {category.icon && (
                  <IconComponent iconName={category.icon} size={18} color="#1F2937" className="-ml-0.5" />
                )}
                {category.name}
              </span>
            ))}
          </div>
        </RvSection>
      )}

      <RvSection title={isPaid ? 'Tickets' : 'Spaces'}>
        <div className="-mx-6 flex gap-2.5 overflow-x-auto px-6 scrollbar-hide">
          {tickets.items
            .filter((item) => item.name.trim())
            .map((item) => (
              <div
                key={item.id}
                className="flex min-w-[176px] flex-shrink-0 flex-col gap-0.5 rounded-xl bg-surface px-4 py-3.5"
              >
                <span className="whitespace-nowrap text-[15px] font-semibold text-gray-800">
                  {item.name}
                </span>
                <span className="whitespace-nowrap text-14 text-ink">
                  {item.quantity} {isPaid ? 'tickets' : 'spaces'}
                  {isPaid
                    ? ` · KES ${(item.buyerPrice ?? item.amount).toLocaleString('en-KE', { minimumFractionDigits: 0 })}`
                    : ''}
                </span>
              </div>
            ))}
        </div>
      </RvSection>

      <Divider />

      {isItinerary && (
        <RvSection title="Itinerary" gap="gap-5">
          <div className="flex flex-col">
            {itineraryDays.map((day, index) => {
              const dayDate = itineraryDayDate(dateType.itineraryStartDate, day.dayNumber);
              return (
                <div key={day.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-4">
                  <div className="col-start-1 row-span-2 flex flex-col items-center">
                    <span className="flex h-[30px] items-center justify-center text-gray-800">
                      <IconComponent iconName="Calendar03Icon" size={26} color="#1F2937" />
                    </span>
                    {index < itineraryDays.length - 1 && (
                      <span className="my-2 w-0 flex-1 border-l-[1.5px] border-dashed border-[#B8C2BE]" />
                    )}
                  </div>
                  <h4 className="col-start-2 text-xl font-semibold leading-[30px] tracking-[-0.2px] text-gray-800">
                    Day {day.dayNumber}
                    {dayDate ? `: ${format(dayDate, 'EEE, d MMMM')}` : ''}
                  </h4>
                  <div className="col-start-2 flex flex-col gap-3 py-2.5 pb-8">
                    <span className="text-[16.5px] font-semibold leading-snug text-gray-800">
                      {day.title || 'No title yet'}
                    </span>
                    {day.description && (
                      <p className="whitespace-pre-line text-[15.5px] leading-[1.75] text-ink">
                        {day.description}
                      </p>
                    )}
                    {day.activities.length > 0 ? (
                      <div className="mt-1.5 flex flex-col gap-4">
                        {day.activities.map((activity) => (
                          <button
                            key={activity.id}
                            type="button"
                            className="flex w-full items-center gap-3.5 text-left hover:opacity-85"
                          >
                            {activity.placeImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={activity.placeImageUrl}
                                alt=""
                                className="h-[84px] w-[84px] flex-shrink-0 rounded-xl bg-surface-brand object-cover"
                              />
                            ) : (
                              <span className="flex h-[84px] w-[84px] flex-shrink-0 items-center justify-center rounded-xl bg-surface-brand text-brand">
                                <IconComponent iconName="Location01Icon" size={24} color="#066349" />
                              </span>
                            )}
                            <span className="flex min-w-0 flex-col gap-1.5">
                              <span className="flex items-start gap-2 text-[15.5px] font-semibold leading-snug text-gray-800">
                                <span>{activity.placeName ?? 'Untitled place'}</span>
                                <IconComponent
                                  iconName="ArrowUpRight01Icon"
                                  size={18}
                                  color="#066349"
                                  className="mt-px flex-shrink-0"
                                />
                              </span>
                              <span className="flex flex-wrap items-center gap-2 text-15 text-ink-muted">
                                {dayDate && <span>{format(dayDate, 'dd/MM/yyyy')}</span>}
                                {dayDate && activity.startTime && activity.endTime && (
                                  <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#2F74D0]" />
                                )}
                                {activity.startTime && activity.endTime && (
                                  <span>
                                    {formatTime12h(activity.startTime)} - {formatTime12h(activity.endTime)}
                                  </span>
                                )}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[14.5px] text-ink-muted">No places added yet.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </RvSection>
      )}

      <div className="flex flex-wrap gap-10">
        {!isItinerary && (
          <div className="flex min-w-[260px] flex-1 flex-col gap-3.5">
            <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">
              Location of the experience
            </h3>
            <div className="flex items-center gap-4">
              {about.placeImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={about.placeImageUrl}
                  alt=""
                  className="h-[72px] w-[72px] flex-shrink-0 rounded-xl bg-surface object-cover"
                />
              ) : (
                <span className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-xl bg-surface text-brand">
                  <IconComponent iconName="Location01Icon" size={28} color="#066349" />
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="min-h-[26px] text-15 font-semibold text-gray-800">
                  {about.location || 'Not added yet'}
                </span>
                {locationAddressLine && (
                  <span className="truncate text-[13.5px] leading-[1.4] text-ink-muted">
                    {locationAddressLine}
                  </span>
                )}
                {about.location && (
                  <OpenInMapsLink
                    lat={resolvedLocation?.pointLat}
                    lng={resolvedLocation?.pointLong}
                    query={locationMapsQuery}
                    className="-mb-1.5 mt-[-2px] min-h-11 self-start text-14 font-semibold text-brand"
                  >
                    <IconComponent iconName="Location01Icon" size={17} color="currentColor" />
                    View on Google Maps
                  </OpenInMapsLink>
                )}
              </span>
            </div>
          </div>
        )}

        {about.meetingPoint && (
          <div className="flex min-w-[260px] flex-1 flex-col gap-3.5">
            <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">
              Meeting or pick-up point
            </h3>
            <div className="flex items-center gap-4">
              <span className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-xl bg-surface text-gray-800">
                <IconComponent iconName="Location01Icon" size={28} color="#1F2937" />
              </span>
              <span className="flex min-w-0 flex-wrap items-center gap-2 text-15 text-gray-800">
                <strong className="font-semibold">{about.meetingPoint}</strong>
                {about.meetingTime && (
                  <>
                    <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#B7C3BE]" />
                    <span className="text-ink">{formatTime12h(about.meetingTime)}</span>
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {dateType.community && (
        <RvSection title="Host community">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dateType.community.imageUrl}
              alt=""
              className="h-[72px] w-[72px] flex-shrink-0 rounded-2xl bg-surface-brand object-cover"
            />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-[15.5px] font-medium text-gray-800">
                {dateType.community.name}
              </span>
              <span className="text-14 text-ink-muted">You own this community</span>
            </span>
          </div>
        </RvSection>
      )}

      {invite.invitedGuests.length > 0 && (
        <RvSection title={`Guests (${invite.invitedGuests.length})`}>
          <div className="flex flex-wrap gap-2">
            {invite.invitedGuests.map((guest) => (
              <span
                key={guest.id}
                className="inline-flex h-[52px] items-center gap-2.5 rounded-full bg-surface pl-1.5 pr-[18px]"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-brand text-15 font-semibold text-ink">
                  {guest.email?.[0]?.toUpperCase() ?? '?'}
                </span>
                <span className="max-w-[200px] truncate text-15 text-gray-800">{guest.email}</span>
              </span>
            ))}
          </div>
        </RvSection>
      )}

      {invite.invitedCommunities.length > 0 && (
        <RvSection title={`Invited communities (${invite.invitedCommunities.length})`}>
          <div className="flex flex-wrap gap-2">
            {invite.invitedCommunities.map((community) => (
              <span
                key={community.id}
                className="inline-flex h-[52px] items-center gap-2.5 rounded-full bg-surface pl-1.5 pr-[18px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={community.imageUrl}
                  alt=""
                  className="h-10 w-10 flex-shrink-0 rounded-full bg-surface-brand object-cover"
                />
                <span className="max-w-[200px] truncate text-15 text-gray-800">{community.name}</span>
              </span>
            ))}
          </div>
        </RvSection>
      )}

      {isPaid && (
        <RvSection title="Wallet details" gap="gap-1.5">
          <p className="text-[13.5px] italic text-ink-muted">Only you can see this.</p>
          <p className="text-15 font-semibold text-gray-800">
            {wallet.paymentMethod === 'bank' && wallet.selectedWallet?.walletType === 'bank'
              ? `${wallet.selectedWallet.bankName ?? 'Bank'}, ${wallet.selectedWallet.bankBranch ?? ''}, account ending ${(wallet.selectedWallet.accountNumber ?? '').slice(-4)}`
              : wallet.selectedWallet?.phone
                ? `M-Pesa number: ${wallet.selectedWallet.phone}`
                : wallet.phoneNumber
                  ? `M-Pesa number: ${wallet.phoneNumber}`
                  : 'Not added yet'}
          </p>
        </RvSection>
      )}
    </div>
  );
};
