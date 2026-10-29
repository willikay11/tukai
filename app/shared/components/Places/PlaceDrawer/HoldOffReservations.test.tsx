import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import {
  PlaceAvailabilityException,
  PlaceAvailabilityRule,
  PlaceReservationProfile,
} from '@/types/placeReservation';

import { HoldOffReservations } from './HoldOffReservations';
import { addDays, dayKey } from './week-strip';

const holdOff = jest.fn();
const resume = jest.fn();
const toast = jest.fn();
const useHoldOffReservations = jest.fn();
const useResumeReservations = jest.fn();

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useHoldOffReservations: (...args: unknown[]) => useHoldOffReservations(...args),
  useResumeReservations: (...args: unknown[]) => useResumeReservations(...args),
}));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));
jest.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => (
    <input
      aria-label={placeholder}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));
jest.mock('@/components/ui/time-picker', () => ({
  ...jest.requireActual('@/components/ui/time-picker'),
  TimePicker: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => (
    <input
      aria-label={placeholder}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const profile = { id: 'prof-1', status: 'active' } as PlaceReservationProfile;

const everyDay: PlaceAvailabilityRule[] = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
  id: `rule-${dayOfWeek}`,
  reservationProfile: 'prof-1',
  dayOfWeek,
  openTime: '11:00',
  closeTime: '22:00',
  slotIntervalMinutes: 30,
}));

const inDays = (days: number) => dayKey(addDays(new Date(), days));

const held = (
  id: string,
  date: string,
  extra: Partial<PlaceAvailabilityException> = {},
): PlaceAvailabilityException => ({
  id,
  reservationProfile: 'prof-1',
  date,
  isClosed: true,
  ...extra,
});

const renderHoldOff = (exceptions: PlaceAvailabilityException[] = []) =>
  render(
    <HoldOffReservations placeId="p1" profile={profile} rules={everyDay} exceptions={exceptions} />,
  );

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const holdOffButton = () => screen.getByRole('button', { name: 'Hold off reservations' });

describe('HoldOffReservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useHoldOffReservations.mockReturnValue({ mutate: holdOff, isPending: false });
    useResumeReservations.mockReturnValue({ mutate: resume });
  });

  it('holds off against this place’s profile', () => {
    renderHoldOff();

    expect(useHoldOffReservations).toHaveBeenCalledWith('p1', 'prof-1');
    expect(useResumeReservations).toHaveBeenCalledWith('p1', 'prof-1');
  });

  it('starts on a few hours and cannot hold off until a date is picked', () => {
    renderHoldOff();

    expect(screen.getByLabelText('Select date')).toBeInTheDocument();
    expect(holdOffButton()).toBeDisabled();
  });

  describe('a few hours', () => {
    it('holds off the whole day when no times are given', () => {
      renderHoldOff();
      type('Select date', inDays(3));

      fireEvent.click(holdOffButton());

      expect(holdOff).toHaveBeenCalledWith(
        { replacedExceptionIds: [], exceptions: [{ date: inDays(3), isClosed: true }] },
        expect.any(Object),
      );
    });

    it('holds off from opening and leaves the rest of the day open', () => {
      renderHoldOff();
      type('Select date', inDays(3));
      type('Start time', '11:00');
      type('End time', '14:00');

      fireEvent.click(holdOffButton());

      expect(holdOff.mock.calls[0][0].exceptions).toEqual([
        { date: inDays(3), isClosed: false, openTime: '14:00', closeTime: '22:00' },
      ]);
    });

    it('refuses a hold in the middle of the day, naming the hours the day runs', () => {
      renderHoldOff();
      type('Select date', inDays(3));
      type('Start time', '14:00');
      type('End time', '16:00');

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Reservations run 11:00 AM - 10:00 PM on this date.',
      );
      expect(holdOffButton()).toBeDisabled();
    });

    it('wants both times or neither', () => {
      renderHoldOff();
      type('Select date', inDays(3));
      type('Start time', '12:00');

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Set both a start and end time, or leave both empty.',
      );
      expect(holdOffButton()).toBeDisabled();
    });

    it('replaces the exception the date already has', () => {
      renderHoldOff([held('old', inDays(3)), held('elsewhere', inDays(9))]);
      type('Select date', inDays(3));

      fireEvent.click(holdOffButton());

      expect(holdOff.mock.calls[0][0].replacedExceptionIds).toEqual(['old']);
    });
  });

  describe('multiple days', () => {
    const openRange = () => fireEvent.click(screen.getByRole('button', { name: 'Multiple days' }));

    it('holds off every day from the first to the last', () => {
      renderHoldOff();
      openRange();
      type('Start date', inDays(2));
      type('End date', inDays(4));

      fireEvent.click(holdOffButton());

      expect(holdOff.mock.calls[0][0].exceptions).toEqual([
        { date: inDays(2), isClosed: true },
        { date: inDays(3), isClosed: true },
        { date: inDays(4), isClosed: true },
      ]);
    });

    it('cannot hold off until both ends are picked', () => {
      renderHoldOff();
      openRange();
      type('Start date', inDays(2));

      expect(holdOffButton()).toBeDisabled();
    });

    it('refuses a last day before the first', () => {
      renderHoldOff();
      openRange();
      type('Start date', inDays(4));
      type('End date', inDays(2));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'End date must be on or after the start date.',
      );
      expect(holdOffButton()).toBeDisabled();
    });
  });

  describe('once sent', () => {
    it('says guests cannot book those dates, and that existing bookings stay', () => {
      renderHoldOff();
      type('Select date', inDays(3));
      fireEvent.click(holdOffButton());

      holdOff.mock.calls[0][1].onSuccess();

      expect(toast).toHaveBeenCalledWith({
        title: 'Reservations held off',
        description: 'Guests cannot book these dates. Existing bookings stay.',
        variant: 'success',
      });
    });

    it('says why when the API refuses', () => {
      renderHoldOff();
      type('Select date', inDays(3));
      fireEvent.click(holdOffButton());

      holdOff.mock.calls[0][1].onError(new Error('Only a manager can do this.'));

      expect(toast).toHaveBeenCalledWith({
        title: 'Could not hold off these dates',
        description: 'Only a manager can do this.',
        variant: 'destructive',
      });
    });
  });

  describe('dates held off', () => {
    it('says so when there are none', () => {
      renderHoldOff();

      expect(screen.getByText(/Nothing is held off/)).toBeInTheDocument();
    });

    it('lists upcoming dates, closed or part open, and leaves out the past', () => {
      renderHoldOff([
        held('a', inDays(2)),
        held('b', inDays(5), { isClosed: false, openTime: '14:00', closeTime: '22:00' }),
        held('past', inDays(-3)),
      ]);

      expect(screen.getByText('Closed all day')).toBeInTheDocument();
      expect(screen.getByText('Open 02:00 PM - 10:00 PM')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /^Resume/ })).toHaveLength(2);
    });

    it('resumes a date', () => {
      renderHoldOff([held('a', inDays(2))]);

      fireEvent.click(screen.getByRole('button', { name: /^Resume/ }));

      expect(resume).toHaveBeenCalledWith('a', expect.any(Object));
      resume.mock.calls[0][1].onSuccess();
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Reservations resumed', variant: 'success' }),
      );
    });

    it('says why when a date cannot be resumed', () => {
      renderHoldOff([held('a', inDays(2))]);
      fireEvent.click(screen.getByRole('button', { name: /^Resume/ }));

      resume.mock.calls[0][1].onError(new Error('Not allowed.'));

      expect(toast).toHaveBeenCalledWith({
        title: 'Could not resume',
        description: 'Not allowed.',
        variant: 'destructive',
      });
    });
  });
});
