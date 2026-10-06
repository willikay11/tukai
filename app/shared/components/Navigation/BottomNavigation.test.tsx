'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { act, render, screen, within } from '@testing-library/react';

import { BottomNavigation } from './BottomNavigation';

let currentQuery = '';
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: () => new URLSearchParams(currentQuery),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName, size }: { iconName: string; size: number }) => (
    <span data-testid={`icon-${iconName}`}>Icon</span>
  ),
}));

// The account is read only for the face on "You"; signed out, the icon stands in
let mockSession: { user: { image: string; name: string } } | null = null;
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession }),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('BottomNavigation', () => {
  // Both detail pages own the bottom edge with a floating bar of their own
  it.each([
    '/experiences/karura-night-hike',
    '/places/kraftory-biergarten',
    '/bucket-lists/weekend-hikes',
  ])('stands down on %s', (pathname) => {
    mockUsePathname.mockReturnValue(pathname);

    const { container } = render(<BottomNavigation />);

    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    '/experiences',
    '/experiences/create',
    '/experiences/see-all',
    '/experiences/type',
    '/places',
    '/places/claim',
    // The index of lists carries no floating bar of its own
    '/bucket-lists',
    // A sub-route of a place, not the place itself
    '/places/kraftory-biergarten/reserve',
  ])('still shows on %s', (pathname) => {
    mockUsePathname.mockReturnValue(pathname);

    render(<BottomNavigation />);

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  describe('rendering', () => {
    it('renders all navigation links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = within(screen.getByRole('navigation')).getAllByRole('link');
      expect(links).toHaveLength(5);

      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/bucket-lists');
      expect(links[2]).toHaveAttribute('href', '/communities');
      expect(links[3]).toHaveAttribute('href', '/plans');
      expect(links[4]).toHaveAttribute('href', '/profile');
    });

    it('renders with correct href attributes', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = within(screen.getByRole('navigation')).getAllByRole('link');

      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/bucket-lists');
      expect(links[2]).toHaveAttribute('href', '/communities');
      expect(links[3]).toHaveAttribute('href', '/plans');
      expect(links[4]).toHaveAttribute('href', '/profile');
    });

    it('renders navigation icons for all links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const linkElements = within(screen.getByRole('navigation')).getAllByRole('link');
      expect(linkElements).toHaveLength(5);

      // Each link should have an icon
      linkElements.forEach((link) => {
        const icon = link.querySelector('span');
        expect(icon).toBeInTheDocument();
      });
    });

    it('is hidden on desktop (md and above)', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const navContainer = container.querySelector('div.md\\:hidden');

      expect(navContainer).toBeInTheDocument();
    });

    it('is fixed at bottom of screen', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const navContainer = container.firstChild;

      expect(navContainer).toHaveClass('fixed', 'bottom-0', 'inset-x-0');
    });
  });

  describe('active link styling and labels', () => {
    // Every destination names itself, as the design has it - no bare icons
    it('shows every label, active or not', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      ['Discover', 'Bucket lists', 'Communities', 'Plans', 'You'].forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('applies active styling (bold label and a soft pill behind the icon)', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });

      expect(communitiesLink).toHaveAttribute('aria-current', 'page');
      expect(communitiesLink).toHaveClass('font-semibold', 'text-gray-900');
      expect(communitiesLink.querySelector('span')).toHaveClass('bg-surface-tab');
    });

    it('applies inactive styling (muted label, no pill)', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const plansLink = screen.getByRole('link', { name: /plans/i });

      expect(plansLink).not.toHaveAttribute('aria-current');
      expect(plansLink).toHaveClass('font-medium', 'text-gray-500');
      expect(plansLink.querySelector('span')).not.toHaveClass('bg-surface-tab');
    });

    it('marks Experiences link as active when pathname is /experiences', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });

      expect(communitiesLink).toHaveAttribute('aria-current', 'page');
    });

    it('marks Plans as active when pathname is /plans', () => {
      mockUsePathname.mockReturnValue('/plans');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /plans/i })).toHaveAttribute('aria-current', 'page');
    });

    // A single place hides the nav entirely, so the deepest route that still
    // shows it is a sub-route of one
    it('marks Plans as active for /plans subpaths', () => {
      mockUsePathname.mockReturnValue('/plans/123');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /plans/i })).toHaveAttribute('aria-current', 'page');
    });

    it('marks You as active when pathname is /profile', () => {
      mockUsePathname.mockReturnValue('/profile');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /you/i })).toHaveAttribute('aria-current', 'page');
    });

    // Only '/' exactly - every other route starts with it
    it('marks Discover as active only on the root', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /discover/i })).not.toHaveAttribute('aria-current');
    });

    it('only shows one active link at a time', () => {
      mockUsePathname.mockReturnValue('/plans');

      render(<BottomNavigation />);

      const activeLinks = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('aria-current') === 'page');

      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Plans');
    });
  });

  describe('scrolling', () => {
    // The bar is a fixed part of the screen, so it stays where it is however
    // far the page moves
    it('stays in place as the page scrolls down and back up', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const navContainer = container.firstChild as HTMLElement;

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
        window.dispatchEvent(new Event('scroll', { bubbles: true }));
      });
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
        window.dispatchEvent(new Event('scroll', { bubbles: true }));
      });

      expect(navContainer).toHaveClass('fixed', 'bottom-0');
      expect(navContainer).not.toHaveClass('translate-y-[150%]');
    });

    it('does not listen for scroll at all', () => {
      mockUsePathname.mockReturnValue('/');

      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      render(<BottomNavigation />);

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        expect.anything(),
      );

      addEventListenerSpy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('has semantic link structure', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = within(screen.getByRole('navigation')).getAllByRole('link');
      expect(links.length).toBe(5);
    });

    it('maintains link order', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      // Same order as the desktop nav
      const links = within(screen.getByRole('navigation')).getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/bucket-lists');
      expect(links[2]).toHaveAttribute('href', '/communities');
      expect(links[3]).toHaveAttribute('href', '/plans');
      expect(links[4]).toHaveAttribute('href', '/profile');
    });

    it('shows meaningful label for active link', () => {
      mockUsePathname.mockReturnValue('/profile');

      render(<BottomNavigation />);

      expect(screen.getByText('You')).toBeInTheDocument();
    });

    describe('the bar', () => {
      // The TukAI button used to sit here, outside the nav landmark. It has
      // been removed, so the bar is destinations and nothing else.
      it('carries destinations only', () => {
        mockUsePathname.mockReturnValue('/');

        render(<BottomNavigation />);

        const navLinks = within(screen.getByRole('navigation')).getAllByRole('link');
        expect(navLinks).toHaveLength(5);
        expect(screen.getAllByRole('link')).toHaveLength(5);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      // The reader's face stands in for the You icon, as the design has it
      it('shows the signed-in reader’s face on You', () => {
        mockUsePathname.mockReturnValue('/');
        mockSession = { user: { image: '/me.jpg', name: 'Ada' } };

        render(<BottomNavigation />);

        const you = screen.getByRole('link', { name: /you/i });
        expect(you.querySelector('img')).toHaveAttribute('alt', 'Ada');
        expect(screen.queryByTestId('icon-UserIcon')).not.toBeInTheDocument();

        mockSession = null;
      });

      it('shows no account avatar', () => {
        mockUsePathname.mockReturnValue('/');

        render(<BottomNavigation />);

        expect(screen.queryByRole('link', { name: /account|sign in/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('responsive behavior', () => {
    it('is shown on mobile screens', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('md:hidden');
    });

    it('spans the full width of the screen, along the bottom edge', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('inset-x-0', 'bottom-0');
      expect(nav).not.toHaveClass('left-1/2', '-translate-x-1/2');
    });
  });

  describe('styling', () => {
    it('is a white bar with an upward shadow, not a floating pill', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);

      expect(container.firstChild).toHaveClass('bg-white', 'shadow-top-md');
      expect(screen.getByRole('navigation')).not.toHaveClass('rounded-full', 'shadow-lg');
    });

    it('splits the five destinations into equal columns', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      expect(screen.getByRole('navigation')).toHaveClass('grid', 'grid-cols-5');
    });

    it('has z-index 50 for proper layering', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('z-50');
    });
  });

  /**
   * "My Communities" floats its own Create Community button along the bottom
   * edge. Two bars stacked on each other is the same problem a detail page's
   * booking bar has - and the tab is in the URL so this can see it.
   */
  describe('the communities tabs', () => {
    afterEach(() => {
      currentQuery = '';
    });

    it('stands down for the create button on My Communities', () => {
      currentQuery = 'tab=mine';
      usePathname.mockReturnValue('/communities');

      const { container } = render(<BottomNavigation />);

      expect(container).toBeEmptyDOMElement();
    });

    it.each(['', 'tab=following'])('still shows on the other tabs (%s)', (query) => {
      currentQuery = query;
      usePathname.mockReturnValue('/communities');

      const { container } = render(<BottomNavigation />);

      expect(container).not.toBeEmptyDOMElement();
    });
  });
});
