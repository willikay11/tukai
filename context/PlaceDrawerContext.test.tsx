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
    <button type="button" onClick={() => drawer?.openPlace('p1')}>
      open
    </button>
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
