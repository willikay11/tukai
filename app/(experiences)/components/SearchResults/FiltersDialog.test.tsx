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
  usePlaceCategories: () => ({ data: { data: { results: [{ id: 'c1', name: 'Hiking' }] } } }),
}));

const filters = (overrides: Partial<SearchFilters> = {}): SearchFilters => ({
  ...EMPTY_FILTERS,
  ...overrides,
});

const open = (current: SearchFilters = filters({ query: 'hike' })) =>
  render(<FiltersDialog filters={current} isOpen onClose={jest.fn()} onApply={onApply} />);

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

  it('hides the experience sections when only places are wanted', async () => {
    open(filters({ query: 'hike', type: 'places' }));

    expect(screen.queryByText('Experience type')).not.toBeInTheDocument();
    expect(screen.queryByText('When')).not.toBeInTheDocument();
  });

  it('clears everything without clearing the search', async () => {
    open(filters({ query: 'hike', experienceShapes: ['one'], category: 'c1' }));

    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    await userEvent.click(screen.getByRole('button', { name: /^Show all/ }));

    // A cleared filter drops its key rather than holding an undefined one
    const applied = onApply.mock.calls[0][0];
    expect(applied.query).toBe('hike');
    expect(applied.experienceShapes).toEqual([]);
    expect(applied.category).toBeUndefined();
  });

  // The dialog stays mounted, so it must follow what is in force on each open
  it('opens on the filters in force', () => {
    open(filters({ query: 'hike', experienceShapes: ['recurring'] }));

    expect(screen.getByRole('switch', { name: 'Recurring' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'One day' })).not.toBeChecked();
  });
});
