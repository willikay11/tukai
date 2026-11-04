import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { DiscoverItineraries } from './index';

jest.mock('@/app/(experiences)/components/ItineraryCard', () => ({
  ItineraryCard: ({ itinerary }: { itinerary: Experience }) => (
    <div data-testid="itinerary">{itinerary.title}</div>
  ),
}));
jest.mock('@/app/shared/components/Images', () => ({
  FannedPhotos: ({ photos }: { photos: (string | undefined)[] }) => (
    <span data-testid="fan">{photos.join(',')}</span>
  ),
}));

const itineraries = (count: number): Experience[] =>
  Array.from(
    { length: count },
    (_, index) =>
      ({
        id: `it${index + 1}`,
        title: `Itinerary ${index + 1}`,
        photos: [
          { id: `p${index + 1}`, photo: `https://cdn.tukai.co/${index + 1}.jpg`, isCover: true },
        ],
      }) as unknown as Experience,
  );

const cardTitles = () => screen.getAllByTestId('itinerary').map((card) => card.textContent);

describe('DiscoverItineraries', () => {
  it('shows nothing without an itinerary', () => {
    const { container } = render(<DiscoverItineraries itineraries={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows every itinerary, with no way to expand, when there are ten or fewer', () => {
    render(<DiscoverItineraries itineraries={itineraries(4)} />);

    expect(screen.getByRole('heading', { name: 'Discover itineraries' })).toBeInTheDocument();
    expect(
      screen.getByText('Several places in one plan, organised by a community'),
    ).toBeInTheDocument();
    expect(cardTitles()).toHaveLength(4);
    expect(screen.queryByRole('button', { name: 'See all itineraries' })).not.toBeInTheDocument();
  });

  it('rails the first ten, with the title arrow and a See all tile of the next three', () => {
    render(<DiscoverItineraries itineraries={itineraries(14)} />);

    expect(cardTitles()).toHaveLength(10);
    expect(screen.getAllByRole('button', { name: 'See all itineraries' })).toHaveLength(2);
    // Left, centre, right are 11, 12, 13; FannedPhotos takes centre first
    expect(screen.getByTestId('fan')).toHaveTextContent(
      'https://cdn.tukai.co/12.jpg,https://cdn.tukai.co/11.jpg,https://cdn.tukai.co/13.jpg',
    );
  });

  it('expands into a grid of all of them, and collapses back', () => {
    render(<DiscoverItineraries itineraries={itineraries(14)} />);

    fireEvent.click(screen.getByText('See all'));
    expect(cardTitles()).toHaveLength(14);
    expect(screen.queryByRole('button', { name: 'See all itineraries' })).not.toBeInTheDocument();

    // One in the header, one under the grid
    const seeLess = screen.getAllByRole('button', { name: /See less/ });
    expect(seeLess).toHaveLength(2);

    fireEvent.click(seeLess[1]);
    expect(cardTitles()).toHaveLength(10);
  });

  it('expands from the title arrow too', () => {
    render(<DiscoverItineraries itineraries={itineraries(12)} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'See all itineraries' })[0]);
    expect(cardTitles()).toHaveLength(12);
  });
});
