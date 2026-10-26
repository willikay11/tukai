import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EMPTY_FILTERS, SearchFilters } from '@/types/search';

import { Search } from './Search';

const push = jest.fn();
const replace = jest.fn();
let pathname = '/';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(),
}));

// The city picker is its own unit (CityPicker.test.tsx); this suite is about
// the rest of the bar
jest.mock('./CityPicker', () => ({ CityPicker: () => null }));

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverAnchor: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Its own unit (FiltersDialog.test.tsx); this suite is about the bar's own
// Filters button and where applying a filter sends the reader - not the
// sections inside the panel. Mocking the file rather than the barrel keeps
// the barrel's other export, SimplePillFilters, real - the type tabs below
// are this suite's own business.
jest.mock('@/app/shared/components/Filters/FiltersDialog', () => ({
  FiltersDialog: ({
    filters,
    isOpen,
    onApply,
    children,
  }: {
    filters: SearchFilters;
    isOpen: boolean;
    onApply: (next: SearchFilters) => void;
    children: React.ReactNode;
  }) => (
    <>
      {children}
      {isOpen && (
        <div>
          filters open
          {/* Stands in for the panel's own "Looking for" pills, just enough
              to see what default `type` this bar opened it with */}
          <p>Looking for: {filters.type}</p>
          <button
            type="button"
            onClick={() => onApply({ ...EMPTY_FILTERS, experienceShapes: ['itinerary'] })}
          >
            Show all
          </button>
        </div>
      )}
    </>
  ),
}));

jest.mock('@/context/SelectedCategoryContext', () => ({
  useSelectedCategory: () => ({ setSelectedCitySearchId: jest.fn() }),
}));
jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({
    lat: undefined,
    lng: undefined,
    status: 'idle',
    city: 'Nairobi',
    requestLocation: jest.fn(),
  }),
}));

describe('Search bar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pathname = '/';
  });

  describe('before typing', () => {
    it('is just a field - no results, no popover', () => {
      render(<Search />);

      expect(screen.getByRole('textbox', { name: 'Search Tukai' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Experiences/ })).not.toBeInTheDocument();
    });

    // The canvas sets the query at 13.5px/500 inside the bar
    it('sets the field text to the canvas size', () => {
      render(<Search />);

      const field = screen.getByRole('textbox', { name: 'Search Tukai' });
      expect(field).toHaveClass('text-[13.5px]', 'font-medium');
    });
  });

  /**
   * Results never render in the bar itself - submitting is the whole answer,
   * the same way a filter's "Show all" sends the reader to Discover. A
   * pause in typing submits on its own; Enter and the button just skip the
   * wait.
   */
  describe('submitting a search', () => {
    it('navigates to Discover with the typed query on Enter', async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(screen.getByRole('textbox', { name: 'Search Tukai' }), 'karura{Enter}');

      expect(replace).toHaveBeenCalledWith('/?q=karura');
    });

    it('navigates when the search button is pressed', async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(screen.getByRole('textbox', { name: 'Search Tukai' }), 'karura');
      await user.click(screen.getByRole('button', { name: 'Search' }));

      expect(replace).toHaveBeenCalledWith('/?q=karura');
    });

    it('does nothing on an empty field', async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(screen.getByRole('textbox', { name: 'Search Tukai' }), '{Enter}');

      expect(replace).not.toHaveBeenCalled();
    });

    it('disables the search button until something is typed', () => {
      render(<Search />);

      expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
    });

    // No Enter, no click - just a pause after typing
    it('navigates on its own once typing pauses', async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(screen.getByRole('textbox', { name: 'Search Tukai' }), 'karura');

      expect(replace).not.toHaveBeenCalled();
      await waitFor(() => expect(replace).toHaveBeenCalledWith('/?q=karura'), { timeout: 2000 });
    });

    // Each keystroke resets the wait rather than queuing a navigation of its
    // own, so a sentence typed out doesn't fire once per letter
    it('collapses a run of keystrokes into a single navigation', async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(screen.getByRole('textbox', { name: 'Search Tukai' }), 'karura forest');

      await waitFor(() => expect(replace).toHaveBeenCalledWith('/?q=karura+forest'), {
        timeout: 2000,
      });
      expect(replace).toHaveBeenCalledTimes(1);
    });

    // Enter should not leave a pending navigation to fire a second time
    // right after the one it already made
    it('cancels the pending debounce when Enter already submitted', async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(screen.getByRole('textbox', { name: 'Search Tukai' }), 'karura{Enter}');
      expect(replace).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => setTimeout(resolve, 600));
      expect(replace).toHaveBeenCalledTimes(1);
    });
  });

  describe('Filters dialog', () => {
    it('opens from the bar’s own Filters button', async () => {
      const user = userEvent.setup();
      render(<Search />);

      expect(screen.queryByText('filters open')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Filters' }));

      expect(screen.getByText('filters open')).toBeInTheDocument();
    });

    // Filters live in the URL on Discover, so applying one is a navigation.
    // What the panel itself offers is FiltersDialog's own unit.
    it('sends the reader to Discover with the chosen filters in the URL', async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.click(screen.getByRole('button', { name: 'Filters' }));
      await user.click(screen.getByRole('button', { name: 'Show all' }));

      expect(push).toHaveBeenCalledWith('/?xtype=itinerary');
    });

    /**
     * "Looking for" starts on whichever tab the reader is already browsing,
     * same as the design spec: Experiences on Experiences, Places on Places,
     * Everything everywhere else.
     */
    describe('the "Looking for" default', () => {
      it('starts on Experiences, on the Experiences page', async () => {
        pathname = '/experiences';
        const user = userEvent.setup();
        render(<Search />);

        await user.click(screen.getByRole('button', { name: 'Filters' }));

        expect(screen.getByText('Looking for: experiences')).toBeInTheDocument();
      });

      // A detail page is still within the Experiences tab
      it('starts on Experiences under an experience detail page too', async () => {
        pathname = '/experiences/sunrise-hike';
        const user = userEvent.setup();
        render(<Search />);

        await user.click(screen.getByRole('button', { name: 'Filters' }));

        expect(screen.getByText('Looking for: experiences')).toBeInTheDocument();
      });

      it('starts on Places, on the Places page', async () => {
        pathname = '/places';
        const user = userEvent.setup();
        render(<Search />);

        await user.click(screen.getByRole('button', { name: 'Filters' }));

        expect(screen.getByText('Looking for: places')).toBeInTheDocument();
      });

      it('starts on Everything everywhere else', async () => {
        pathname = '/moments';
        const user = userEvent.setup();
        render(<Search />);

        await user.click(screen.getByRole('button', { name: 'Filters' }));

        expect(screen.getByText('Looking for: all')).toBeInTheDocument();
      });
    });
  });
});
