'use client';

import { render, screen, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
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

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);

      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/places');
      expect(links[2]).toHaveAttribute('href', '/communities');
    });

    it('renders with correct href attributes', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = screen.getAllByRole('link');

      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/places');
      expect(links[2]).toHaveAttribute('href', '/communities');
    });

    it('renders navigation icons for all links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const linkElements = screen.getAllByRole('link');
      expect(linkElements).toHaveLength(3);

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
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });

      // Active link should show the label
      expect(experiencesLink).toHaveTextContent('Experiences');
    });

    it('hides label for non-active links', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const exploreLink = screen.getByRole('link', { name: '' });
      const links = screen.getAllByRole('link');
      const exploreLinkElement = links.find((link) => link.getAttribute('href') === '/places');

      // Non-active links should only have icons, not text
      expect(exploreLinkElement).not.toHaveTextContent('Explore');
    });

    it('applies active styling (background and color)', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });

      expect(experiencesLink).toHaveClass('bg-[#D4F1E8]');
      expect(experiencesLink).toHaveClass('text-primary');
    });

    it('applies inactive styling (text color)', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = screen.getAllByRole('link');
      const exploreLink = links.find((link) => link.getAttribute('href') === '/places');

      expect(exploreLink).toHaveClass('text-gray-600');
      expect(exploreLink).not.toHaveClass('bg-[#D4F1E8]');
    });

    it('marks Experiences link as active when pathname is /', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const experiencesLink = screen.getByRole('link', { name: /experiences/i });

      expect(experiencesLink).toHaveClass('bg-[#D4F1E8]');
    });

    it('marks Explore link as active when pathname is /places', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<BottomNavigation />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });

      expect(exploreLink).toHaveClass('bg-[#D4F1E8]');
    });

    it('marks Explore link as active for /places subpaths', () => {
      mockUsePathname.mockReturnValue('/places/123');

      render(<BottomNavigation />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });

      expect(exploreLink).toHaveClass('bg-[#D4F1E8]');
    });

    it('marks Communities link as active when pathname is /communities', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      const communitiesLink = screen.getByRole('link', { name: /communities/i });

      expect(communitiesLink).toHaveClass('bg-[#D4F1E8]');
    });

    it('only shows one active link at a time', () => {
      mockUsePathname.mockReturnValue('/places');

      render(<BottomNavigation />);

      const activeLinks = screen.getAllByRole('link').filter((link) =>
        link.className.includes('bg-[#D4F1E8]')
      );

      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Explore');
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

      const links = screen.getAllByRole('link');
      expect(links.length).toBe(3);
    });

    it('maintains link order', () => {
      mockUsePathname.mockReturnValue('/');

      render(<BottomNavigation />);

      const links = screen.getAllByRole('link');
      // First link should be Experiences (href="/")
      expect(links[0]).toHaveAttribute('href', '/');
      // Second link should be Explore (href="/places")
      expect(links[1]).toHaveAttribute('href', '/places');
      // Third link should be Communities
      expect(links[2]).toHaveAttribute('href', '/communities');
    });

    it('shows meaningful label for active link', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      expect(screen.getByText('Communities')).toBeInTheDocument();
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
    it('has rounded full appearance', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('rounded-full');
    });

    it('has shadow and white background', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('bg-white');
      expect(nav).toHaveClass('shadow-lg');
    });

    it('has z-index 50 for proper layering', () => {
      mockUsePathname.mockReturnValue('/');

      const { container } = render(<BottomNavigation />);
      const nav = container.firstChild;

      expect(nav).toHaveClass('z-50');
    });
  });
});
