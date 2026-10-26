import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EMPTY_FILTERS, SearchFilters } from '@/types/search';

import { FiltersDialog } from './FiltersDialog';

const onApply = jest.fn();

let preview: {
  experiences: unknown[];
  places: unknown[];
  communities: unknown[];
  counts: { experience: number; place: number; community: number; total: number };
};

jest.mock('@/app/shared/hooks/useSearch', () => ({
  useSearchResults: () => ({ data: preview, isFetching: false }),
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCategories: ({ group }: { group?: string }) => ({
    data: {
      data: {
        results:
          group === 'cities'
            ? [
                { id: 'ct1', name: 'Nairobi', placesCount: 33 },
                { id: 'ct2', name: 'Mombasa', placesCount: 2 },
              ]
            : [{ id: 'c1', name: 'Hiking', icon: 'HikingBootsIcon' }],
      },
    },
  }),
}));

jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({ lat: undefined, lng: undefined, requestLocation: jest.fn() }),
}));

jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: () => ({ data: { data: { results: [] } } }),
}));

const filters = (overrides: Partial<SearchFilters> = {}): SearchFilters => ({
  ...EMPTY_FILTERS,
  ...overrides,
});

const open = (current: SearchFilters = filters({ query: 'hike' })) =>
  render(
    <FiltersDialog filters={current} isOpen onClose={jest.fn()} onApply={onApply}>
      <button type="button">Open filters</button>
    </FiltersDialog>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  preview = {
    // Two one-day experiences and one itinerary
    experiences: [
      { id: 'e1', startDate: '2026-10-05T06:00:00Z', endDate: '2026-10-05T10:00:00Z' },
      { id: 'e2', startDate: '2026-10-06T06:00:00Z', endDate: '2026-10-06T10:00:00Z' },
      { id: 'e3', experienceType: 'itinerary' },
    ],
    places: [],
    communities: [],
    counts: { experience: 3, place: 6, community: 0, total: 9 },
  };
});

