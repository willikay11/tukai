import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Place } from '@/types/place';

import { PlaceDrawerHeader } from './PlaceDrawerHeader';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => (
    <button type="button" aria-label="Add to bucket list">
      basket
    </button>
  ),
}));
jest.mock('@/app/shared/components/Share', () => ({
  Share: ({ variant }: { variant?: string }) => (
    <button type="button" aria-label="Share this place" data-variant={variant}>
      share
    </button>
  ),
}));

const place = {
  id: 'p1',
  title: 'Kazuri Beads Workshop',
  photos: [],
} as unknown as Place;

describe('PlaceDrawerHeader', () => {
  it('names the place', () => {
    render(<PlaceDrawerHeader place={place} onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Kazuri Beads Workshop' })).toBeInTheDocument();
  });

  // All three read as one row of controls, so share is the bare glyph rather
  // than the labelled pill it is elsewhere
  it('asks share for its icon form', () => {
    render(<PlaceDrawerHeader place={place} onClose={jest.fn()} />);

    expect(screen.getByLabelText('Share this place')).toHaveAttribute('data-variant', 'icon');
  });

  it('carries all three controls', () => {
    render(<PlaceDrawerHeader place={place} onClose={jest.fn()} />);

    expect(screen.getByLabelText('Share this place')).toBeInTheDocument();
    expect(screen.getByLabelText('Add to bucket list')).toBeInTheDocument();
    expect(screen.getByLabelText('Close Kazuri Beads Workshop')).toBeInTheDocument();
  });

  it('closes on the cross', () => {
    const onClose = jest.fn();
    render(<PlaceDrawerHeader place={place} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close Kazuri Beads Workshop'));

    expect(onClose).toHaveBeenCalled();
  });
});
