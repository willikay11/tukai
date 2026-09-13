import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community } from '@/types/community';

import { COMMUNITY_GRID } from '../grid';
import { CommunityFeedTab } from './index';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 'me' } } }) }));

const openSignInWithCallback = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback, setOpenSignIn: jest.fn() }),
}));

const useGetCommunities = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: (params: unknown) => useGetCommunities(params),
  useCommunityDetail: () => ({ data: undefined }),
}));

// useQueries is handed one config per community; the mock runs each queryFn so
// the fan-out itself is what gets exercised
const fetchExperiences = jest.fn();
const fetchMoments = jest.fn();
jest.mock('@/services/experience', () => ({
  fetchExperiences: (params: unknown) => fetchExperiences(params),
}));
jest.mock('@/services/moments', () => ({
  fetchMoments: (params: unknown) => fetchMoments(params),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueries: ({ queries }: { queries: { queryFn: () => unknown; enabled: boolean }[] }) =>
    queries.map((query) => ({
      data: query.enabled ? query.queryFn() : undefined,
      isLoading: false,
      dataUpdatedAt: 1,
    })),
}));

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => <span data-testid="photo" />,
}));

jest.mock('@/app/shared/components/Moments', () => ({
  MomentsMasonry: ({
    moments,
    columnsClassName,
  }: {
    moments: { id: string }[];
    columnsClassName?: string;
  }) => <div data-testid="masonry" data-count={moments.length} data-columns={columnsClassName} />,
}));

jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <span data-testid="bookmark" />,
}));

const community = (id: string, title: string): Community =>
  ({
    id,
    slug: id,
    title,
    description: 'A crew',
    categories: [],
    photos: [],
    membersCount: 3,
    owners: [],
  }) as unknown as Community;

const experience = (id: string, startDate: string, title = id) => ({
  id,
  slug: id,
  title,
  startDate,
  endDate: startDate,
  photos: [],
  priceStartsFrom: { amount: 100, currency: 'KES' },
  hostCommunity: { id: 'c1', title: 'Kanunga + Twin Falls' },
});

const refetch = jest.fn();
const following = (communities: Community[], isLoading = false) =>
  useGetCommunities.mockReturnValue({
    data: { success: true, data: { results: communities } },
    isLoading,
    isFetching: false,
    refetch,
  });

// The Following wrapper's own props; My Communities passes the same shape with
// `createdBy` instead
const renderTab = (props: Partial<React.ComponentProps<typeof CommunityFeedTab>> = {}) =>
  render(
    <CommunityFeedTab
      isSignedIn
      query={{ following: true }}
      listHeading="Following"
      signedOutMessage="Sign in to see the communities you follow"
      signedOutBlurb="What they have coming up, and the moments they post, all in one place."
      emptyMessage="You are not following any communities yet"
      failureMessage="Your communities could not load"
      {...props}
    />,
  );

