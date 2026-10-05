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

  it('opens the place rather than following the link', () => {
    render(<PlaceLink place={place}>Talisman</PlaceLink>);

    fireEvent.click(screen.getByRole('link'), { button: 0 });

    expect(openPlace).toHaveBeenCalledWith('p1');
  });

  // It stays a real link, so a new tab still lands on the page
  it('keeps the place’s own href', () => {
    render(<PlaceLink place={place}>Talisman</PlaceLink>);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/places/p1');
  });

  it('prefers the slug in the href where there is one', () => {
    render(<PlaceLink place={{ id: 'p1', slug: 'talisman' }}>Talisman</PlaceLink>);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/places/talisman');
  });

  it('leaves a modified click to the browser', () => {
    render(<PlaceLink place={place}>Talisman</PlaceLink>);

    fireEvent.click(screen.getByRole('link'), { metaKey: true });
    fireEvent.click(screen.getByRole('link'), { ctrlKey: true });
    fireEvent.click(screen.getByRole('link'), { shiftKey: true });

    expect(openPlace).not.toHaveBeenCalled();
  });

  // Rendered somewhere with no drawer above it, it simply navigates
  it('navigates with no drawer in the tree', () => {
    usePlaceDrawer.mockReturnValue(null);

    render(<PlaceLink place={place}>Talisman</PlaceLink>);
    fireEvent.click(screen.getByRole('link'), { button: 0 });

    expect(openPlace).not.toHaveBeenCalled();
  });

  // A search panel closes itself on the way out, drawer or not
  it('runs onNavigate either way', () => {
    const onNavigate = jest.fn();

    const { rerender } = render(
      <PlaceLink place={place} onNavigate={onNavigate}>
        Talisman
      </PlaceLink>,
    );
    fireEvent.click(screen.getByRole('link'), { button: 0 });
    expect(onNavigate).toHaveBeenCalledTimes(1);

    usePlaceDrawer.mockReturnValue(null);
    rerender(
      <PlaceLink place={place} onNavigate={onNavigate}>
        Talisman
      </PlaceLink>,
    );
    fireEvent.click(screen.getByRole('link'), { button: 0 });
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });
});