describe('the filters dialog', () => {
  it('is titled, and names each section', () => {
    open();

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Looking for')).toBeInTheDocument();
    expect(screen.getByText('The filters below follow your pick')).toBeInTheDocument();
    expect(screen.getByText('Experience type')).toBeInTheDocument();
    expect(screen.getByText('Pick one or more')).toBeInTheDocument();
  });

  it('counts each kind beside its pill', () => {
    open();

    expect(screen.getByRole('button', { name: /Experiences/ })).toHaveTextContent('3');
    expect(screen.getByRole('button', { name: /Places/ })).toHaveTextContent('6');
    expect(screen.getByRole('button', { name: /Everything|All/ })).toHaveTextContent('9');
  });

  it('offers the four shapes, with what each one means', () => {
    open();

    expect(screen.getByText('One day')).toBeInTheDocument();
    expect(screen.getByText('Happens once, on a single day')).toBeInTheDocument();
    expect(screen.getByText('Recurring')).toBeInTheDocument();
    expect(screen.getByText('Runs every week')).toBeInTheDocument();
    expect(screen.getByText('Multi-day')).toBeInTheDocument();
    expect(screen.getByText('Itinerary')).toBeInTheDocument();
  });

  it('picks more than one shape at a time', async () => {
    open();

    await userEvent.click(screen.getByRole('switch', { name: 'One day' }));
    await userEvent.click(screen.getByRole('switch', { name: 'Itinerary' }));
    await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ experienceShapes: ['one', 'itinerary'] }),
    );
  });

  /**
   * The API cannot narrow by day-shape, so the count has to come from the rows
   * - otherwise the button promises more than the list will show.
   */
  it('counts the shapes off the rows, not the API total', async () => {
    open();

    await userEvent.click(screen.getByRole('switch', { name: 'Itinerary' }));

    // One of the three experiences is an itinerary
    expect(screen.getByRole('button', { name: /^Show all/ })).toHaveTextContent('Show all 7');
  });

  it('turns a shape back off', async () => {
    open(filters({ query: 'hike', experienceShapes: ['one'] }));

    expect(screen.getByRole('switch', { name: 'One day' })).toBeChecked();

    await userEvent.click(screen.getByRole('switch', { name: 'One day' }));
    await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ experienceShapes: [] }));
  });

  it('hides Experience type, but not When, when only places are wanted', async () => {
    open(filters({ query: 'hike', type: 'places' }));

    expect(screen.queryByText('Experience type')).not.toBeInTheDocument();
    // When shows for every scope now, with its copy following the pick
    expect(screen.getByText('Places open on these days')).toBeInTheDocument();
  });

  it('clears everything without clearing the search', async () => {
    open(filters({ query: 'hike', experienceShapes: ['one'], city: 'c1' }));

    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

    // A cleared filter drops its key rather than holding an undefined one
    const applied = onApply.mock.calls[0][0];
    expect(applied.query).toBe('hike');
    expect(applied.experienceShapes).toEqual([]);
    expect(applied.city).toBeUndefined();
  });

  // The dialog stays mounted, so it must follow what is in force on each open
  it('opens on the filters in force', () => {
    open(filters({ query: 'hike', experienceShapes: ['recurring'] }));

    expect(screen.getByRole('switch', { name: 'Recurring' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'One day' })).not.toBeChecked();
  });

  describe('When', () => {
    it('offers the quick picks, Pick dates, and the time-of-day bands', () => {
      open();

      expect(screen.getByRole('button', { name: 'Any time' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tomorrow' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'This weekend' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next 7 days' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Pick dates/ })).toBeInTheDocument();

      // Default filters look for Everything, so both halves get a mention
      expect(screen.getByText('Time of day by start time, or open then')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Morning' })).toBeInTheDocument();
      expect(screen.getByText('Before 12 PM')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Afternoon' })).toBeInTheDocument();
      expect(screen.getByText('12 - 5 PM')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Evening' })).toBeInTheDocument();
      expect(screen.getByText('5 - 9 PM')).toBeInTheDocument();
    });

    it('is on Any time by default', () => {
      open();

      expect(screen.getByRole('button', { name: 'Any time' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('picks a quick date and applies it', async () => {
      open();

      await userEvent.click(screen.getByRole('button', { name: 'Today' }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({ quickDate: 'today', date: undefined }),
      );
    });

    it('returns to Any time clears the quick pick', async () => {
      open(filters({ query: 'hike', quickDate: 'weekend' }));

      await userEvent.click(screen.getByRole('button', { name: 'Any time' }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({ quickDate: undefined, date: undefined }),
      );
    });

    it('reveals the date picker under Pick dates', async () => {
      open();

      expect(screen.queryByText('Choose a date')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /Pick dates/ }));

      expect(screen.getByText('Choose a date')).toBeInTheDocument();
    });

    it('picks more than one time-of-day band at a time', async () => {
      open();

      await userEvent.click(screen.getByRole('switch', { name: 'Morning' }));
      await userEvent.click(screen.getByRole('switch', { name: 'Evening' }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({ timeOfDay: ['morning', 'evening'] }),
      );
    });

    it('opens on the time-of-day bands in force', () => {
      open(filters({ query: 'hike', timeOfDay: ['afternoon'] }));

      expect(screen.getByRole('switch', { name: 'Afternoon' })).toBeChecked();
      expect(screen.getByRole('switch', { name: 'Morning' })).not.toBeChecked();
    });

    it('offers Late night alongside the other three bands', () => {
      open();

      expect(screen.getByRole('switch', { name: 'Late night' })).toBeInTheDocument();
      expect(screen.getByText('After 9 PM')).toBeInTheDocument();
    });

    it('follows the Experiences-only copy when only experiences are wanted', () => {
      open(filters({ query: 'hike', type: 'experiences' }));

      expect(screen.getByText('Days with something on')).toBeInTheDocument();
      expect(screen.getByText('Time of day by start time')).toBeInTheDocument();
    });

    it('follows the Places-only copy when only places are wanted', () => {
      open(filters({ query: 'hike', type: 'places' }));

      expect(screen.getByText('Places open on these days')).toBeInTheDocument();
      expect(screen.getByText('Time of day open at some point')).toBeInTheDocument();
    });
  });

  describe('Where', () => {
    it('names the cities, with how many places are in each', () => {
      open();

      expect(screen.getByRole('button', { name: /Nairobi/ })).toHaveTextContent('33');
      expect(screen.getByRole('button', { name: /Mombasa/ })).toHaveTextContent('2');
    });

    it('picks a city', async () => {
      open();

      await userEvent.click(screen.getByRole('button', { name: /Nairobi/ }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ city: 'ct1' }));
    });

    // No `group: 'areas'` exists on the API - shown to match the canvas, not functional
    it('shows the area chips as inert', () => {
      open();

      expect(screen.getByRole('button', { name: 'Westlands' })).toBeDisabled();
    });

    it('offers a distance band, and Any distance by default', async () => {
      open();

      expect(screen.getByRole('button', { name: 'Any distance' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      await userEvent.click(screen.getByRole('button', { name: 'Within 5 km' }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ distance: '5km' }));
    });

    it('names the distance from central Nairobi until the reader grants their own', () => {
      open();

      expect(screen.getByText(/Distance measured from central Nairobi/)).toBeInTheDocument();
    });
  });

  describe('Price', () => {
    it('picks Free and Paid as mutually exclusive', async () => {
      open();

      await userEvent.click(screen.getByRole('button', { name: 'Free' }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({ freeOnly: true, paidOnly: false }),
      );
    });

    it('offers a from/to price range', () => {
      open();

      expect(screen.getByLabelText('Minimum price per person')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum price per person')).toBeInTheDocument();
    });
  });

  describe('Availability', () => {
    // Default filters look for Everything, so the row reads "Open now"
    it('toggles Open now and Spots left', async () => {
      open();

      await userEvent.click(screen.getByRole('switch', { name: 'Open now' }));
      await userEvent.click(screen.getByRole('switch', { name: 'Spots left' }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({ happeningNow: true, availableOnly: true }),
      );
    });

    it('reads Happening now when only experiences are wanted', () => {
      open(filters({ query: 'hike', type: 'experiences' }));

      expect(screen.getByRole('switch', { name: 'Happening now' })).toBeInTheDocument();
    });

    // Nothing marks this yet - shown to match the canvas, not functional
    it('shows No booking needed as inert', () => {
      open();

      expect(screen.getByRole('switch', { name: 'No booking needed' })).toBeDisabled();
    });

    it('hides the experience-only rows when only places are wanted', () => {
      open(filters({ query: 'hike', type: 'places' }));

      expect(screen.queryByRole('switch', { name: 'Spots left' })).not.toBeInTheDocument();
      expect(screen.queryByRole('switch', { name: 'No booking needed' })).not.toBeInTheDocument();
    });

    // No `isClaimed`/offer field exists on Place yet - shown to match the
    // canvas, not functional
    it('shows Takes bookings and Has an offer, as inert, for places', () => {
      open(filters({ query: 'hike', type: 'places' }));

      expect(screen.getByRole('switch', { name: 'Takes bookings' })).toBeDisabled();
      expect(screen.getByRole('switch', { name: 'Has an offer' })).toBeDisabled();
    });

    it('hides Takes bookings and Has an offer when only experiences are wanted', () => {
      open(filters({ query: 'hike', type: 'experiences' }));

      expect(screen.queryByRole('switch', { name: 'Takes bookings' })).not.toBeInTheDocument();
      expect(screen.queryByRole('switch', { name: 'Has an offer' })).not.toBeInTheDocument();
    });
  });

  describe('Interests', () => {
    it('picks more than one interest at a time', async () => {
      open();

      await userEvent.click(screen.getByRole('button', { name: /Hiking/ }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ interests: ['c1'] }));
    });
  });

  describe('Duration', () => {
    it('picks a duration band', async () => {
      open();

      await userEvent.click(screen.getByRole('button', { name: 'Up to 2 hours' }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ durationBand: 'short' }));
    });
  });

  describe('Organised by', () => {
    it('toggles Your communities and Guided tours', async () => {
      open();

      await userEvent.click(screen.getByRole('switch', { name: 'Your communities' }));
      await userEvent.click(screen.getByRole('switch', { name: 'Guided tours' }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({ yourCommunitiesOnly: true, guidedToursOnly: true }),
      );
    });

    it('still offers Your communities, but not Guided tours, for places', () => {
      open(filters({ query: 'hike', type: 'places' }));

      expect(screen.getByRole('switch', { name: 'Your communities' })).toBeEnabled();
      expect(screen.queryByRole('switch', { name: 'Guided tours' })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    // No structured field exists yet - shown to match the canvas, not functional
    it('shows Step-free access and Parking as inert', () => {
      open();

      expect(screen.getByRole('switch', { name: 'Step-free access' })).toBeDisabled();
      expect(screen.getByRole('switch', { name: 'Parking' })).toBeDisabled();
    });

    it('shows even when only experiences are wanted', () => {
      open(filters({ query: 'hike', type: 'experiences' }));

      expect(screen.getByText('Accessibility')).toBeInTheDocument();
    });
  });

  describe('Rating', () => {
    it('offers Any and the two star bands, places only', () => {
      open();

      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /4.0 and up/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /4.5 and up/ })).toBeInTheDocument();
    });

    it('picks a rating band', async () => {
      open();

      await userEvent.click(screen.getByRole('button', { name: /4.0 and up/ }));
      await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

      expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ rating: 4 }));
    });
  });

  describe('scope tags', () => {
    it('marks Price, Duration and Rating when Looking for is Everything', () => {
      open();

      expect(screen.getAllByText('Experiences only')).toHaveLength(2);
      expect(screen.getByText('Places only')).toBeInTheDocument();
    });

    it('drops the tags once a single kind is picked', () => {
      open(filters({ query: 'hike', type: 'experiences' }));

      expect(screen.queryByText('Experiences only')).not.toBeInTheDocument();
    });
  });
});
