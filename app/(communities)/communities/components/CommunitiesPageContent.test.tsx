import React from 'react';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community } from '@/types/community';

import { CommunitiesPageContent } from './CommunitiesPageContent';

const push = jest.fn();
let sessionState: { data: { user: { id: string } } | null; status: string } = {
  data: { user: { id: 'u1' } },
  status: 'authenticated',
};
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

const openSignInWithCallback = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback, setOpenSignIn: jest.fn() }),
}));

// The tab lives in the URL, so the mock has to round-trip it: `replace` writes
// the query string and `useSearchParams` reads it back
let currentQuery = '';
const replace = jest.fn((url: string) => {
  currentQuery = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => '/communities',
  useSearchParams: () => new URLSearchParams(currentQuery),
}));

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => <span data-testid="photo" />,
}));

// The Following view is covered by its own tests; here only the handover
jest.mock('./FollowingTab', () => ({
  FollowingTab: ({ isSignedIn }: { isSignedIn: boolean }) => (
    <div data-testid="following-tab" data-signed-in={String(isSignedIn)} />
  ),
}));

jest.mock('./MyCommunitiesTab', () => ({
  MyCommunitiesTab: ({ isSignedIn }: { isSignedIn: boolean }) => (
    <div data-testid="mine-tab" data-signed-in={String(isSignedIn)} />
  ),
}));

const useGetCommunities = jest.fn();
const useCommunityDetail = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: (params: unknown) => useGetCommunities(params),
  // Each row asks for its own members, since the list endpoint omits them
  useCommunityDetail: (id: string, enabled: boolean) => useCommunityDetail(id, enabled),
}));

const useGetInterestCategories = jest.fn();
jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: () => useGetInterestCategories(),
}));

