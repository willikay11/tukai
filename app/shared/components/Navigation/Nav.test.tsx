'use client';

import { usePathname } from 'next/navigation';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Nav } from './Nav';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Nav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all navigation links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      expect(screen.getByRole('link', { name: /discover/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /experiences/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /places/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /moments/i })).toBeInTheDocument();
    });

    it('renders with correct href attributes', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      expect(screen.getByRole('link', { name: /discover/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /experiences/i })).toHaveAttribute(
        'href',
        '/experiences',
      );
      expect(screen.getByRole('link', { name: /places/i })).toHaveAttribute('href', '/places');
      expect(screen.getByRole('link', { name: /moments/i })).toHaveAttribute('href', '/moments');
    });

    it('renders navigation icons', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const linkElements = screen.getAllByRole('link');
      expect(linkElements).toHaveLength(4);
      linkElements.forEach((link) => {
        // Each link should have an SVG (icon)
        const svg = link.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('hides navigation below the md breakpoint, where the bottom bar takes over', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<Nav />);
      const nav = container.querySelector('nav');

      expect(nav).toHaveClass('hidden');
      expect(nav).toHaveClass('md:flex');
    });
  });

  describe('active link styling', () => {
    it('marks Discover link as active when pathname is /', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const discoverLink = screen.getByRole('link', { name: /discover/i });
      expect(discoverLink).toHaveClass('bg-white');
      expect(discoverLink).toHaveClass('shadow-sm');
    });

    it('marks Experiences link as active when pathname is /experiences', () => {
      mockUsePathname.mockReturnValue('/experiences');

      render(<Nav />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });
      expect(experiencesLink).toHaveClass('bg-white');
    });

    it('marks Experiences link as active for /experiences subpaths', () => {
      mockUsePathname.mockReturnValue('/experiences/123');

      render(<Nav />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });
      expect(experiencesLink).toHaveClass('bg-white');
    });

    it('marks Places link as active when pathname is /places', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<Nav />);

      const placesLink = screen.getByRole('link', { name: /places/i });
      expect(placesLink).toHaveClass('bg-white');
    });

    it('does not mark Discover as active on subroutes', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<Nav />);

      const discoverLink = screen.getByRole('link', { name: /discover/i });
      expect(discoverLink).not.toHaveClass('bg-white');
    });

    it('only marks one link as active at a time', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<Nav />);

      const activeLinks = screen
        .getAllByRole('link')
        .filter((link) => link.classList.contains('bg-white'));

      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Places');
    });

    it('applies non-active styling to inactive links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const placesLink = screen.getByRole('link', { name: /places/i });
      expect(placesLink).toHaveClass('text-gray-700');
      expect(placesLink).not.toHaveClass('bg-white');
    });
  });

  describe('interactions', () => {
    it('is keyboard accessible - all links are focusable', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('links are clickable', async () => {
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });

      await user.click(experiencesLink);
      expect(experiencesLink).toHaveAttribute('href', '/experiences');
    });
  });

  describe('accessibility', () => {
    it('has semantic nav and link structure', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getAllByRole('link').length).toBe(4);
    });

    // Only the current destination is named below xl, the way the mobile
    // bottom bar does it — the rest keep their text in the DOM, hidden
    it('names the current destination', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<Nav />);

      const active = screen.getByRole('link', { name: 'Places' });
      expect(active.querySelector('span')).toHaveClass('inline');
      expect(screen.getByRole('link', { name: 'Moments' }).querySelector('span')).toHaveClass(
        'hidden',
        'xl:inline',
      );
    });

    it('uses readable link text (not just icons)', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      expect(screen.getByText('Discover')).toBeInTheDocument();
      expect(screen.getByText('Experiences')).toBeInTheDocument();
      expect(screen.getByText('Places')).toBeInTheDocument();
      expect(screen.getByText('Moments')).toBeInTheDocument();
    });

    it('maintains link order: Discover, Experiences, Places, Moments', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveTextContent('Discover');
      expect(links[1]).toHaveTextContent('Experiences');
      expect(links[2]).toHaveTextContent('Places');
      expect(links[3]).toHaveTextContent('Moments');
    });
  });
});
