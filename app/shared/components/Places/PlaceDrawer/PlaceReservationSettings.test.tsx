import React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { Place } from '@/types/place';
import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';

import { PlaceReservationSettings } from './PlaceReservationSettings';

const save = jest.fn();
const toast = jest.fn();

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useSaveReservationSettings: () => ({ mutate: save, isPending: false }),
}));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
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

const place = { id: 'p1', title: 'Kraftory Biergarten', location: { city: 'Nairobi' } } as Place;

const profile = (extra: Partial<PlaceReservationProfile> = {}): PlaceReservationProfile => ({
  id: 'prof-1',
  place: 'p1',
  reservationType: 'restaurant_reservation',
  status: 'active',
  seatingCapacity: 40,
  ...extra,
});

const rule = (dayOfWeek: number): PlaceAvailabilityRule => ({
  id: `rule-${dayOfWeek}`,
  reservationProfile: 'prof-1',
  dayOfWeek,
  openTime: '11:00:00',
  closeTime: '23:00:00',
  slotIntervalMinutes: 30,
});

const monAndSat = [rule(0), rule(5)];

const renderSettings = (
  options: { profile?: PlaceReservationProfile; rules?: PlaceAvailabilityRule[] } = {},
) => {
  const onClose = jest.fn();
  render(
    <PlaceReservationSettings
      place={place}
      profile={'profile' in options ? options.profile : profile()}
      rules={options.rules ?? monAndSat}
      onClose={onClose}
    />,
  );
  return { onClose };
};

const seating = () => screen.getByLabelText('Total seating capacity');

