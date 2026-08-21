import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ItineraryCard } from './index';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useBookmarkExperience: () => ({ mutate: jest.fn() }),
}));
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <button type="button">bookmark</button>,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt || 'preview'} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
jest.mock('next/link', () => {
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const makeItinerary = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'i1',
    title: '2-Day Lake Naivasha Adventure',
    startDate: '2026-08-20T00:00:00Z',
    endDate: '2026-08-21T00:00:00Z',
    photos: [
      { id: 'a', photo: 'https://cdn.tukai.co/cover.jpg', isCover: true },
      { id: 'b', photo: 'https://cdn.tukai.co/p1.jpg', isCover: false },
      { id: 'c', photo: 'https://cdn.tukai.co/p2.jpg', isCover: false },
    ],
    priceStartsFrom: { amount: 20000, currency: 'Ksh.' },
    isBookmarked: false,
    ...overrides,
  }) as unknown as Experience;

describe('ItineraryCard', () => {
  it('renders the title and From price', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByText('2-Day Lake Naivasha Adventure')).toBeInTheDocument();
    expect(screen.getByText('From Ksh. 20,000')).toBeInTheDocument();
  });

  it('no longer carries the TukAI pill', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.queryByText('TukAI')).not.toBeInTheDocument();
  });

  // The list response has no itinerary_duration_days, so days come from dates
  it('derives the day span from the start and end dates', () => {
    expect(screen.queryByText('2 days')).not.toBeInTheDocument();
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByText(/2 days/)).toBeInTheDocument();
  });

  it('singularises a one-day itinerary', () => {
    render(
      <ItineraryCard
        itinerary={makeItinerary({
          startDate: '2026-08-20T00:00:00Z',
          endDate: '2026-08-20T00:00:00Z',
        })}
      />,
    );

    expect(screen.getByText(/1 day/)).toBeInTheDocument();
    expect(screen.queryByText(/1 days/)).not.toBeInTheDocument();
  });

  it('fans preview photos from the itinerary, excluding the cover', () => {
    const { container } = render(<ItineraryCard itinerary={makeItinerary()} />);

    const sources = screen.getAllByRole('img').map((img) => img.getAttribute('src'));
    expect(sources).toEqual(
      expect.arrayContaining([
        'https://cdn.tukai.co/cover.jpg',
        'https://cdn.tukai.co/p1.jpg',
        'https://cdn.tukai.co/p2.jpg',
      ]),
    );

    // The first non-cover photo sits centred and on top
    expect(container.querySelector('.z-10 img')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/p1.jpg',
    );

    // With only two to show, the second leans out to the left rather than
    // leaving a hole on that side
    expect(container.querySelector('.-rotate-12 img')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/p2.jpg',
    );
    expect(container.querySelector('.rotate-12:not(.-rotate-12)')).not.toBeInTheDocument();
  });

  it('links to the itinerary detail page', () => {
    render(<ItineraryCard itinerary={makeItinerary()} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/experiences/i1');
  });

  it('renders without dates or photos', () => {
    render(
      <ItineraryCard
        itinerary={makeItinerary({ startDate: '', endDate: '', photos: [] } as never)}
      />,
    );

    expect(screen.getByText('2-Day Lake Naivasha Adventure')).toBeInTheDocument();
  });
});
