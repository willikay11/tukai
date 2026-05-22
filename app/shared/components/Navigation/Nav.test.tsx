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

      expect(screen.getByRole('link', { name: /experiences/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /communities/i })).toBeInTheDocument();
    });

    it('renders with correct href attributes', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      expect(screen.getByRole('link', { name: /experiences/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute('href', '/places');
      expect(screen.getByRole('link', { name: /communities/i })).toHaveAttribute(
        'href',
        '/communities',
      );
    });

    it('renders navigation icons', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const linkElements = screen.getAllByRole('link');
      expect(linkElements).toHaveLength(3);
      linkElements.forEach((link) => {
        // Each link should have an SVG (icon)
        const svg = link.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('hides navigation on mobile (display: none by default)', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<Nav />);
      const navContainer = container.querySelector('div.hidden');

      expect(navContainer).toBeInTheDocument();
      expect(navContainer).toHaveClass('hidden');
    });
  });

  describe('active link styling', () => {
    it('marks Experiences link as active when pathname is /', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });
      expect(experiencesLink).toHaveClass('text-primary');
      expect(experiencesLink).toHaveClass('md:border-b-[1px]');
    });

    it('marks Explore link as active when pathname is /places', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<Nav />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });
      expect(exploreLink).toHaveClass('text-primary');
    });

    it('marks Explore link as active for /places subpaths', () => {
      mockUsePathname.mockReturnValue('/places/123');

      render(<Nav />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });
      expect(exploreLink).toHaveClass('text-primary');
    });

    it('marks Communities link as active when pathname is /communities', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<Nav />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });
      expect(communitiesLink).toHaveClass('text-primary');
    });

    it('marks Communities link as active for /communities subpaths', () => {
      mockUsePathname.mockReturnValue('/communities/abc-123');

      render(<Nav />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });
      expect(communitiesLink).toHaveClass('text-primary');
    });

    it('only marks one link as active at a time', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<Nav />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });
      const exploreLink = screen.getByRole('link', { name: /explore/i });
      const communitiesLink = screen.getByRole('link', { name: /communities/i });

      expect(exploreLink).toHaveClass('text-primary');
      expect(experiencesLink).not.toHaveClass('text-primary');
      expect(communitiesLink).not.toHaveClass('text-primary');
    });

    it('applies non-active styling to inactive links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });
      const span = exploreLink.querySelector('span');

      // Text color styling is on the inner span, not the link
      expect(span).toHaveClass('text-gray-800');
      expect(exploreLink).not.toHaveClass('text-primary');
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

      // Verify link is clickable and has correct href
      await user.click(experiencesLink);
      expect(experiencesLink).toHaveAttribute('href', '/');
    });

    it('closes menu on link click (if menu state existed)', async () => {
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });

      // Verify clicking doesn't cause errors
      await user.click(exploreLink);
      expect(exploreLink).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has semantic link structure', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBe(3);
    });

    it('uses readable link text (not just icons)', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      // All links should have text content
      expect(screen.getByText('Experiences')).toBeInTheDocument();
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Communities')).toBeInTheDocument();
    });

    it('maintains link order: Experiences, Explore, Communities', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveTextContent('Experiences');
      expect(links[1]).toHaveTextContent('Explore');
      expect(links[2]).toHaveTextContent('Communities');
    });

    it('active link has visual indication via color and border', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<Nav />);

      const activeLink = screen.getByRole('link', { name: /communities/i });

      // Primary color indicates active state
      expect(activeLink).toHaveClass('text-primary');
      // Border indicates active state on desktop
      expect(activeLink).toHaveClass('md:border-b-[1px]');
    });
  });

  describe('responsive behavior', () => {
    it('is hidden on mobile screens (display: hidden)', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<Nav />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('hidden');
    });

    it('is shown on tablet/desktop (md breakpoint)', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<Nav />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('md:inline-flex');
    });
  });

  describe('link spacing', () => {
    it('adds margin between links except the last one', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const links = screen.getAllByRole('link');

      // First two links should have mr-6 margin
      expect(links[0]).toHaveClass('mr-6');
      expect(links[1]).toHaveClass('mr-6');

      // Last link should not have mr-6
      expect(links[2]).not.toHaveClass('mr-6');
    });
  });
});
