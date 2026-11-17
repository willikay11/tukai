import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ItineraryCard } from './index';
import { crossfadeOffset, itineraryCoverPhotos } from './itinerary-card';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <button type="button">bookmark</button>,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    // eslint-disable-next-line @next/next/no-img-element
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
      photo('p2', 'https://cdn.tukai.co/stop-1.jpg'),
      photo('p1', 'https://cdn.tukai.co/cover.jpg', true),
      photo('p3', 'https://cdn.tukai.co/stop-2.jpg'),
      photo('p4', 'https://cdn.tukai.co/stop-3.jpg'),
      photo('p5', 'https://cdn.tukai.co/stop-4.jpg'),
    ],
    startDate: '2026-09-26T09:00:00',
    endDate: '2026-09-26T22:00:00',
    isPaid: true,
    isSoldOut: false,
    isBookmarked: false,
    priceStartsFrom: { amount: 6500, currency: 'KES' },
    host: { firstName: 'Amina', lastName: 'Otieno' },
    hostCommunity: { id: 'c1', title: 'City Sketchers' },
    ...overrides,
  }) as unknown as Experience;

// en-GB writes September as "Sep" or "Sept" depending on the ICU version
const WHEN = /^Sat 26 Sept?, 09:00 - 22:00$/;

const fanSources = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('span[aria-hidden="true"].pointer-events-none img')).map(
    (image) => image.getAttribute('src'),
  );

describe('itineraryCoverPhotos', () => {
  it('leads with the cover, then the next three, without repeats', () => {
    expect(itineraryCoverPhotos(makeItinerary().photos)).toEqual([
      'https://cdn.tukai.co/cover.jpg',
      'https://cdn.tukai.co/stop-1.jpg',
      'https://cdn.tukai.co/stop-2.jpg',
      'https://cdn.tukai.co/stop-3.jpg',
    ]);
  });

  it('is empty without photos', () => {
    expect(itineraryCoverPhotos(undefined)).toEqual([]);
  });
});

describe('crossfadeOffset', () => {
  it('staggers runs of five by 0.7s', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(crossfadeOffset)).toEqual([0, 700, 1400, 2100, 2800, 0, 700]);
  });
});

describe('ItineraryCard', () => {
  it('is one link to the itinerary, named by its text', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('it1'));
    expect(link).toHaveTextContent('Weekend in Naivasha');
  });

  it('keeps Save outside the link', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByRole('link')).not.toContainElement(screen.getByText('bookmark'));
  });

  it('leads with the organising community, never a rating', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByText('City Sketchers')).toBeInTheDocument();
  });

  it('shows "from" the starting price, then when', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByText('KES 6,500').parentElement).toHaveTextContent('from KES 6,500');
    expect(screen.getByText(WHEN)).toBeInTheDocument();
  });

  it('says Free for a free itinerary rather than a price', () => {
    render(<ItineraryCard itinerary={makeItinerary({ isPaid: false })} />);

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.queryByText(/from/)).not.toBeInTheDocument();
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

  it('fans stops two to four, centre last so it sits on top', () => {
    const { container } = render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(fanSources(container)).toEqual([
      'https://cdn.tukai.co/stop-1.jpg',
      'https://cdn.tukai.co/stop-3.jpg',
      'https://cdn.tukai.co/stop-2.jpg',
    ]);
  });

  it('draws no fan when the itinerary has only its cover', () => {
    const { container } = render(
      <ItineraryCard
        itinerary={makeItinerary({ photos: [photo('p1', 'https://cdn.tukai.co/cover.jpg', true)] })}
      />,
    );

    expect(fanSources(container)).toEqual([]);
  });

  it('has no flag in the section', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.queryByText('Itinerary')).not.toBeInTheDocument();
  });

  describe('in the Discover experiences grid', () => {
    it('is flagged, and prices per person after the date', () => {
      render(<ItineraryCard itinerary={makeItinerary()} variant="grid" />);

      expect(screen.getByText('Itinerary')).toBeInTheDocument();

      const when = screen.getByText(WHEN);
      const price = screen.getByText('KES 6,500/person');
      expect(when.compareDocumentPosition(price) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(screen.queryByText(/from/)).not.toBeInTheDocument();
    });

    it('does not clamp the title', () => {
      render(<ItineraryCard itinerary={makeItinerary()} variant="grid" />);

      expect(screen.getByText('Weekend in Naivasha')).not.toHaveClass('line-clamp-2');
    });
  });
});
