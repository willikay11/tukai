'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { render, screen, waitFor, within } from '@testing-library/react';

import { BottomNavigation } from './BottomNavigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName, size }: { iconName: string; size: number }) => (
    <span data-testid={`icon-${iconName}`}>Icon</span>
  ),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('BottomNavigation', () => {
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
      expect(links).toHaveLength(4);

      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/experiences');
      expect(links[2]).toHaveAttribute('href', '/places');
      expect(links[3]).toHaveAttribute('href', '/moments');
    });

    it('renders with correct href attributes', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = within(screen.getByRole('navigation')).getAllByRole('link');

      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/experiences');
      expect(links[2]).toHaveAttribute('href', '/places');
      expect(links[3]).toHaveAttribute('href', '/moments');
    });

    it('renders navigation icons for all links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const linkElements = within(screen.getByRole('navigation')).getAllByRole('link');
      expect(linkElements).toHaveLength(4);

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
      mockUsePathname.mockReturnValue('/experiences');

      render(<BottomNavigation />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });

      // Active link should show the label
      expect(experiencesLink).toHaveTextContent('Experiences');
    });

    it('hides label for non-active links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = screen.getAllByRole('link');
      const exploreLinkElement = links.find((link) => link.getAttribute('href') === '/places');

      // Non-active links should only have icons, not text
      expect(exploreLinkElement).not.toHaveTextContent('Explore');
    });

    it('applies active styling (background and color)', () => {
      mockUsePathname.mockReturnValue('/experiences');

      render(<BottomNavigation />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });

      expect(experiencesLink).toHaveClass('bg-lime');
      expect(experiencesLink).toHaveClass('text-primary');
    });

    it('applies inactive styling (text color)', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = screen.getAllByRole('link');
      const exploreLink = links.find((link) => link.getAttribute('href') === '/places');

      expect(exploreLink).toHaveClass('text-gray-500');
      expect(exploreLink).not.toHaveClass('bg-lime');
    });

    it('marks Experiences link as active when pathname is /experiences', () => {
      mockUsePathname.mockReturnValue('/experiences');

      render(<BottomNavigation />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });

      expect(experiencesLink).toHaveClass('bg-lime');
    });

    it('marks Places as active when pathname is /places', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /places/i })).toHaveClass('bg-lime');
    });

    it('marks Places as active for /places subpaths', () => {
      mockUsePathname.mockReturnValue('/places/123');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /places/i })).toHaveClass('bg-lime');
    });

    it('marks Moments as active when pathname is /moments', () => {
      mockUsePathname.mockReturnValue('/moments');

      render(<BottomNavigation />);

      expect(screen.getByRole('link', { name: /moments/i })).toHaveClass('bg-lime');
    });

    // Only '/' exactly — every other route starts with it
    it('marks Discover as active only on the root', () => {
      mockUsePathname.mockReturnValue('/experiences');

      render(<BottomNavigation />);

      expect(screen.queryByRole('link', { name: /discover/i })).not.toBeInTheDocument();
    });

    it('only shows one active link at a time', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<BottomNavigation />);

      const activeLinks = screen
        .getAllByRole('link')
        .filter((link) => link.className.includes('bg-lime'));

      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Places');
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
      expect(links.length).toBe(4);
    });

    it('maintains link order', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      // Same order as the desktop nav
      const links = within(screen.getByRole('navigation')).getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/experiences');
      expect(links[2]).toHaveAttribute('href', '/places');
      expect(links[3]).toHaveAttribute('href', '/moments');
    });

    it('shows meaningful label for active link', () => {
      mockUsePathname.mockReturnValue('/moments');

      render(<BottomNavigation />);

      expect(screen.getByText('Moments')).toBeInTheDocument();
    });

    // Sits outside the nav landmark: it opens an assistant, not a page of
    // content
    describe('TukAI', () => {
      it('offers the assistant alongside the destinations', () => {
        mockUsePathname.mockReturnValue('/');

        render(<BottomNavigation />);

        expect(screen.getByRole('button', { name: 'Ask TukAI' })).toBeInTheDocument();
      });

      it('is not one of the destinations', () => {
        mockUsePathname.mockReturnValue('/');

        render(<BottomNavigation />);

        const navLinks = within(screen.getByRole('navigation')).getAllByRole('link');
        expect(navLinks).toHaveLength(4);
        // Every link on the bar is a destination — TukAI is a button
        expect(screen.getAllByRole('link')).toHaveLength(4);
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
    // The pill styling sits on the nav itself now — the outer element only
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
});
