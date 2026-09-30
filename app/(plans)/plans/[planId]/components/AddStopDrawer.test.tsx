import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Plan } from '@/types/plan';

import { AddStopDrawer } from './AddStopDrawer';

const addStop = jest.fn();
jest.mock('@/context/PlanContext', () => ({ usePlans: () => ({ addStop }) }));

let lists: unknown[] = [];
jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useMyBucketLists: () => ({ data: { data: { results: lists } }, isLoading: false }),
}));

let results: { experiences: unknown[]; places: unknown[] } | undefined;
jest.mock('@/app/shared/hooks/useSearch', () => ({
  useSearch: () => ({ data: results, isFetching: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 'p1',
  title: 'Saturday out',
  date: '2026-07-05',
  stops: [],
  dateCreated: '2026-07-01T00:00:00Z',
  ...overrides,
});

const renderDrawer = (current: Plan = plan(), onClose = jest.fn()) =>
  render(<AddStopDrawer plan={current} isOpen onClose={onClose} />);

const savedList = [
  {
    id: 'bl1',
    name: 'Weekend Hikes',
    items: [
      {
        id: 'i1',
        position: 1,
        placeBookmark: { id: 'b1', placeId: 'pl1', placeName: 'Karura Forest' },
      },
    ],
  },
];

describe('adding a stop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lists = savedList;
    results = undefined;
  });

  it('opens on what the reader has saved', () => {
    renderDrawer();

    expect(screen.getByRole('tab', { name: 'Saved' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Karura Forest')).toBeInTheDocument();
    expect(screen.getByText(/From Weekend Hikes/)).toBeInTheDocument();
  });

  it('adds a saved place at the next free time', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(addStop).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ kind: 'place', refId: 'pl1', time: '10:00' }),
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'At 10:00 AM. Nothing was booked.' }),
    );
  });

  it('marks what is already on the plan', () => {
    renderDrawer(
      plan({ stops: [{ id: 's1', kind: 'place', refId: 'pl1', title: 'Karura Forest' }] }),
    );

    expect(screen.getByText('Added')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
  });

  it('says what to do when nothing is saved', () => {
    lists = [];
    renderDrawer();

    expect(screen.getByText(/Nothing saved yet/)).toBeInTheDocument();
  });

  it('searches Tukai, and says that adding books nothing', async () => {
    results = {
      experiences: [{ id: 'e1', title: 'Sunset hike', photos: [] }],
      places: [],
    };
    renderDrawer();

    await userEvent.click(screen.getByRole('tab', { name: 'Search' }));

    expect(
      screen.getByText('Anything listed on Tukai. Adding it never books it.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Sunset hike')).toBeInTheDocument();
  });

  it('asks for something to search for', async () => {
    results = { experiences: [], places: [] };
    renderDrawer();

    await userEvent.click(screen.getByRole('tab', { name: 'Search' }));

    expect(screen.getByText('Search for something to add.')).toBeInTheDocument();
  });

  it('says when a search matches nothing', async () => {
    results = { experiences: [], places: [] };
    renderDrawer();

    await userEvent.click(screen.getByRole('tab', { name: 'Search' }));
    await userEvent.type(screen.getByLabelText('Search Tukai'), 'zzz');

    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
  });

  /**
   * A stop of the reader's own is the point of this tab: Tukai does not list
   * picking someone up.
   */
  it('takes a stop the reader invents', async () => {
    const onClose = jest.fn();
    renderDrawer(plan(), onClose);

    await userEvent.click(screen.getByRole('tab', { name: 'Your own' }));
    await userEvent.type(screen.getByLabelText('What is it?'), 'Pick Amina up');
    await userEvent.type(screen.getByLabelText(/Where\?/), 'Westlands');
    await userEvent.click(screen.getByRole('button', { name: 'Add this stop' }));

    expect(addStop).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        kind: 'custom',
        title: 'Pick Amina up',
        subtitle: 'Westlands',
        time: '10:00',
        durationMinutes: 30,
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('says such a stop is theirs alone', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('tab', { name: 'Your own' }));
    await userEvent.type(screen.getByLabelText('What is it?'), 'Coffee');
    await userEvent.click(screen.getByRole('button', { name: 'Add this stop' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'At 10:00 AM. Only you can see this stop.' }),
    );
  });

  it('will not add a stop with no name', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('tab', { name: 'Your own' }));

    expect(screen.getByRole('button', { name: 'Add this stop' })).toBeDisabled();
  });

  // A stop lands after the last one, so the day builds up in order
  it('follows the last stop on the plan', async () => {
    renderDrawer(
      plan({
        stops: [{ id: 's1', kind: 'place', title: 'Brunch', time: '11:00', durationMinutes: 90 }],
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(addStop).toHaveBeenCalledWith('p1', expect.objectContaining({ time: '12:30' }));
  });
});
