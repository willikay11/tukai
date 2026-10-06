import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ItineraryCard } from './index';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <button type="button">bookmark</button>,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
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

const photo = (id: string, url: string, isCover = false) => ({
  id,
  mediaType: 'photo' as const,
  photo: url,
  photoUrl: url,
  isCover,
});

const makeItinerary = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'it1',
    title: 'Weekend in Naivasha',
    photos: [
      photo('p1', 'https://cdn.tukai.co/cover.jpg', true),
      photo('p2', 'https://cdn.tukai.co/stop-1.jpg'),
      photo('p3', 'https://cdn.tukai.co/stop-2.jpg'),
      photo('p4', 'https://cdn.tukai.co/stop-3.jpg'),
      photo('p5', 'https://cdn.tukai.co/stop-4.jpg'),
    ],
    startDate: '2026-10-10T08:00:00Z',
    endDate: '2026-10-12T18:00:00Z',
    isPaid: true,
    isSoldOut: false,
    isBookmarked: false,
    priceStartsFrom: { amount: 3000, currency: 'KES' },
    host: { firstName: 'Amina', lastName: 'Otieno' },
    hostCommunity: { id: 'c1', title: 'Rift Valley Walkers' },
    ...overrides,
  }) as unknown as Experience;

describe('ItineraryCard', () => {
  it('renders the cover and the title', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByAltText('Weekend in Naivasha')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/cover.jpg',
    );
    expect(screen.getByText('Weekend in Naivasha')).toBeInTheDocument();
  });

  it('leads the body with the community running it', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByText('Rift Valley Walkers')).toBeInTheDocument();
  });

  it('shows the starting price and the dates', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByText('from KES 3,000')).toBeInTheDocument();
    expect(screen.getByText('10 Oct - 12 Oct')).toBeInTheDocument();
  });

  it('says Free for a free itinerary rather than a price', () => {
    render(<ItineraryCard itinerary={makeItinerary({ isPaid: false })} />);

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.queryByText(/from KES/)).not.toBeInTheDocument();
  });

  it('leaves the price out when the API has none', () => {
    render(
      <ItineraryCard
        itinerary={makeItinerary({
          priceStartsFrom: undefined as unknown as Experience['priceStartsFrom'],
        })}
      />,
    );

    expect(screen.queryByText(/from/)).not.toBeInTheDocument();
  });

  it('fans the first three non-cover photos as stops', () => {
    const { container } = render(<ItineraryCard itinerary={makeItinerary()} />);

    const stops = container.querySelectorAll('span[aria-hidden="true"] img');
    // DOM order is left, right, then centre (centre sits on top), so compare as a set
    expect(Array.from(stops).map((img) => img.getAttribute('src'))).toHaveLength(3);
    expect(stops).toHaveLength(3);
    for (const url of [
      'https://cdn.tukai.co/stop-1.jpg',
      'https://cdn.tukai.co/stop-2.jpg',
      'https://cdn.tukai.co/stop-3.jpg',
    ]) {
      expect(container.querySelector(`img[src="${url}"]`)).toBeInTheDocument();
    }
    expect(container.querySelector('img[src="https://cdn.tukai.co/stop-4.jpg"]')).toBeNull();
  });

  it('draws no stops when the itinerary has only its cover', () => {
    const { container } = render(
      <ItineraryCard
        itinerary={makeItinerary({ photos: [photo('p1', 'https://cdn.tukai.co/cover.jpg', true)] })}
      />,
    );

    expect(container.querySelector('span[aria-hidden="true"] img')).toBeNull();
  });

  it('links to the itinerary page', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringContaining('it1'));
  });
});
