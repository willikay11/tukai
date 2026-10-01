import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CityPicker } from './CityPicker';

const setCity = jest.fn();
const requestLocation = jest.fn();
let status = 'idle';
let city: string | undefined = 'Nairobi';

jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({ city, status, setCity, requestLocation }),
}));

let isLoading = false;
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCategories: () => ({
    data: {
      data: {
        results: [
          { id: 'c1', name: 'Nairobi', images: [{ id: 'i1', imageUrl: '/nairobi.jpg' }] },
          { id: 'c2', name: 'Mombasa', images: [] },
        ],
      },
    },
    isLoading,
  }),
}));

describe('the city picker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    status = 'idle';
    city = 'Nairobi';
    isLoading = false;
  });

  it('offers the reader their own location, and says what it is used for', () => {
    render(<CityPicker onClose={jest.fn()} />);

    expect(screen.getByText('Use my location')).toBeInTheDocument();
    expect(screen.getByText("See what's closest to you first")).toBeInTheDocument();
    expect(
      screen.getByText("Only used to sort what's near you. Never shown to anyone."),
    ).toBeInTheDocument();
  });

  it('asks for location when the switch is turned on', async () => {
    render(<CityPicker onClose={jest.fn()} />);

    await userEvent.click(screen.getByRole('switch', { name: 'Use my location' }));

    expect(requestLocation).toHaveBeenCalled();
  });

  it('shows the switch on once location is granted', () => {
    status = 'granted';
    render(<CityPicker onClose={jest.fn()} />);

    expect(screen.getByRole('switch', { name: 'Use my location' })).toBeChecked();
  });

  // The browser is the only thing that can un-block it, so say so
  it('explains a refusal rather than silently failing', () => {
    status = 'denied';
    render(<CityPicker onClose={jest.fn()} />);

    expect(
      screen.getByText('Your browser is blocking it. Allow location and try again.'),
    ).toBeInTheDocument();
  });

  it('lists the cities, marking the current one', () => {
    render(<CityPicker onClose={jest.fn()} />);

    expect(screen.getByRole('button', { name: /Nairobi/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Mombasa/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('chooses a city and closes', async () => {
    const onClose = jest.fn();
    render(<CityPicker onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /Mombasa/ }));

    expect(setCity).toHaveBeenCalledWith('Mombasa');
    expect(onClose).toHaveBeenCalled();
  });

  // Location and a city are alternatives: with location on, no city is current
  it('marks no city while the reader is using their location', () => {
    status = 'granted';
    render(<CityPicker onClose={jest.fn()} />);

    expect(screen.getByRole('button', { name: /Nairobi/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('shows placeholders while the cities load', () => {
    isLoading = true;
    render(<CityPicker onClose={jest.fn()} />);

    expect(screen.queryByRole('button', { name: /Mombasa/ })).not.toBeInTheDocument();
  });
});
