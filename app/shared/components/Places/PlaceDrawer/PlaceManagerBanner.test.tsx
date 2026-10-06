import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceReservationProfile } from '@/types/placeReservation';

import { PlaceManagerBanner } from './PlaceManagerBanner';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const profile = {
  id: 'rp1',
  reservationType: 'restaurant_reservation',
  status: 'active',
} as PlaceReservationProfile;

describe('PlaceManagerBanner', () => {
  it('offers to set up reservations when there is no profile yet', () => {
    render(<PlaceManagerBanner rules={[]} onOpenSettings={jest.fn()} />);

    expect(screen.getByRole('button', { name: /Set up reservations/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reservation settings/ })).not.toBeInTheDocument();
  });

  it('offers reservation settings once a profile exists', () => {
    render(<PlaceManagerBanner profile={profile} rules={[]} onOpenSettings={jest.fn()} />);

    expect(screen.getByRole('button', { name: /Reservation settings/ })).toBeInTheDocument();
  });

  it('opens settings when the button is pressed', () => {
    const onOpenSettings = jest.fn();
    render(<PlaceManagerBanner profile={profile} rules={[]} onOpenSettings={onOpenSettings} />);

    fireEvent.click(screen.getByRole('button', { name: /Reservation settings/ }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('names the community that holds the place', () => {
    render(
      <PlaceManagerBanner communityName="Nairobi Makers" rules={[]} onOpenSettings={jest.fn()} />,
    );

    expect(screen.getByText('You manage this place through Nairobi Makers')).toBeInTheDocument();
  });
});
