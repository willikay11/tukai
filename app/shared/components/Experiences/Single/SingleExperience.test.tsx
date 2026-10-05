import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { SingleExperience } from './index';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 'u1' } } }) }));

jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({ lat: undefined, lng: undefined }),
}));

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt }: { alt: string }) => <span data-testid="photo" aria-label={alt} />,
}));

jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <span data-testid="bookmark" />,
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    slug: 'sunrise-hike',
    title: 'Sunrise Hike',
    photos: [],
    categories: [],
    location: { city: 'Nairobi' },
    hostCommunity: { id: 'c1', title: 'Nairobi Hikers' },
    priceStartsFrom: { amount: 1500, currency: 'KES' },
    // 22 Sep 2026, 08:30 to 13:00 local
    startDate: '2026-09-22T08:30:00',
    endDate: '2026-09-22T13:00:00',
    ...overrides,
  }) as unknown as Experience;

/**
 * The row card is what every experience on Discover renders as - the
 * handpicked row, "Happening Today" and "Happening Tomorrow" all use it.
 */
describe('SingleExperience, the discover row card', () => {
  it('says when the experience runs', () => {
    render(<SingleExperience type="discover" variant="row" experience={experience()} />);

    expect(screen.getByText('Sep 22, 8:30 AM - 1:00 PM')).toBeInTheDocument();
  });

  it('still shows the title, place and price alongside it', () => {
    render(<SingleExperience type="discover" variant="row" experience={experience()} />);

    expect(screen.getByText('Sunrise Hike')).toBeInTheDocument();
    expect(screen.getByText('Nairobi')).toBeInTheDocument();
    expect(screen.getByText(/1,500\/person/)).toBeInTheDocument();
  });

  it('gives the start alone when there is no end', () => {
    render(
      <SingleExperience
        type="discover"
        variant="row"
        experience={experience({ endDate: undefined })}
      />,
    );

    expect(screen.getByText('Sep 22, 8:30 AM')).toBeInTheDocument();
  });

  // Rather than rendering a stray comma or "Invalid Date"
  it.each([[undefined], [''], ['not-a-date']])('shows no date line for %s', (startDate) => {
    const { container } = render(
      <SingleExperience
        type="discover"
        variant="row"
        experience={experience({ startDate: startDate as string })}
      />,
    );

    expect(container.textContent).not.toMatch(/Invalid Date|^,|, ,/);
    expect(screen.queryByText(/Sep 22/)).not.toBeInTheDocument();
  });

  describe('the order things read in', () => {
    // The community is who is running it, so it sits directly under the photo
    // and the rest hangs off it
    it('puts the community first, then the title, place, price and date', () => {
      const { container } = render(
        <SingleExperience type="discover" variant="row" experience={experience()} />,
      );

      const lines = Array.from(container.querySelectorAll('p, span'))
        .map((node) => node.textContent?.trim())
        .filter((text): text is string => Boolean(text));

      const order = ['Nairobi Hikers', 'Sunrise Hike', 'Nairobi'].map((text) =>
        lines.findIndex((line) => line === text),
      );

      expect(order.every((index) => index >= 0)).toBe(true);
      expect(order).toEqual([...order].sort((a, b) => a - b));
    });

    it('still reads properly for an experience with no community', () => {
      render(
        <SingleExperience
          type="discover"
          variant="row"
          experience={experience({ hostCommunity: undefined })}
        />,
      );

      expect(screen.queryByText('Nairobi Hikers')).not.toBeInTheDocument();
      expect(screen.getByText('Sunrise Hike')).toBeInTheDocument();
      expect(screen.getByText('Sep 22, 8:30 AM - 1:00 PM')).toBeInTheDocument();
    });
  });

  /**
   * `price_starts_from` is the cheapest ticket by definition, so the amount on
   * a card is always a floor. The list endpoint returns no ticket data, so the
   * card cannot tell a single-price experience from a multi-price one - and
   * "from" is never wrong either way.
   */
  describe('the "from" prefix', () => {
    it('marks the price as a starting point', () => {
      render(<SingleExperience type="discover" variant="row" experience={experience()} />);

      expect(screen.getByText('from')).toBeInTheDocument();
      expect(screen.getByText(/1,500\/person/)).toBeInTheDocument();
    });

    it('is light grey and unbolded, against the semibold price', () => {
      render(<SingleExperience type="discover" variant="row" experience={experience()} />);

      expect(screen.getByText('from')).toHaveClass('font-normal', 'text-gray-400');
    });
  });
});
