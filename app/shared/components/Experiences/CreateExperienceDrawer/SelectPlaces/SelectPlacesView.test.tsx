import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SelectPlacesView } from './SelectPlacesView';

const usePlaces = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaces: (params: unknown) => usePlaces(params),
  usePlaceCategories: () => ({ data: { data: { results: [] } } }),
  useGoogleMapsAutocomplete: () => ({ data: undefined, isLoading: false }),
}));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));
jest.mock('./PlaceCard', () => ({
  PlaceCard: ({ place }: { place: { title: string } }) => <div>{`place-${place.title}`}</div>,
}));

const lastParams = () => usePlaces.mock.calls[usePlaces.mock.calls.length - 1][0];

const renderView = () =>
  render(
    <SelectPlacesView
      multiple={false}
      contextLabel="Where it happens"
      headerTitle="Select the place"
      onClose={jest.fn()}
      onConfirm={jest.fn()}
    />,
  );

// DEV-432: City and Country go to the API rather than narrowing one page
describe('SelectPlacesView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePlaces.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });
  });

  it('asks for places in Kenya, in every city, to begin with', () => {
    renderView();

    expect(lastParams()).toEqual(expect.objectContaining({ country: 'KE', city: undefined }));
  });

  it('asks the API for the picked city', async () => {
    renderView();

    await userEvent.click(screen.getByRole('button', { name: /All cities/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Mombasa' }));

    expect(lastParams()).toEqual(expect.objectContaining({ country: 'KE', city: 'Mombasa' }));
  });

  // The API already narrowed them, so a place whose city is spelled
  // differently on its location still shows
  it('shows every place the API returns for that city', async () => {
    usePlaces.mockReturnValue({
      data: {
        data: {
          results: [
            { id: 'a', title: 'Fort Jesus', location: { city: 'Mombasa' } },
            { id: 'b', title: 'Old Town', location: { city: 'Mombasa Island' } },
          ],
        },
      },
      isLoading: false,
    });
    renderView();

    await userEvent.click(screen.getByRole('button', { name: /All cities/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Mombasa' }));

    expect(screen.getByText('place-Fort Jesus')).toBeInTheDocument();
    expect(screen.getByText('place-Old Town')).toBeInTheDocument();
  });
});
