import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Place } from '@/types/place';

import { PlaceDrawerFooter } from './PlaceDrawerFooter';

let session: { user?: { id: string } } | null = { user: { id: 'u1' } };
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: session }) }));

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const setOpenSignIn = jest.fn();
const openSignInWithCallback = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ setOpenSignIn, openSignInWithCallback }),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

jest.mock('@/app/shared/components/Plans/PlanThisDrawer', () => ({
  PlanThisDrawer: () => null,
}));

const makePlace = (overrides: Partial<Place> = {}) =>
  ({
    id: 'p1',
    title: 'Java House',
    location: { pointLat: -1.28, pointLong: 36.82, city: 'Nairobi' },
    photos: [],
    ...overrides,
  }) as unknown as Place;

describe('PlaceDrawerFooter', () => {
  beforeEach(() => {
    session = { user: { id: 'u1' } };
    push.mockClear();
    openSignInWithCallback.mockClear();
  });

  it('shows Get directions when the place does not take reservations', () => {
    render(<PlaceDrawerFooter place={makePlace()} canReserve={false} onAddReview={jest.fn()} />);

    expect(screen.getByText('Get directions')).toBeInTheDocument();
    expect(screen.queryByText('Make reservation')).not.toBeInTheDocument();
  });

  it('swaps Get directions for Make reservation once a table can be booked', () => {
    render(<PlaceDrawerFooter place={makePlace()} canReserve onAddReview={jest.fn()} />);

    expect(screen.getByText('Make reservation')).toBeInTheDocument();
    expect(screen.queryByText('Get directions')).not.toBeInTheDocument();
  });

  it('sends a signed-in reader straight to the reserve page', () => {
    render(<PlaceDrawerFooter place={makePlace()} canReserve onAddReview={jest.fn()} />);

    fireEvent.click(screen.getByText('Make reservation'));

    expect(push).toHaveBeenCalledWith('/places/p1/reserve');
  });

  it('asks a signed-out reader to sign in first, then carries them on to the reserve page', () => {
    session = null;
    render(<PlaceDrawerFooter place={makePlace()} canReserve onAddReview={jest.fn()} />);

    fireEvent.click(screen.getByText('Make reservation'));

    expect(push).not.toHaveBeenCalled();
    expect(openSignInWithCallback).toHaveBeenCalledTimes(1);

    openSignInWithCallback.mock.calls[0][0]();
    expect(push).toHaveBeenCalledWith('/places/p1/reserve');
  });
});
