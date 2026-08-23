import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community } from '@/types/community';

import { CommunitiesPageContent } from './CommunitiesPageContent';

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => <span data-testid="photo" />,
}));

const useGetCommunities = jest.fn();
const useCommunityDetail = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: (params: unknown) => useGetCommunities(params),
  // Each card asks for its own members, since the list endpoint omits them
  useCommunityDetail: (id: string, enabled: boolean) => useCommunityDetail(id, enabled),
}));

const HIKING = { id: 'cat-hiking', name: 'Hiking', icon: 'Directions01Icon' };
const SHOPPING = { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBasket01Icon' };

const community = (id: string, title: string, categories = [HIKING]): Community =>
  ({
    id,
    title,
    description: 'A crew',
    categories,
    photos: [],
    membersCount: 4,
    owners: [{ id: 'o1', firstName: 'Lily', lastName: 'W', displayName: 'Lily', picture: null }],
  }) as unknown as Community;

const respondWith = (results: Community[], isLoading = false) =>
  useGetCommunities.mockReturnValue({ data: { data: { results } }, isLoading });

describe('CommunitiesPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCommunityDetail.mockReturnValue({ data: undefined });
    respondWith([community('1', 'Nairobi Hikers'), community('2', 'Mall Rats', [SHOPPING])]);
  });

  describe('header', () => {
    it('names the page and its purpose', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('heading', { name: 'Communities' })).toBeInTheDocument();
      expect(screen.getByText('The crews that make every adventure better')).toBeInTheDocument();
    });

    it('offers both views, opening on My Communities', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('tab', { name: 'My Communities' })).toHaveAttribute(
        'data-state',
        'active',
      );
      expect(screen.getByRole('tab', { name: 'Recommended' })).toHaveAttribute(
        'data-state',
        'inactive',
      );
    });
  });

  describe('data', () => {
    // Both views come from one endpoint, distinguished by flag
    it('asks for the user’s own communities first', () => {
      render(<CommunitiesPageContent />);

      expect(useGetCommunities).toHaveBeenLastCalledWith(
        expect.objectContaining({ following: true, recommendedCommunities: false }),
      );
    });

    it('switches to the recommendation feed on the other tab', async () => {
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(screen.getByRole('tab', { name: 'Recommended' }));

      expect(useGetCommunities).toHaveBeenLastCalledWith(
        expect.objectContaining({ following: false, recommendedCommunities: true }),
      );
    });
  });

  describe('grouping', () => {
    it('heads each category with its name and count', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('heading', { name: 'Hiking' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Shopping' })).toBeInTheDocument();
      expect(screen.getAllByText('1 community')).toHaveLength(2);
    });

    it('pluralises the count', () => {
      respondWith([community('1', 'A'), community('2', 'B')]);

      render(<CommunitiesPageContent />);

      expect(screen.getByText('2 communities')).toBeInTheDocument();
    });

    it('lists the communities in their group', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByText('Nairobi Hikers')).toBeInTheDocument();
      expect(screen.getByText('Mall Rats')).toBeInTheDocument();
    });

    it('links each card to its community', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByText('Nairobi Hikers').closest('a')).toHaveAttribute(
        'href',
        '/communities/1',
      );
    });

    // The list endpoint returns only each community's owner, so the facepile
    // would be a single face without this
    it('fetches members so the facepile shows more than the owner', () => {
      render(<CommunitiesPageContent />);

      expect(useCommunityDetail).toHaveBeenCalledWith('1', true);
      expect(useCommunityDetail).toHaveBeenCalledWith('2', true);
    });
  });

  describe('states', () => {
    it('shows skeletons while loading', () => {
      respondWith([], true);

      const { container } = render(<CommunitiesPageContent />);

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
      expect(screen.queryByText(/haven’t joined|haven't joined/)).not.toBeInTheDocument();
    });

    // The empty state has to say which view is empty — and point somewhere
    it('offers recommendations when the user has joined nothing', () => {
      respondWith([]);

      render(<CommunitiesPageContent />);

      expect(screen.getByText("You haven't joined any communities yet")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Browse recommendations' })).toBeInTheDocument();
    });

    it('switches view from the empty state', async () => {
      respondWith([]);
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(screen.getByRole('button', { name: 'Browse recommendations' }));

      expect(screen.getByText('No recommendations right now')).toBeInTheDocument();
    });
  });
});
