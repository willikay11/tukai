import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ExperienceCard } from './index';

// Null by default, so the cases above run without a drawer and see the link alone
const mockDrawer = { current: null as null | { openExperience: jest.Mock } };
jest.mock('@/context/ExperienceDrawerContext', () => ({
  useExperienceDrawer: () => mockDrawer.current,
}));

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <button type="button">bookmark</button>,
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
jest.mock('next/link', () => {
  // Forwards every prop, so class-based assertions see what the card renders
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

const makeExperience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Pottery for beginners',
    photos: [{ id: 'ph1', photo: 'https://cdn.tukai.co/cover.jpg', isCover: true }],
    startDate: '2026-10-03T10:00:00Z',
    endDate: '2026-10-03T12:00:00Z',
    isPaid: true,
    isSoldOut: false,
    isBookmarked: false,
    priceStartsFrom: { amount: 1800, currency: 'KES' },
    hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' },
    ...overrides,
  }) as unknown as Experience;

describe('ExperienceCard', () => {
  it('renders the cover and the title', () => {
    render(<ExperienceCard experience={makeExperience()} />);

    expect(screen.getByAltText('Pottery for beginners')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/cover.jpg',
    );
    expect(screen.getByText('Pottery for beginners')).toBeInTheDocument();
  });

  // Who is running it leads the body, above the title
  it('names the community running it', () => {
    render(<ExperienceCard experience={makeExperience()} />);

    expect(screen.getByText('Nairobi Makers Circle')).toBeInTheDocument();
  });

  it('leaves the host line out when there is neither a community nor a host', () => {
    render(<ExperienceCard experience={makeExperience({ hostCommunity: undefined })} />);

    expect(screen.queryByText('Nairobi Makers Circle')).not.toBeInTheDocument();
  });

  // A guided tour hangs off a guide's profile, not a community
  it('names the guide on a tour, which has no community', () => {
    const tour = makeExperience({
      hostCommunity: undefined,
      experienceType: 'guide_booking',
      host: { id: 'u1', firstName: 'Michelle', lastName: 'Wachira' } as never,
    });

    render(<ExperienceCard experience={tour} />);

    expect(screen.getByText('Michelle Wachira')).toBeInTheDocument();
  });

  it('says when it runs, with the weekday and a 24-hour range', () => {
    render(<ExperienceCard experience={makeExperience()} />);

    expect(screen.getByText(/Sat 3 Oct, \d{2}:\d{2} - \d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('shows the price per person', () => {
    render(<ExperienceCard experience={makeExperience()} />);

    expect(screen.getByText('KES 1,800/person')).toBeInTheDocument();
  });

  it('links to the experience detail page', () => {
    render(<ExperienceCard experience={makeExperience()} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/experiences/e1');
  });

  // The canvas draws its experience media square, at 184px
  it('is a square tile at the canvas width', () => {
    const { container } = render(<ExperienceCard experience={makeExperience()} />);

    expect(screen.getByRole('link')).toHaveClass('w-[184px]');
    expect(container.querySelector('.aspect-square')).toBeInTheDocument();
  });

  describe('the flag over the photo', () => {
    it('is absent for an ordinary paid experience with seats left', () => {
      render(<ExperienceCard experience={makeExperience()} />);

      expect(screen.queryByText('Sold out')).not.toBeInTheDocument();
      expect(screen.queryByText('Free')).not.toBeInTheDocument();
      expect(screen.queryByText('Recurring')).not.toBeInTheDocument();
    });

    it('says sold out', () => {
      render(<ExperienceCard experience={makeExperience({ isSoldOut: true })} />);

      expect(screen.getByText('Sold out')).toBeInTheDocument();
    });

    // The canvas says it in both places on a free experience - the pill over
    // the photo and the price line beneath it
    it('says free on the pill and on the price line', () => {
      render(<ExperienceCard experience={makeExperience({ isPaid: false })} />);

      expect(screen.getAllByText('Free')).toHaveLength(2);
      expect(screen.queryByText(/person/)).not.toBeInTheDocument();
    });
  });

  describe('opening the drawer', () => {
    const openExperience = jest.fn();

    beforeEach(() => {
      openExperience.mockClear();
      mockDrawer.current = { openExperience };
    });

    afterEach(() => {
      mockDrawer.current = null;
    });

    it('opens the drawer on a plain click, and keeps the link to the page', () => {
      render(<ExperienceCard experience={makeExperience()} />);

      const link = screen.getByRole('link');
      const notCancelled = fireEvent.click(link);

      expect(openExperience).toHaveBeenCalledWith('e1');
      expect(link).toHaveAttribute('href', '/experiences/e1');
      // preventDefault was called, so the browser does not follow the link
      expect(notCancelled).toBe(false);
    });

    it('leaves a modified click to the browser, so it can open a new tab', () => {
      render(<ExperienceCard experience={makeExperience()} />);

      const notCancelled = fireEvent.click(screen.getByRole('link'), { metaKey: true });

      expect(openExperience).not.toHaveBeenCalled();
      expect(notCancelled).toBe(true);
    });

    it('keeps the link alone where the drawer is switched off', () => {
      render(<ExperienceCard experience={makeExperience()} opensDrawer={false} />);

      const notCancelled = fireEvent.click(screen.getByRole('link'));

      expect(openExperience).not.toHaveBeenCalled();
      expect(notCancelled).toBe(true);
    });
  });
});