describe('CommunityFeedTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    following([community('c1', 'Kanunga + Twin Falls'), community('c2', 'Evo owners club')]);
    fetchExperiences.mockReturnValue({ data: { results: [] } });
    fetchMoments.mockReturnValue({ data: { results: [] } });
  });

  it('asks only for the communities the reader follows', () => {
    renderTab();

    expect(useGetCommunities).toHaveBeenCalledWith(
      expect.objectContaining({ following: true, enabled: true }),
    );
  });

  it('lists them as cards', () => {
    renderTab();

    expect(screen.getByRole('heading', { name: 'Following' })).toBeInTheDocument();
    expect(screen.getByText('Kanunga + Twin Falls')).toBeInTheDocument();
    expect(screen.getByText('Evo owners club')).toBeInTheDocument();
  });

  // The same grid Discover uses — switching tabs should not re-flow the page
  it('lays them out in the shared community grid', () => {
    renderTab();

    const grid = screen.getByText('Evo owners club').closest(`.${COMMUNITY_GRID.split(' ')[0]}`);
    expect(grid?.className).toContain(COMMUNITY_GRID);
  });

  // The masonry defaults to three columns, which on a full-width page made each
  // tile enormous
  it('packs the moments tighter than the moments page does', () => {
    fetchMoments.mockReturnValue({
      data: {
        results: [{ id: 'm1', title: 'One', media: [{ id: 'a', photo: 'https://cdn/a.jpg' }] }],
      },
    });

    renderTab();

    expect(screen.getByTestId('masonry')).toHaveAttribute(
      'data-columns',
      'columns-3 gap-3 md:columns-4 xl:columns-5',
    );
  });

  describe('signed out', () => {
    it('asks the reader to sign in, and fetches nothing', () => {
      renderTab({ isSignedIn: false });

      expect(screen.getByText('Sign in to see the communities you follow')).toBeInTheDocument();
      expect(useGetCommunities).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    });

    // A message with no way to act on it leaves the reader stuck on the tab
    it('gives them a way to do it', async () => {
      const user = userEvent.setup();
      renderTab({ isSignedIn: false });

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(openSignInWithCallback).toHaveBeenCalled();
    });

    it('says what signing in gets them', () => {
      renderTab({ isSignedIn: false });

      expect(screen.getByText(/What they have coming up/)).toBeInTheDocument();
    });
  });

  it('says so when the reader follows nobody', () => {
    following([]);
    renderTab();

    expect(screen.getByText('You are not following any communities yet')).toBeInTheDocument();
  });

  /**
   * Neither /experiences/ nor /moments/ can be asked about more than one
   * community at a time — a repeated `community` is last-wins and a
   * comma-joined one is a 400 — so the feeds fan out, one request each.
   */
  describe('the feeds', () => {
    it('asks each followed community for its own experiences', () => {
      renderTab();

      expect(fetchExperiences).toHaveBeenCalledWith(expect.objectContaining({ community: 'c1' }));
      expect(fetchExperiences).toHaveBeenCalledWith(expect.objectContaining({ community: 'c2' }));
    });

    it('caps the fan-out, however many are followed', () => {
      following(Array.from({ length: 20 }, (_, i) => community(`c${i}`, `Crew ${i}`)));
      renderTab();

      expect(fetchExperiences).toHaveBeenCalledTimes(6);
      expect(fetchMoments).toHaveBeenCalledTimes(6);
    });

    it('merges them soonest first, so the section reads as a calendar', () => {
      fetchExperiences
        .mockReturnValueOnce({ data: { results: [experience('late', '2026-12-01T09:00:00Z')] } })
        .mockReturnValueOnce({ data: { results: [experience('soon', '2026-09-22T09:00:00Z')] } });

      renderTab();

      const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
      expect(titles).toContain('Happening in your Communities');

      const cards = screen.getAllByText(/^(soon|late)$/).map((node) => node.textContent);
      expect(cards).toEqual(['soon', 'late']);
    });

    it('hides the section when nothing is happening', () => {
      renderTab();

      expect(
        screen.queryByRole('heading', { name: 'Happening in your Communities' }),
      ).not.toBeInTheDocument();
    });

    it('only shows moments that have a photo to show', () => {
      fetchMoments.mockReturnValue({
        data: {
          results: [
            { id: 'm1', title: 'One', media: [{ id: 'a', photo: 'https://cdn/a.jpg' }] },
            { id: 'm2', title: 'Two', media: [{ id: 'b', photo: null }] },
          ],
        },
      });

      renderTab();

      // Two communities fanned out, one usable moment each
      expect(screen.getByTestId('masonry')).toHaveAttribute('data-count', '2');
    });
  });

  describe('show more', () => {
    it('holds the list back until asked', async () => {
      following(Array.from({ length: 7 }, (_, i) => community(`c${i}`, `Crew ${i}`)));
      const user = userEvent.setup();
      renderTab();

      expect(screen.queryByText('Crew 5')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Show More/ }));

      expect(screen.getByText('Crew 5')).toBeInTheDocument();
    });

    it('does not offer it for a short list', () => {
      renderTab();

      expect(screen.queryByRole('button', { name: /Show More/ })).not.toBeInTheDocument();
    });
  });

  // The service resolves with success: false rather than throwing, so a failed
  // request used to look exactly like following nobody
  describe('when the request fails', () => {
    beforeEach(() => {
      useGetCommunities.mockReturnValue({
        data: { success: false, status: 429, message: 'Request was throttled.' },
        isLoading: false,
        isFetching: false,
        refetch,
      });
    });

    it('says so rather than claiming the reader follows nobody', () => {
      renderTab();

      expect(screen.getByText('Your communities could not load')).toBeInTheDocument();
      expect(
        screen.queryByText('You are not following any communities yet'),
      ).not.toBeInTheDocument();
    });

    it('offers a retry', async () => {
      const user = userEvent.setup();
      renderTab();

      await user.click(screen.getByRole('button', { name: 'Try again' }));

      expect(refetch).toHaveBeenCalled();
    });
  });
});
