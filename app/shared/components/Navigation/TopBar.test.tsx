import React from 'react';

import { usePathname } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { TopBar } from './TopBar';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

jest.mock('@/app/shared/components/Search', () => ({ Search: () => <div>Search bar</div> }));
jest.mock('@/app/shared/components/Global/AuthActions', () => ({
  AuthActions: () => <div>Account area</div>,
}));
jest.mock('./Nav', () => ({ Nav: () => <div>Discover tabs</div> }));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

// The block holding Discover's tabs and the search
const centre = () => screen.getByText('Search bar').parentElement?.parentElement as HTMLElement;

describe('TopBar', () => {
  beforeEach(() => mockUsePathname.mockReturnValue('/'));

  it('is tagged for the pages that measure it', () => {
    const { container } = render(<TopBar />);

    expect(container.querySelector('[data-top-bar]')).not.toBeNull();
  });

  // Sticky at every width now, not only from 720px
  it('sticks to the top of the screen at every width', () => {
    const { container } = render(<TopBar />);

    expect(container.firstElementChild).toHaveClass('sticky', 'top-0', 'z-30');
    expect(container.firstElementChild?.className).not.toMatch(/min-\[720px\]:sticky/);
  });

  it('carries the logo, the account area, the tabs and the search', () => {
    render(<TopBar />);

    expect(screen.getByAltText('Tukai logo')).toBeInTheDocument();
    expect(screen.getByText('Account area')).toBeInTheDocument();
    expect(screen.getByText('Discover tabs')).toBeInTheDocument();
    expect(screen.getByText('Search bar')).toBeInTheDocument();
  });

  // Rendered once, not once per breakpoint
  it('renders one search, one set of tabs and one account area', () => {
    render(<TopBar />);

    expect(screen.getAllByText('Search bar')).toHaveLength(1);
    expect(screen.getAllByText('Discover tabs')).toHaveLength(1);
    expect(screen.getAllByText('Account area')).toHaveLength(1);
  });

  it.each(['/', '/experiences', '/places', '/moments'])(
    'shows the search and tabs on a phone on %s',
    (pathname) => {
      mockUsePathname.mockReturnValue(pathname);

      render(<TopBar />);

      expect(centre()).toHaveClass('flex');
      expect(centre()).not.toHaveClass('hidden');
    },
  );

  it.each(['/communities', '/profile', '/experiences/karura-night-hike'])(
    'keeps a phone to the logo and account area on %s',
    (pathname) => {
      mockUsePathname.mockReturnValue(pathname);

      render(<TopBar />);

      expect(centre()).toHaveClass('hidden', 'min-[720px]:flex');
    },
  );

  // Search first, tabs under it on a phone; tabs over the search from 720px
  it('puts the search above the tabs on a phone', () => {
    render(<TopBar />);

    expect(screen.getByText('Search bar').parentElement).toHaveClass(
      'order-1',
      'min-[720px]:order-none',
    );
    expect(screen.getByText('Discover tabs').parentElement).toHaveClass(
      'order-2',
      'min-[720px]:order-none',
    );
  });

  it('publishes its height for the sticky bars under it', () => {
    const { unmount } = render(<TopBar />);

    expect(document.documentElement.style.getPropertyValue('--top-bar-h')).toMatch(/^\d+px$/);

    unmount();
  });
});
