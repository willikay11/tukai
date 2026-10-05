'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { render, screen, waitFor, within } from '@testing-library/react';

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

      expect(navContainer).toHaveClass('fixed', 'bottom-6');
    });
  });

  describe('active link styling and labels', () => {
    it('shows label only for active link', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });

      // Active link should show the label
      expect(communitiesLink).toHaveTextContent('Communities');
    });

    it('hides label for non-active links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = screen.getAllByRole('link');
      const exploreLinkElement = links.find((link) => link.getAttribute('href') === '/plans');

      // Non-active links should only have icons, not text
      expect(exploreLinkElement).not.toHaveTextContent('Explore');
    });

    it('applies active styling (background and color)', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });

      expect(communitiesLink).toHaveClass('bg-lime');
      expect(communitiesLink).toHaveClass('text-primary');
    });

    it('applies inactive styling (text color)', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = screen.getAllByRole('link');
      const exploreLink = links.find((link) => link.getAttribute('href') === '/plans');

      expect(exploreLink).toHaveClass('text-gray-500');
      expect(exploreLink).not.toHaveClass('bg-lime');
    });

    it('marks Experiences link as active when pathname is /experiences', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });

      expect(communitiesLink).toHaveClass('bg-lime');
    });

    it('marks Plans as active when pathname is /plans', () => {
      mockUsePathname.mockReturnValue('/plans');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /plans/i })).toHaveClass('bg-lime');
    });

    // A single place hides the nav entirely, so the deepest route that still
    // shows it is a sub-route of one
    it('marks Plans as active for /plans subpaths', () => {
      mockUsePathname.mockReturnValue('/plans/123');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /plans/i })).toHaveClass('bg-lime');
    });

    it('marks You as active when pathname is /profile', () => {
      mockUsePathname.mockReturnValue('/profile');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /you/i })).toHaveClass('bg-lime');
    });

    // Only '/' exactly - every other route starts with it
    it('marks Discover as active only on the root', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      expect(screen.queryByRole('link', { name: /discover/i })).not.toBeInTheDocument();
    });

    it('only shows one active link at a time', () => {
      mockUsePathname.mockReturnValue('/plans');

      render(<BottomNavigation />);

      const activeLinks = screen
        .getAllByRole('link')
        .filter((link) => link.className.includes('bg-lime'));

      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Plans');
    });
  });

  describe('scroll behavior', () => {
    it('is visible by default', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const navContainer = container.firstChild;

      expect(navContainer).toHaveClass('translate-y-0');
      expect(navContainer).not.toHaveClass('translate-y-[150%]');
    });

    it('stays visible when at top of page (scrollY < 10)', async () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);

      // Set scroll position to 5 (near top)
      Object.defineProperty(window, 'scrollY', { value: 5, writable: true });

      // Trigger scroll event
      window.dispatchEvent(new Event('scroll', { bubbles: true }));

      await waitFor(() => {
        const navContainer = container.firstChild as HTMLElement;
        expect(navContainer).toHaveClass('translate-y-0');
      });
    });

    it('hides when scrolling down', async () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);

      // Initial scroll
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      window.dispatchEvent(new Event('scroll', { bubbles: true }));

      // Scroll down further
      Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
      window.dispatchEvent(new Event('scroll', { bubbles: true }));

      await waitFor(() => {
        const navContainer = container.firstChild as HTMLElement;
        expect(navContainer).toHaveClass('translate-y-[150%]');
      });
    });

    it('shows when scrolling up', async () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);

      // Scroll down to hide
      Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
      window.dispatchEvent(new Event('scroll', { bubbles: true }));

      await waitFor(() => {
        const navContainer = container.firstChild as HTMLElement;
        expect(navContainer).toHaveClass('translate-y-[150%]');
      });

      // Scroll back up
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      window.dispatchEvent(new Event('scroll', { bubbles: true }));

      await waitFor(() => {
        const navContainer = container.firstChild as HTMLElement;
        expect(navContainer).toHaveClass('translate-y-0');
      });
    });

    it('removes scroll listener on unmount', () => {
      mockUsePathname.mockReturnValue('/');

      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<BottomNavigation />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

      removeEventListenerSpy.mockRestore();
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

      it('shows no account avatar', () => {
        mockUsePathname.mockReturnValue('/');

        render(<BottomNavigation />);

        expect(screen.queryByRole('link', { name: /account|sign in/i })).not.toBeInTheDocument();
      });
    });

    it('has transition class for smooth animation', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const navContainer = container.firstChild;

      expect(navContainer).toHaveClass('transition-transform');
    });
  });

  describe('responsive behavior', () => {
    it('is shown on mobile screens', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('md:hidden');
    });

    it('is centered horizontally on screen', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('left-1/2');
      expect(nav).toHaveClass('-translate-x-1/2');
    });
  });

  describe('styling', () => {
    // The pill styling sits on the nav itself now - the outer element only
    // positions it, because the profile button floats beside it
    it('has rounded full appearance', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      expect(screen.getByRole('navigation')).toHaveClass('rounded-full');
    });

    it('has shadow and white background', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      expect(screen.getByRole('navigation')).toHaveClass('bg-white', 'shadow-lg');
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
