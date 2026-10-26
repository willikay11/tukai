import React from 'react';

import { render, screen } from '@testing-library/react';

import { ExploringCityBar } from './index';

let away = false;
let city: string | undefined = 'Mombasa';
const homeCity = 'Nairobi';

jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({ away, city, homeCity }),
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCategories: () => ({
    data: {
      data: {
        results: [{ id: 'c2', name: 'Mombasa', images: [{ id: 'i2', imageUrl: '/mombasa.jpg' }] }],
      },
    },
  }),
}));

describe('the exploring city bar', () => {
  beforeEach(() => {
    away = false;
    city = 'Mombasa';
  });

  it('says nothing at home', () => {
    render(<ExploringCityBar />);

    expect(screen.queryByText(/Exploring/)).not.toBeInTheDocument();
  });

  it('says which city Discover has switched to, and the way home', () => {
    away = true;
    render(<ExploringCityBar />);

    expect(screen.getByText('Exploring Mombasa')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Showing experiences, places and communities in Mombasa. Your city is Nairobi.',
      ),
    ).toBeInTheDocument();
  });

  // Finding and clicking the on-screen chip trigger is a one-line DOM query
  // keyed on layout (`offsetParent`), which jsdom does not compute - left to
  // the real browser rather than a jsdom test that could only ever be faked.
  it('offers a way back to the chip', () => {
    away = true;
    render(<ExploringCityBar />);

    expect(screen.getByRole('button', { name: 'Change city' })).toBeInTheDocument();
  });
});
