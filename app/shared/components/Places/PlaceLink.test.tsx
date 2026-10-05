import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceLink } from './PlaceLink';

const openPlace = jest.fn();
const usePlaceDrawer = jest.fn();

jest.mock('@/context/PlaceDrawerContext', () => ({
  usePlaceDrawer: () => usePlaceDrawer(),
}));
jest.mock('next/link', () => {
  function MockLink({ children, href, ...rest }: Record<string, unknown>) {
    return (
      <a href={href as string} {...rest}>
        {children as React.ReactNode}
      </a>
    );
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const place = { id: 'p1' };

describe('PlaceLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePlaceDrawer.mockReturnValue({ openPlace, closePlace: jest.fn(), openPlaceId: null });
  });

  it('opens the place in the drawer', () => {
    render(<PlaceLink place={place}>Talisman</PlaceLink>);

    fireEvent.click(screen.getByRole('button'));

    expect(openPlace).toHaveBeenCalledWith('p1');
  });

  // A place has no page of its own to send anyone to while the drawer is up
  it('is not a link, so there is nothing to open in a new tab', () => {
    render(<PlaceLink place={place}>Talisman</PlaceLink>);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('opens on the keyboard too', () => {
    render(<PlaceLink place={place}>Talisman</PlaceLink>);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(openPlace).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(openPlace).toHaveBeenCalledTimes(2);
  });

  it('ignores any other key', () => {
    render(<PlaceLink place={place}>Talisman</PlaceLink>);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'a' });

    expect(openPlace).not.toHaveBeenCalled();
  });

  it('closes whatever it was opened from', () => {
    const onNavigate = jest.fn();
    render(
      <PlaceLink place={place} onNavigate={onNavigate}>
        Talisman
      </PlaceLink>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onNavigate).toHaveBeenCalled();
  });

  /**
   * Outside the provider the place page is the only thing left that can show
   * the place, so it falls back to being a link.
   */
  describe('with no drawer in the tree', () => {
    beforeEach(() => usePlaceDrawer.mockReturnValue(null));

    it('links to the place’s own page', () => {
      render(<PlaceLink place={place}>Talisman</PlaceLink>);

      expect(screen.getByRole('link')).toHaveAttribute('href', '/places/p1');
    });

    it('prefers the slug in that href', () => {
      render(<PlaceLink place={{ id: 'p1', slug: 'talisman' }}>Talisman</PlaceLink>);

      expect(screen.getByRole('link')).toHaveAttribute('href', '/places/talisman');
    });

    it('still runs onNavigate', () => {
      const onNavigate = jest.fn();
      render(
        <PlaceLink place={place} onNavigate={onNavigate}>
          Talisman
        </PlaceLink>,
      );

      fireEvent.click(screen.getByRole('link'));

      expect(onNavigate).toHaveBeenCalled();
    });
  });
});