const HIKING = { id: 'cat-hiking', name: 'Hiking', icon: 'Directions01Icon' };
const SHOPPING = { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBasket01Icon' };

const community = (id: string, title: string, categories = [HIKING]): Community =>
  ({
    id,
    title,
    slug: `${title.toLowerCase().replace(/ /g, '-')}`,
    description: '<div>A crew that walks</div>',
    categories,
    photos: [],
    membersCount: 4,
    owners: [{ id: 'o1', firstName: 'Lily', lastName: 'W', displayName: 'Lily', picture: null }],
  }) as unknown as Community;

const refetch = jest.fn();
const respondWith = (results: Community[], isLoading = false) =>
  useGetCommunities.mockReturnValue({
    data: { success: true, data: { results } },
    isLoading,
    isFetching: false,
    refetch,
  });

// The service catches its own errors and resolves with success: false, so this
// is what a throttled or failed request actually looks like to the component
const failWith = (message: string) =>
  useGetCommunities.mockReturnValue({
    data: { success: false, status: 429, message },
    isLoading: false,
    isFetching: false,
    refetch,
  });

// A category name appears both as a filter pill and beside the icons on every
// row that carries it, so pill queries are scoped to the filter row
const typePill = (name: string) =>
  within(
    screen.getByRole('heading', { name: 'View by Type' }).closest('section') as HTMLElement,
  ).getByText(name);

describe('CommunitiesPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentQuery = '';
    sessionState = { data: { user: { id: 'u1' } }, status: 'authenticated' };
    useCommunityDetail.mockReturnValue({ data: undefined });
    useGetInterestCategories.mockReturnValue({ data: [HIKING, SHOPPING], isLoading: false });
    respondWith([community('1', 'Nairobi Hikers'), community('2', 'Mall Rats', [SHOPPING])]);
  });

  describe('header', () => {
    it('names the page', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('heading', { name: 'Communities', level: 1 })).toBeInTheDocument();
    });

    // Only on a phone: a wider screen already carries the main navigation
    it('offers a way back on small screens only', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('button', { name: 'Back' }).closest('.md\\:hidden')).toBeTruthy();
    });

    it('opens on Discover, with all three tabs', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('tab', { name: /Discover/ })).toHaveAttribute('data-state', 'active');
      expect(screen.getByRole('tab', { name: /Following/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /My Communities/ })).toBeInTheDocument();
    });
  });

  describe('the tabs the reader owns', () => {
    it('hands over to the Following view', async () => {
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(screen.getByRole('tab', { name: /Following/ }));

      expect(replace).toHaveBeenCalledWith('/communities?tab=following', expect.anything());
    });

    it('hands over to My Communities', async () => {
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(screen.getByRole('tab', { name: /My Communities/ }));

      expect(replace).toHaveBeenCalledWith('/communities?tab=mine', expect.anything());
    });

    // The tab is in the URL so it can be linked, survives a refresh, and the
    // main bottom navigation can see it
    it.each([
      ['tab=following', 'following-tab'],
      ['tab=mine', 'mine-tab'],
    ])('opens straight onto %s from the URL', (query, testId) => {
      currentQuery = query;
      render(<CommunitiesPageContent />);

      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it('drops the parameter again on Discover', async () => {
      currentQuery = 'tab=mine';
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(screen.getByRole('tab', { name: /Discover/ }));

      expect(replace).toHaveBeenCalledWith('/communities', expect.anything());
    });

    it('falls back to Discover for a tab that does not exist', () => {
      currentQuery = 'tab=nonsense';
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('heading', { name: 'All Communities' })).toBeInTheDocument();
    });

    // Nothing to fetch for a view that renders no list of its own
    it('asks the API for nothing while they are open', () => {
      currentQuery = 'tab=mine';
      render(<CommunitiesPageContent />);

      expect(useGetCommunities).toHaveBeenLastCalledWith(
        expect.objectContaining({ enabled: false }),
      );
    });
  });

  describe('creating a community', () => {
    it('offers it in the header on My Communities', () => {
      currentQuery = 'tab=mine';
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('link', { name: /Create Community/ })).toHaveAttribute(
        'href',
        '/communities/create',
      );
    });

    // The phone gets the floating one inside the tab instead
    it('keeps the header button off small screens', () => {
      currentQuery = 'tab=mine';
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('link', { name: /Create Community/ }).className).toContain(
        'hidden md:flex',
      );
    });

    it('does not offer it on the other tabs', () => {
      render(<CommunitiesPageContent />);

      expect(screen.queryByRole('link', { name: /Create Community/ })).not.toBeInTheDocument();
    });

    it('does not offer it to a reader who is not signed in', () => {
      currentQuery = 'tab=mine';
      sessionState = { data: null, status: 'unauthenticated' };
      render(<CommunitiesPageContent />);

      expect(screen.queryByRole('link', { name: /Create Community/ })).not.toBeInTheDocument();
    });
  });

  describe('what the Following view is told', () => {
    it('is told whether the reader is signed in', () => {
      currentQuery = 'tab=following';
      sessionState = { data: null, status: 'unauthenticated' };
      render(<CommunitiesPageContent />);

      expect(screen.getByTestId('following-tab')).toHaveAttribute('data-signed-in', 'false');
    });
  });

  describe('view by type', () => {
    it('offers a pill per interest category', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('heading', { name: 'View by Type' })).toBeInTheDocument();
      expect(typePill('Hiking')).toBeInTheDocument();
      expect(typePill('Shopping')).toBeInTheDocument();
    });

    it('starts on everything, with no category filter', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('heading', { name: 'All Communities' })).toBeInTheDocument();
      expect(useGetCommunities).toHaveBeenCalledWith(
        expect.objectContaining({ category: undefined }),
      );
    });

    it('narrows the list to the chosen type', async () => {
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(typePill('Hiking'));

      expect(useGetCommunities).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: ['cat-hiking'] }),
      );
      expect(await screen.findByRole('heading', { name: 'Hiking' })).toBeInTheDocument();
    });

    // There is no separate "All" pill, so the chosen one has to let go
    it('clears the filter when the chosen type is pressed again', async () => {
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(typePill('Hiking'));
      await user.click(typePill('Hiking'));

      expect(useGetCommunities).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: undefined }),
      );
    });
  });

  describe('the grid', () => {
    it('shows a card per community', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByText('Nairobi Hikers')).toBeInTheDocument();
      expect(screen.getByText('Mall Rats')).toBeInTheDocument();
    });

    // Cards in a matrix, not one per row: the page is browsed, not scanned.
    // Scoped to the listing — PageContainer is itself a 12-column grid.
    it('lays the cards out as a grid', () => {
      render(<CommunitiesPageContent />);

      const listing = screen
        .getByRole('link', { name: /Nairobi Hikers/ })
        .closest('.grid') as HTMLElement;

      expect(listing.className).toContain('sm:grid-cols-2');
      expect(listing.className).toContain('lg:grid-cols-3');
    });

    it('links each card to its community, by slug', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('link', { name: /Nairobi Hikers/ })).toHaveAttribute(
        'href',
        '/communities/nairobi-hikers',
      );
    });

    // Descriptions are stored as HTML — the markup used to leak into the card
    it('shows the description as text, not markup', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getAllByText('A crew that walks').length).toBeGreaterThan(0);
      expect(screen.queryByText(/<div>/)).not.toBeInTheDocument();
    });

    it('fetches members so the facepile shows more than the owner', () => {
      render(<CommunitiesPageContent />);

      expect(useCommunityDetail).toHaveBeenCalledWith('1', true);
    });

    it('shows skeletons while loading', () => {
      respondWith([], true);
      const { container } = render(<CommunitiesPageContent />);

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });

  describe('when nothing comes back', () => {
    it('offers a way out of a filter that found nothing', async () => {
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(typePill('Hiking'));
      respondWith([]);
      await user.click(typePill('Shopping'));

      expect(await screen.findByText('No communities under Shopping yet')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Show all communities' }));

      expect(screen.getByRole('heading', { name: 'All Communities' })).toBeInTheDocument();
    });
  });

  describe('a reader who is not signed in', () => {
    beforeEach(() => {
      sessionState = { data: null, status: 'unauthenticated' };
    });

    // Discover is public — the page used to bounce them at the door
    it('still browses Discover', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByText('Nairobi Hikers')).toBeInTheDocument();
      expect(useGetCommunities).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
    });

    it('is invited to sign in for the parts that need an account', async () => {
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(openSignInWithCallback).toHaveBeenCalled();
    });

    it('is not nagged once signed in', () => {
      sessionState = { data: { user: { id: 'u1' } }, status: 'authenticated' };
      render(<CommunitiesPageContent />);

      expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
    });
  });
});

/**
 * A 429 from the API used to render as "No communities right now" — the same
 * screen as a genuinely empty result — because the service resolves rather than
 * throws, so React Query never reports an error.
 */
describe('when the request fails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 'u1' } }, status: 'authenticated' };
    useCommunityDetail.mockReturnValue({ data: undefined });
    useGetInterestCategories.mockReturnValue({ data: [HIKING, SHOPPING], isLoading: false });
    failWith('Request was throttled. Expected available in 300 seconds.');
  });

  it('says so rather than claiming there are none', () => {
    render(<CommunitiesPageContent />);

    expect(screen.getByText('Communities could not load')).toBeInTheDocument();
    expect(screen.queryByText('No communities right now')).not.toBeInTheDocument();
  });

  it('passes on what the API said', () => {
    render(<CommunitiesPageContent />);

    expect(
      screen.getByText('Request was throttled. Expected available in 300 seconds.'),
    ).toBeInTheDocument();
  });

  it('offers a retry', async () => {
    const user = userEvent.setup();
    render(<CommunitiesPageContent />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetch).toHaveBeenCalled();
  });
});
