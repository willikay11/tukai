'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { fireEvent, render, screen, within } from '@testing-library/react';

import { BottomNavigation } from './BottomNavigation';

let currentQuery = '';
const push = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(currentQuery),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => (
    <span data-testid={`icon-${iconName}`}>Icon</span>
  ),
}));

// The account is read for the face on "You", and to ask a visitor to sign in
let mockSession: { user: { image: string; name: string } } | null = null;
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession }),
}));

// The face itself comes from the profile, falling back to the session's
jest.mock('@/app/shared/hooks/useAuth', () => ({
  useMyPicture: () => mockSession?.user?.image ?? null,
}));

const needAuth = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ needAuth }),
}));

const closeAllPanels = jest.fn();
jest.mock('@/app/shared/hooks/useCloseAllPanels', () => ({
  useCloseAllPanels: () => closeAllPanels,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

const bar = () => screen.getByRole('navigation', { name: 'Main' });
const links = () => within(bar()).getAllByRole('link');

describe('BottomNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = null;
    currentQuery = '';
    mockUsePathname.mockReturnValue('/');
  });

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

    expect(bar()).toBeInTheDocument();
  });

  describe('destinations', () => {
    it('links the four, in order', () => {
      expect.hasAssertions();
      render(<BottomNavigation />);

      expect(links().map((link) => link.getAttribute('href'))).toEqual([
        '/',
        '/bucket-lists',
        '/communities',
        '/profile',
      ]);
    });

    // Every destination names itself - no bare icons
    it('labels every one, current or not', () => {
      render(<BottomNavigation />);

      ['Discover', 'Bucket lists', 'Communities', 'You'].forEach((label) => {
        expect(within(bar()).getByText(label)).toBeInTheDocument();
      });
    });

    it('draws each with its own icon', () => {
      render(<BottomNavigation />);

      ['CompassIcon', 'ShoppingBasketAdd02Icon', 'UserMultipleIcon', 'UserIcon'].forEach((icon) =>
        expect(screen.getByTestId(`icon-${icon}`)).toBeInTheDocument(),
      );
    });

    // Plans is in the account menu now, not the bar
    it('carries no Plans', () => {
      render(<BottomNavigation />);

      expect(within(bar()).queryByText('Plans')).not.toBeInTheDocument();
    });

    it('carries destinations and nothing else', () => {
      render(<BottomNavigation />);

      expect(screen.getAllByRole('link')).toHaveLength(4);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('the current destination', () => {
    const current = () => links().filter((link) => link.getAttribute('aria-current') === 'page');

    it.each([
      ['/', 'Discover'],
      // Discover's other faces are routes here, and Discover stays current
      ['/experiences', 'Discover'],
      ['/places', 'Discover'],
      ['/moments', 'Discover'],
      ['/bucket-lists', 'Bucket lists'],
      ['/communities', 'Communities'],
      ['/profile', 'You'],
      ['/help', 'You'],
      ['/dashboard', 'You'],
    ])('on %s is %s, and only that', (pathname, label) => {
      mockUsePathname.mockReturnValue(pathname);

      render(<BottomNavigation />);

      expect(current()).toHaveLength(1);
      expect(current()[0]).toHaveTextContent(label);
    });

    it('is none of them on Plans', () => {
      mockUsePathname.mockReturnValue('/plans');

      render(<BottomNavigation />);

      expect(current()).toHaveLength(0);
    });

    it('takes a bold dark label and a soft pill behind its icon', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      const communities = within(bar()).getByRole('link', { name: /communities/i });
      expect(communities).toHaveClass('font-bold', 'text-brand-ink');
      expect(communities.firstElementChild).toHaveClass('bg-surface-brand', 'h-[30px]', 'w-[52px]');
    });

    it('leaves the others muted, with no pill', () => {
      mockUsePathname.mockReturnValue('/communities');

      render(<BottomNavigation />);

      const discover = within(bar()).getByRole('link', { name: /discover/i });
      expect(discover).toHaveClass('font-medium', 'text-ink-muted');
      expect(discover.firstElementChild).not.toHaveClass('bg-surface-brand');
    });
  });

  describe('You', () => {
    // The reader's face stands in for the icon, as the design has it
    it('shows the signed-in reader’s face', () => {
      mockSession = { user: { image: '/me.jpg', name: 'Ada' } };

      render(<BottomNavigation />);

      const you = within(bar()).getByRole('link', { name: /you/i });
      expect(you.querySelector('img')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-UserIcon')).not.toBeInTheDocument();
    });

    it('rings the face in green while current, white otherwise', () => {
      mockSession = { user: { image: '/me.jpg', name: 'Ada' } };
      mockUsePathname.mockReturnValue('/profile');

      const { rerender } = render(<BottomNavigation />);
      const face = () =>
        within(bar()).getByRole('link', { name: /you/i }).querySelector('img')?.parentElement;

      expect(face()).toHaveClass('ring-brand');

      mockUsePathname.mockReturnValue('/');
      rerender(<BottomNavigation />);

      expect(face()).toHaveClass('ring-white');
    });
  });

  describe('tapping', () => {
    it('closes an open panel before going', () => {
      mockSession = { user: { image: '/me.jpg', name: 'Ada' } };

      render(<BottomNavigation />);
      fireEvent.click(within(bar()).getByRole('link', { name: /communities/i }));

      expect(closeAllPanels).toHaveBeenCalled();
      expect(needAuth).not.toHaveBeenCalled();
    });

    it.each([
      ['Bucket lists', 'lists', '/bucket-lists'],
      ['You', 'profile', '/profile'],
    ])('asks a visitor to sign in before %s', (label, reason, href) => {
      render(<BottomNavigation />);

      const link = within(bar()).getByRole('link', { name: new RegExp(label, 'i') });
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(click);

      expect(click.defaultPrevented).toBe(true);
      expect(needAuth).toHaveBeenCalledWith(reason, expect.any(Function));

      // Signed in, it carries on to where it was going
      needAuth.mock.calls[0][1]();
      expect(push).toHaveBeenCalledWith(href);
    });

    it.each(['Discover', 'Communities'])('lets a visitor straight into %s', (label) => {
      render(<BottomNavigation />);

      const link = within(bar()).getByRole('link', { name: new RegExp(label, 'i') });
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(click);

      expect(click.defaultPrevented).toBe(false);
      expect(needAuth).not.toHaveBeenCalled();
    });
  });

  describe('layout', () => {
    // The phone shell breakpoint, not a Tailwind one
    it('shows below 720px only', () => {
      render(<BottomNavigation />);

      expect(bar()).toHaveClass('min-[720px]:hidden');
    });

    it('is a white bar fixed along the bottom edge, with a hairline above', () => {
      render(<BottomNavigation />);

      expect(bar()).toHaveClass(
        'fixed',
        'inset-x-0',
        'bottom-0',
        'bg-white',
        'border-t',
        'border-surface-muted',
      );
    });

    it('clears the home indicator', () => {
      render(<BottomNavigation />);

      expect(bar()).toHaveClass('pb-[calc(4px+env(safe-area-inset-bottom))]');
    });

    it('splits the four into equal columns', () => {
      render(<BottomNavigation />);

      expect(bar()).toHaveClass('grid', 'grid-cols-4');
    });

    // Every target at least 44px; the canvas makes them 60
    it('gives every item a 60px target', () => {
      render(<BottomNavigation />);

      links().forEach((link) => expect(link).toHaveClass('min-h-[60px]'));
    });

    // Over the sheets (48), under the dialogs and popovers (50)
    it('layers between the sheets and the dialogs', () => {
      render(<BottomNavigation />);

      expect(bar()).toHaveClass('z-[49]');
    });
  });

  /**
   * "My Communities" floats its own Create Community button along the bottom
   * edge. Two bars stacked on each other is the same problem a detail page's
   * booking bar has - and the tab is in the URL so this can see it.
   */
  describe('the communities tabs', () => {
    it('stands down for the create button on My Communities', () => {
      currentQuery = 'tab=mine';
      mockUsePathname.mockReturnValue('/communities');

      const { container } = render(<BottomNavigation />);

      expect(container).toBeEmptyDOMElement();
    });

    it.each(['', 'tab=following'])('still shows on the other tabs (%s)', (query) => {
      currentQuery = query;
      mockUsePathname.mockReturnValue('/communities');

      const { container } = render(<BottomNavigation />);

      expect(container).not.toBeEmptyDOMElement();
    });
  });
});
