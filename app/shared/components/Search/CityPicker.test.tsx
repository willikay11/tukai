import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CityPicker } from './CityPicker';

const setCity = jest.fn();
const setUsingLocation = jest.fn();
let status = 'idle';
let city: string | undefined = 'Nairobi';
let area: string | undefined;
let isUsingLocation = false;

jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({ city, area, status, isUsingLocation, setUsingLocation, setCity }),
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
    area = undefined;
    isUsingLocation = false;
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

    expect(setUsingLocation).toHaveBeenCalledWith(true);
  });

  /**
   * A page cannot un-grant a permission, so the switch follows the reader's
   * own preference rather than the browser's answer - otherwise it could be
   * turned on and never off.
   */
  it('turns back off, though the permission stays granted', async () => {
    status = 'granted';
    isUsingLocation = true;
    render(<CityPicker onClose={jest.fn()} />);

    const toggle = screen.getByRole('switch', { name: 'Use my location' });
    expect(toggle).toBeChecked();

    await userEvent.click(toggle);

    expect(setUsingLocation).toHaveBeenCalledWith(false);
  });

  it('shows where the reader is once it is known', () => {
    status = 'granted';
    isUsingLocation = true;
    area = 'Westlands, Nairobi';
    render(<CityPicker onClose={jest.fn()} />);

    expect(screen.getByText('Westlands, Nairobi')).toBeInTheDocument();
  });

  it('says it is working while it finds them', () => {
    status = 'loading';
    isUsingLocation = true;
    render(<CityPicker onClose={jest.fn()} />);

    expect(screen.getByText('Finding you…')).toBeInTheDocument();
  });

  // The list runs well past a panel's height
  it('scrolls the cities rather than growing', () => {
    const { container } = render(<CityPicker onClose={jest.fn()} />);

    const grid = container.querySelector('.grid-cols-2');
    expect(grid).toHaveClass('max-h-[232px]', 'overflow-y-auto');
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
    // Choosing a city is the other half of the switch
    expect(setUsingLocation).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalled();
  });

  // Location and a city are alternatives: with location on, no city is current
  it('marks no city while the reader is using their location', () => {
    status = 'granted';
    isUsingLocation = true;
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
