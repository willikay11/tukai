import moment from 'moment';

import {
  PlaceAvailabilityException,
  PlaceAvailabilityRule,
  PlaceReservationProfile,
} from '@/types/placeReservation';
import { apiDayOfWeek, slotsForDate } from '@/utils/reservation-slots';

export type BookingConfig = { maxGuests: number };

export type BookingAvailability = {
  rules: PlaceAvailabilityRule[];
  exceptions: PlaceAvailabilityException[];
};

export type BookingDay = {
  offset: number;
  date: moment.Moment;
  iso: string;
  isOpenDay: boolean;
  isBlocked: boolean;
  slots: string[];
};

export const BOOKING_WINDOW_DAYS = 14;

const MIN_LEAD_MINUTES = 15;
const MAX_GUESTS = 30;

export const bookingConfigFor = (profile: PlaceReservationProfile): BookingConfig => ({
  maxGuests:
    profile.seatingCapacity && profile.seatingCapacity > 0
      ? Math.min(profile.seatingCapacity, MAX_GUESTS)
      : MAX_GUESTS,
});

export const startOfSlot = (date: moment.Moment, time: string): moment.Moment => {
  const [hours, minutes] = time.split(':').map(Number);
  return date
    .clone()
    .startOf('day')
    .add(hours * 60 + minutes, 'minutes');
};

export const formatSlotTime = (time: string): string => moment(time, 'HH:mm').format('h:mm A');

export const formatAnswerBy = (respondBy: string): string =>
  moment(respondBy).format('ddd D MMM, h:mm A');

const hasWeeklyHours = (availability: BookingAvailability, date: moment.Moment): boolean =>
  availability.rules.some((rule) => rule.dayOfWeek === apiDayOfWeek(date.toDate()));

export const buildBookingDays = (availability: BookingAvailability, now: Date): BookingDay[] => {
  const earliestStart = moment(now).add(MIN_LEAD_MINUTES, 'minutes');

  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, offset) => {
    const date = moment(now).startOf('day').add(offset, 'days');
    const iso = date.format('YYYY-MM-DD');
    const isBlocked = availability.exceptions.some(
      (exception) => exception.date === iso && exception.isClosed,
    );
    const daySlots = slotsForDate(date.toDate(), availability.rules, availability.exceptions);

    return {
      offset,
      date,
      iso,
      isOpenDay: daySlots.length > 0 || hasWeeklyHours(availability, date),
      isBlocked,
      slots: daySlots.filter((slot) => startOfSlot(date, slot).isAfter(earliestStart)),
    };
  });
};

export const dayChipLabel = (day: BookingDay): string => {
  if (day.offset === 0) return 'Today';
  if (day.offset === 1) return 'Tomorrow';
  return day.date.format('ddd');
};

export const dayChipNote = (day: BookingDay): string => {
  if (day.isBlocked) return 'Unavailable';
  if (!day.isOpenDay) return 'Closed';
  if (day.slots.length === 0) return 'No times left';
  return day.date.format('D MMM');
};

export const blockedRanges = (days: BookingDay[]): string[] =>
  days.filter((day) => day.isBlocked).map((day) => day.date.format('ddd D MMM'));
