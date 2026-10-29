import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Status } from '@/enums/status';
import { Place } from '@/types/place';

import { PlaceDrawerFooter } from './PlaceDrawerFooter';

const session = { data: { user: { id: 'u1' } } as { user: { id: string } } | null };
jest.mock('next-auth/react', () => ({ useSession: () => session }));
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ needAuth }),
}));
const needAuth = jest.fn();
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/shared/components/Plans/PlanThisDrawer', () => ({
  PlanThisDrawer: () => null,
}));

const place = (extra: Partial<Place> = {}) =>
  ({
    id: 'p1',
    title: 'Kazuri Beads Workshop',
    status: Status.Published,
    photos: [],
    location: { city: 'Nairobi', pointLat: -1.2, pointLong: 36.8 },
    ...extra,
  }) as Place;

describe('PlaceDrawerFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    session.data = { user: { id: 'u1' } };
  });

  describe('for someone viewing the place', () => {
    it('offers a review, directions and the plan', () => {
      render(<PlaceDrawerFooter place={place()} onAddReview={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Add review' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Get directions' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Plan this' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Edit details' })).not.toBeInTheDocument();
    });

    it('offers Book a table in place of directions where the place takes bookings', () => {
      render(<PlaceDrawerFooter place={place()} onAddReview={jest.fn()} onBook={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Book a table' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Get directions' })).not.toBeInTheDocument();
    });

    it('books once the reader is signed in', () => {
      const onBook = jest.fn();
      render(<PlaceDrawerFooter place={place()} onAddReview={jest.fn()} onBook={onBook} />);

      fireEvent.click(screen.getByRole('button', { name: 'Book a table' }));

      expect(onBook).toHaveBeenCalledTimes(1);
    });

    it('asks a signed-out reader to sign in before booking', () => {
      session.data = null;
      const onBook = jest.fn();
      render(<PlaceDrawerFooter place={place()} onAddReview={jest.fn()} onBook={onBook} />);

      fireEvent.click(screen.getByRole('button', { name: 'Book a table' }));

      expect(onBook).not.toHaveBeenCalled();
      expect(needAuth).toHaveBeenCalledWith('reserve', onBook);
    });
  });

  describe('for the people who run the place', () => {
    const renderManager = (extra: Partial<Place> = {}, onNavigate = jest.fn()) => {
      render(
        <PlaceDrawerFooter
          place={place(extra)}
          onAddReview={jest.fn()}
          onBook={jest.fn()}
          isManager
          onNavigate={onNavigate}
        />,
      );
      return { onNavigate };
    };

    it('offers Edit details and New experience, and nothing for a guest', () => {
      renderManager();

      expect(screen.getByRole('link', { name: 'Edit details' })).toHaveAttribute(
        'href',
        '/control-center/places/p1/edit',
      );
      expect(screen.getByRole('link', { name: 'New experience' })).toHaveAttribute(
        'href',
        '/experiences/create',
      );
      expect(screen.queryByRole('button', { name: 'Add review' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Book a table' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Plan this' })).not.toBeInTheDocument();
    });

    it('steps the drawer aside as a link is followed', () => {
      const { onNavigate } = renderManager();

      fireEvent.click(screen.getByRole('link', { name: 'Edit details' }));

      expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('holds New experience back while the place is under review', () => {
      renderManager({ status: Status.Draft });

      expect(screen.queryByRole('link', { name: 'New experience' })).not.toBeInTheDocument();
      expect(screen.getByText('New experience').closest('span[aria-disabled]')).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(screen.getByRole('link', { name: 'Edit details' })).toBeInTheDocument();
    });
  });
});