describe('PlaceReservationSettings', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('a place that already takes reservations', () => {
    it('opens on what is set up, read-only', () => {
      renderSettings();

      expect(
        screen.getByText('Live. Guests can send reservation requests to Kraftory Biergarten.'),
      ).toBeInTheDocument();
      expect(screen.getByText('40 guests')).toBeInTheDocument();
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Saturday')).toBeInTheDocument();
      expect(screen.queryByLabelText('Total seating capacity')).not.toBeInTheDocument();
    });

    it('reads out the type, hours and buffer the way the design does', () => {
      renderSettings();

      expect(screen.getByText('Free reservation')).toBeInTheDocument();
      expect(screen.getByText('Guests pay nothing to book')).toBeInTheDocument();
      expect(screen.getByText('11:00 AM - 11:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Buffer between bookings')).toBeInTheDocument();
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
    });

    it('says a free reservation needs no wallet details', () => {
      renderSettings();

      expect(screen.getByText('Wallet details')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Not needed for free reservations. You add one if you switch to a deposit or entry fees.',
        ),
      ).toBeInTheDocument();
    });

    it('says there is no buffer when the hours carry no interval', () => {
      renderSettings({ rules: [{ ...rule(0), slotIntervalMinutes: 0 }] });

      expect(screen.getByText('No buffer')).toBeInTheDocument();
    });

    it('lists the steps in edit, with the wallet step switched off for a free reservation', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));

      expect(screen.getByRole('tab', { name: 'Reservation type' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Wallet details' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('sizes the pills and fields to the design in edit', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));

      const picked = screen.getByRole('button', { name: 'Monday' });
      const resting = screen.getByRole('button', { name: 'Tuesday' });
      expect(picked).toHaveClass('h-12', 'px-5', 'text-[14.5px]', 'font-semibold', 'text-white');
      expect(resting).toHaveClass('h-12', 'px-5', 'text-[14.5px]', 'bg-surface');
      expect(screen.getByRole('radio', { name: 'Free reservation' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(seating().parentElement).toHaveClass('h-14', 'rounded-xl');
    });

    it('shows the opening hours as they are typed', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));

      fireEvent.change(screen.getByLabelText('Closing time'), { target: { value: '22:30' } });

      expect(screen.getByText('11:00 AM - 10:30 PM')).toBeInTheDocument();
    });

    it('offers to edit, and nothing to save yet', () => {
      renderSettings();

      expect(screen.getByRole('button', { name: 'Edit settings' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    });

    it('turns into the form, filled in with what is set up, when Edit settings is pressed', () => {
      renderSettings();

      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));

      expect(seating()).toHaveValue(40);
      expect(screen.getByLabelText('Buffer between bookings in minutes')).toHaveValue(30);
      expect(screen.getByRole('button', { name: 'Monday' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: 'Tuesday' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    });

    it('goes back to the summary on Cancel, without closing the drawer or keeping the edit', () => {
      const { onClose } = renderSettings();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));
      fireEvent.change(seating(), { target: { value: '99' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Edit settings' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));
      expect(seating()).toHaveValue(40);
    });

    it('saves what was changed, against the profile and the hours it already has', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));
      fireEvent.change(seating(), { target: { value: '60' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      const [draft] = save.mock.calls[0];
      expect(draft.profileId).toBe('prof-1');
      expect(draft.profile).toEqual({
        reservationType: 'restaurant_reservation',
        seatingCapacity: 60,
      });
      expect(draft.rules).toEqual([
        { dayOfWeek: 0, openTime: '11:00', closeTime: '23:00', slotIntervalMinutes: 30 },
        { dayOfWeek: 5, openTime: '11:00', closeTime: '23:00', slotIntervalMinutes: 30 },
      ]);
      expect(draft.existingRules).toEqual(monAndSat);
      expect(draft.isActive).toBe(true);
    });

    it('tells the API a draft profile is not yet live, so saving opens it', () => {
      renderSettings({ profile: profile({ status: 'draft' }) });
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(save.mock.calls[0][0].isActive).toBe(false);
    });

    it('confirms the save and returns to the summary', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));
      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      act(() => save.mock.calls[0][1].onSuccess());

      expect(toast).toHaveBeenCalledWith({
        title: 'Settings saved',
        description:
          'Kraftory Biergarten takes reservation requests on the days and hours you set.',
        variant: 'success',
      });
      expect(screen.getByRole('button', { name: 'Edit settings' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    });

    it('says why and stays on the form when the API refuses', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));
      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      save.mock.calls[0][1].onError(new Error('Only the owning community can do this.'));

      expect(toast).toHaveBeenCalledWith({
        title: 'Could not save',
        description: 'Only the owning community can do this.',
        variant: 'destructive',
      });
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    });

    it('will not save a seating capacity of zero', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));
      fireEvent.change(seating(), { target: { value: '0' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(save).not.toHaveBeenCalled();
      expect(screen.getByText('Enter a number greater than zero')).toBeInTheDocument();
    });

    it('will not save with every day switched off', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('button', { name: 'Edit settings' }));
      fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
      fireEvent.click(screen.getByRole('button', { name: 'Saturday' }));

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(save).not.toHaveBeenCalled();
      expect(screen.getByText('Pick at least one day')).toBeInTheDocument();
    });
  });

  describe('a place that does not take reservations yet', () => {
    it('opens straight on the form', () => {
      renderSettings({ profile: undefined, rules: [] });

      expect(screen.getByText('Kraftory Biergarten, Nairobi')).toBeInTheDocument();
      expect(seating()).toHaveValue(null);
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Edit settings' })).not.toBeInTheDocument();
    });

    it('closes the view on Cancel, since there is no summary to go back to', () => {
      const { onClose } = renderSettings({ profile: undefined, rules: [] });

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('will not save without opening hours', () => {
      renderSettings({ profile: undefined, rules: [] });
      fireEvent.change(seating(), { target: { value: '30' } });
      fireEvent.click(screen.getByRole('button', { name: 'Monday' }));

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(save).not.toHaveBeenCalled();
      expect(screen.getByText('Set an opening time')).toBeInTheDocument();
    });

    it('creates the profile, with no id and not yet live, when it saves', () => {
      renderSettings({ profile: undefined, rules: [] });
      fireEvent.change(seating(), { target: { value: '30' } });
      fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
      fireEvent.change(screen.getByLabelText('Opening time'), { target: { value: '11:00' } });
      fireEvent.change(screen.getByLabelText('Closing time'), { target: { value: '22:00' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      const [draft] = save.mock.calls[0];
      expect(draft.profileId).toBeUndefined();
      expect(draft.profile).toEqual({
        reservationType: 'restaurant_reservation',
        seatingCapacity: 30,
      });
      expect(draft.rules).toEqual([{ dayOfWeek: 0, openTime: '11:00', closeTime: '22:00' }]);
      expect(draft.existingRules).toEqual([]);
      expect(draft.isActive).toBe(false);
    });

    it("offers the place's own photos for the profile to go live with", () => {
      const photos = [{ id: 'ph1', mediaType: 'photo' as const, photoUrl: 'https://cdn/ph1.jpg' }];
      render(
        <PlaceReservationSettings
          place={{ ...place, photos } as Place}
          profile={undefined}
          rules={[]}
          onClose={jest.fn()}
        />,
      );
      fireEvent.change(seating(), { target: { value: '30' } });
      fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
      fireEvent.change(screen.getByLabelText('Opening time'), { target: { value: '11:00' } });
      fireEvent.change(screen.getByLabelText('Closing time'), { target: { value: '22:00' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(save.mock.calls[0][0].placePhotos).toEqual(photos);
    });
  });
});
