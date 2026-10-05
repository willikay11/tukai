import { usePathname } from 'next/navigation';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Nav } from './Nav';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

const at = (pathname: string) => {
  mockUsePathname.mockReturnValue(pathname);
  render(<Nav />);
};

/**
 * The canvas holds these four as tabs on one route and switches them in state.
 * Here they stay four addressable routes, so the strip reads as a tablist and
 * behaves as links - a deep link still lands, and back still means something.
 */
describe('the Discover tab strip', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is a tablist, named for what it switches', () => {
    at('/');

    expect(screen.getByRole('tablist', { name: 'Discover' })).toBeInTheDocument();
  });

  it('offers the four faces of Discover, in order', () => {
    at('/');

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Discover',
      'Experiences',
      'Places',
      'Moments',
    ]);
  });

  it('keeps each one at the URL it already had', () => {
    at('/');

    const href = (name: string) => screen.getByRole('tab', { name }).getAttribute('href');

    expect(href('Discover')).toBe('/');
    expect(href('Experiences')).toBe('/experiences');
    expect(href('Places')).toBe('/places');
    expect(href('Moments')).toBe('/moments');
  });

  it.each([
    ['/', 'Discover'],
    ['/experiences', 'Experiences'],
    ['/places', 'Places'],
    ['/moments', 'Moments'],
  ])('marks the tab for %s as selected', (pathname, label) => {
    at(pathname);

    expect(screen.getByRole('tab', { name: label })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps a tab selected on a path beneath it', () => {
    at('/places/kraftory-biergarten');

    expect(screen.getByRole('tab', { name: 'Places' })).toHaveAttribute('aria-selected', 'true');
  });

  /**
   * Discover is the root. Matching by prefix would select it everywhere, which
   * is the bug this guards.
   */
  it('selects Discover on the root alone', () => {
    at('/experiences/sunrise-hike');

    expect(screen.getByRole('tab', { name: 'Discover' })).toHaveAttribute('aria-selected', 'false');
  });

  it('selects exactly one at a time', () => {
    at('/places');

    const selected = screen
      .getAllByRole('tab')
      .filter((tab) => tab.getAttribute('aria-selected') === 'true');

    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent('Places');
  });

  // The canvas gives the chosen tab a deeper green ground and green text
  it('gives the chosen tab the canvas pill, and the rest the resting one', () => {
    at('/');

    expect(screen.getByRole('tab', { name: 'Discover' })).toHaveClass('bg-surface-tab');
    expect(screen.getByRole('tab', { name: 'Places' })).toHaveClass('bg-surface');
    expect(screen.getByRole('tab', { name: 'Places' })).not.toHaveClass('bg-surface-tab');
  });

  it('hides below md, where the bottom bar takes over', () => {
    at('/');

    expect(screen.getByRole('tablist')).toHaveClass('hidden');
    expect(screen.getByRole('tablist')).toHaveClass('md:flex');
  });

  it('is reachable from the keyboard', async () => {
    at('/');

    await userEvent.tab();

    expect(screen.getByRole('tab', { name: 'Discover' })).toHaveFocus();
  });
});
