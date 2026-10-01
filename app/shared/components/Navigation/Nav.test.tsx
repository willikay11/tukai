'use client';

import { usePathname } from 'next/navigation';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Nav } from './Nav';

// "You" wears the reader's face when there is one
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

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
      expect(screen.getByRole('link', { name: /bucket lists/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /communities/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /plans/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /you/i })).toBeInTheDocument();
    });

    it('renders with correct href attributes', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      expect(screen.getByRole('link', { name: /discover/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /communities/i })).toHaveAttribute(
        'href',
        '/communities',
      );
      expect(screen.getByRole('link', { name: /plans/i })).toHaveAttribute('href', '/plans');
      expect(screen.getByRole('link', { name: /you/i })).toHaveAttribute('href', '/profile');
      expect(screen.getByRole('link', { name: /bucket lists/i })).toHaveAttribute(
        'href',
        '/bucket-lists',
      );
    });

    it('renders navigation icons', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const linkElements = screen.getAllByRole('link');
      expect(linkElements).toHaveLength(5);
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
      expect(discoverLink).toHaveClass('bg-surface-brand');
      expect(discoverLink).toHaveClass('text-brand-ink');
    });

    it('marks Communities as active when pathname is /communities', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<Nav />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });
      expect(communitiesLink).toHaveClass('bg-surface-brand');
    });

    it('marks Communities as active for /communities subpaths', () => {
      mockUsePathname.mockReturnValue('/communities/123');

      render(<Nav />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });
      expect(communitiesLink).toHaveClass('bg-surface-brand');
    });

    it('marks Plans as active when pathname is /plans', () => {
      mockUsePathname.mockReturnValue('/plans');

      render(<Nav />);

      const plansLink = screen.getByRole('link', { name: /plans/i });
      expect(plansLink).toHaveClass('bg-surface-brand');
    });

    it('does not mark Discover as active on subroutes', () => {
      mockUsePathname.mockReturnValue('/plans');

      render(<Nav />);

      const discoverLink = screen.getByRole('link', { name: /discover/i });
      expect(discoverLink).not.toHaveClass('bg-surface-brand');
    });

    it('only marks one link as active at a time', () => {
      mockUsePathname.mockReturnValue('/plans');

      render(<Nav />);

      const activeLinks = screen
        .getAllByRole('link')
        .filter((link) => link.classList.contains('bg-surface-brand'));

      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Plans');
    });

    it('applies non-active styling to inactive links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const plansLink = screen.getByRole('link', { name: /plans/i });
      expect(plansLink).toHaveClass('text-ink-muted');
      expect(plansLink).not.toHaveClass('bg-surface-brand');
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

      const communitiesLink = screen.getByRole('link', { name: /communities/i });

      await user.click(communitiesLink);
      expect(communitiesLink).toHaveAttribute('href', '/communities');
    });
  });

  describe('accessibility', () => {
    it('has semantic nav and link structure', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getAllByRole('link').length).toBe(5);
    });

    // Only the current destination is named below xl, the way the mobile
    // bottom bar does it — the rest keep their text in the DOM, hidden
    it('names the current destination', () => {
      mockUsePathname.mockReturnValue('/plans');

      render(<Nav />);

      const active = screen.getByRole('link', { name: 'Plans' });
      expect(active.querySelector('span')).toHaveClass('inline');
      expect(screen.getByRole('link', { name: 'You' }).querySelector('span')).toHaveClass(
        'hidden',
        'xl:inline',
      );
    });

    it('uses readable link text (not just icons)', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      expect(screen.getByText('Discover')).toBeInTheDocument();
      expect(screen.getByText('Bucket lists')).toBeInTheDocument();
      expect(screen.getByText('Communities')).toBeInTheDocument();
      expect(screen.getByText('Plans')).toBeInTheDocument();
      expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('maintains link order: Discover, Experiences, Places, Moments', () => {
      mockUsePathname.mockReturnValue('/');

      render(<Nav />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveTextContent('Discover');
      expect(links[1]).toHaveTextContent('Bucket lists');
      expect(links[2]).toHaveTextContent('Communities');
      expect(links[3]).toHaveTextContent('Plans');
      expect(links[4]).toHaveTextContent('You');
    });
  });
});
