import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceDrawerProvider, usePlaceDrawer } from './PlaceDrawerContext';

const PlaceDrawer = jest.fn();
jest.mock('@/app/shared/components/Places', () => ({
  PlaceDrawer: (props: { placeId: string | null; isOpen: boolean; onClose: () => void }) => {
    PlaceDrawer(props);
    return props.isOpen ? (
      <div data-testid="drawer">
        {props.placeId}
        <button type="button" onClick={props.onClose}>
          close
        </button>
      </div>
    ) : null;
  },
}));

const Probe = () => {
  const drawer = usePlaceDrawer();

  return (
    <>
      <button type="button" onClick={() => drawer?.openPlace('p1')}>
        open
      </button>
      <button type="button" onClick={() => drawer?.openPlace('p1', { view: 'reservations' })}>
        open settings
      </button>
    </>
  );
};

describe('PlaceDrawerProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('holds nothing open to begin with', () => {
    render(
      <PlaceDrawerProvider>
        <Probe />
      </PlaceDrawerProvider>,
    );

    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });

  it('opens the place anything in the tree asks for', () => {
    render(
      <PlaceDrawerProvider>
        <Probe />
      </PlaceDrawerProvider>,
    );

    fireEvent.click(screen.getByText('open'));

    expect(screen.getByTestId('drawer')).toHaveTextContent('p1');
  });

  it('opens on the place itself unless asked for a view', () => {
    render(
      <PlaceDrawerProvider>
        <Probe />
      </PlaceDrawerProvider>,
    );

    fireEvent.click(screen.getByText('open'));

    expect(PlaceDrawer).toHaveBeenLastCalledWith(
      expect.objectContaining({ initialView: undefined }),
    );
  });

  it('opens on the view it is asked for', () => {
    render(
      <PlaceDrawerProvider>
        <Probe />
      </PlaceDrawerProvider>,
    );

    fireEvent.click(screen.getByText('open settings'));

    expect(PlaceDrawer).toHaveBeenLastCalledWith(
      expect.objectContaining({ placeId: 'p1', initialView: 'reservations' }),
    );
  });

  it('forgets the view when the next place is opened plainly', () => {
    render(
      <PlaceDrawerProvider>
        <Probe />
      </PlaceDrawerProvider>,
    );

    fireEvent.click(screen.getByText('open settings'));
    fireEvent.click(screen.getByText('open'));

    expect(PlaceDrawer).toHaveBeenLastCalledWith(
      expect.objectContaining({ initialView: undefined }),
    );
  });

  it('closes again', () => {
    render(
      <PlaceDrawerProvider>
        <Probe />
      </PlaceDrawerProvider>,
    );

    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('close'));

    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });
});

describe('usePlaceDrawer', () => {
  // Returned rather than thrown, so a card can be rendered in a test or on a
  // screen with no drawer without one
  it('is null outside the provider', () => {
    let seen: unknown = 'unset';

    const Outside = () => {
      seen = usePlaceDrawer();
      return null;
    };

    render(<Outside />);

    expect(seen).toBeNull();
  });
});
