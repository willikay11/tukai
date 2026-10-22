import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MomentAttachPicker } from './MomentAttachPicker';

const useMomentAttachSearch = jest.fn();
jest.mock('./useMomentAttachSearch', () => ({
  useMomentAttachSearch: (...args: unknown[]) => useMomentAttachSearch(...args),
}));

const onSelect = jest.fn();
const onClose = jest.fn();

describe('MomentAttachPicker', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists what the search turns up, with its meta line', () => {
    useMomentAttachSearch.mockReturnValue({
      options: [{ id: 'pl1', label: 'Karura Forest', meta: 'Park · Nairobi' }],
      total: 1,
      isLoading: false,
      isSearching: false,
      hasNoCommunities: false,
    });

    render(<MomentAttachPicker kind="place" onSelect={onSelect} onClose={onClose} />);

    expect(screen.getByText('Karura Forest')).toBeInTheDocument();
    expect(screen.getByText('Park · Nairobi')).toBeInTheDocument();
  });

  it('picks a row and hands it straight back', async () => {
    useMomentAttachSearch.mockReturnValue({
      options: [{ id: 'pl1', label: 'Karura Forest', meta: 'Park · Nairobi' }],
      total: 1,
      isLoading: false,
      isSearching: false,
      hasNoCommunities: false,
    });
    const user = userEvent.setup();

    render(<MomentAttachPicker kind="place" onSelect={onSelect} onClose={onClose} />);
    await user.click(screen.getByRole('option', { name: /Karura Forest/ }));

    expect(onSelect).toHaveBeenCalledWith({ id: 'pl1', label: 'Karura Forest', meta: 'Park · Nairobi' });
  });

  it('says so when a search comes up empty', () => {
    useMomentAttachSearch.mockReturnValue({
      options: [],
      total: 0,
      isLoading: false,
      isSearching: true,
      hasNoCommunities: false,
    });

    render(<MomentAttachPicker kind="experience" onSelect={onSelect} onClose={onClose} />);

    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
  });

  it('invites joining a community rather than calling it a no-match', () => {
    useMomentAttachSearch.mockReturnValue({
      options: [],
      total: 0,
      isLoading: false,
      isSearching: false,
      hasNoCommunities: true,
    });

    render(<MomentAttachPicker kind="community" onSelect={onSelect} onClose={onClose} />);

    expect(
      screen.getByText('Join a community to share moments there. Joining is instant.'),
    ).toBeInTheDocument();
  });

  it('points out there is more to find by searching', () => {
    useMomentAttachSearch.mockReturnValue({
      options: [{ id: 'e1', label: 'Sunrise Hike', meta: 'Sat 4 Jul' }],
      total: 31,
      isLoading: false,
      isSearching: false,
      hasNoCommunities: false,
    });

    render(<MomentAttachPicker kind="experience" onSelect={onSelect} onClose={onClose} />);

    expect(screen.getByText('Showing 1 of 31. Search to find the rest.')).toBeInTheDocument();
  });

  it('closes on its own close control', async () => {
    useMomentAttachSearch.mockReturnValue({
      options: [],
      total: 0,
      isLoading: false,
      isSearching: false,
      hasNoCommunities: false,
    });
    const user = userEvent.setup();

    render(<MomentAttachPicker kind="place" onSelect={onSelect} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
