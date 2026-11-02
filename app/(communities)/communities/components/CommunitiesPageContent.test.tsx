import React from 'react';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community } from '@/types/community';

import { CommunitiesPageContent } from './CommunitiesPageContent';

let sessionState: {
  data: { user: { id: string } } | null;
  status: string;
} = {
  data: { user: { id: 'u1' } },
  status: 'authenticated',
};
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

const needAuth = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ needAuth }),
}));

let locationState: { city?: string; setCity: (city: string) => void } = {
  city: 'Nairobi',
  setCity: jest.fn(),
};
jest.mock('@/context/LocationContext', () => ({
  useLocation: () => locationState,
}));

// The tab lives in the URL, so the mock has to round-trip it: `replace` writes
// the query string and `useSearchParams` reads it back
let currentQuery = '';
const replace = jest.fn((url: string) => {
  currentQuery = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace }),
  usePathname: () => '/communities',
  useSearchParams: () => new URLSearchParams(currentQuery),
}));

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => <span data-testid="photo" />,
}));

// The Following and My Communities views are covered by their own tests;
// here only the handover between tabs
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
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: (params: unknown) => useGetCommunities(params),
  useCommunityDetail: () => ({ data: undefined }),
}));

let interests: { id: string; name: string; icon?: string }[] = [];
jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: () => ({ data: interests }),
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCategories: () => ({ data: { data: { results: [] } }, isLoading: false }),
}));

const community = (
  id: string,
  title: string,
  overrides: Partial<Community> = {},
): Community =>
  ({
    id,
    title,
    slug: `${title.toLowerCase().replace(/ /g, '-')}`,
    description: '<div>A crew that walks</div>',
    categories: [{ id: 'cat-hiking', name: 'Hiking', icon: 'Directions01Icon' }],
    isPublic: true,
    photos: [],
    membersCount: 4,
    location: { city: 'Nairobi' } as Community['location'],
    owners: [{ id: 'o1', firstName: 'Lily', lastName: 'W', displayName: 'Lily', picture: null }],
    ...overrides,
  }) as unknown as Community;

const refetch = jest.fn();

// The Discover tab fires three `useGetCommunities` calls (the pool, the
// following-exclusion set, the owned-exclusion set) - the mock tells them
// apart by which flag is set, the same way the real params do.
const respondWith = (pool: Community[], { isLoading = false, isFailed = false } = {}) => {
  useGetCommunities.mockImplementation(
    (params: { following?: boolean; createdBy?: string; enabled?: boolean }) => {
      // A disabled query fetches nothing, same as the real hook
      if (!params.enabled) {
        return { data: undefined, isLoading: false, isFetching: false, refetch };
      }

      if (params.following || params.createdBy) {
        return {
          data: { success: true, data: { results: [] } },
          isLoading: false,
          isFetching: false,
          refetch,
        };
      }

      if (isFailed) {
        return {
          data: { success: false, status: 429, message: 'Request was throttled.' },
          isLoading: false,
          isFetching: false,
          refetch,
        };
      }

      return {
        data: { success: true, data: { results: pool } },
        isLoading,
        isFetching: false,
        refetch,
      };
    },
  );
};

const typeChip = (name: string) =>
  within(screen.getByRole('group', { name: 'Community types' })).getByText(name);

// "Nairobi Hikers" matches both the all-communities and view-by-type pools, so
// queries scoped to one section have to say which
const allSection = () =>
  within(screen.getByRole('heading', { name: 'All communities' }).closest('section') as HTMLElement);

describe('CommunitiesPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentQuery = '';
    interests = [];
    sessionState = { data: { user: { id: 'u1' } }, status: 'authenticated' };
    locationState = { city: 'Nairobi', setCity: jest.fn() };
    respondWith([community('1', 'Nairobi Hikers'), community('2', 'Mall Rats')]);
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

      expect(screen.getByRole('tab', { name: /Discover/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
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

      expect(screen.getByRole('heading', { name: 'All communities' })).toBeInTheDocument();
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

  describe('Discover - all communities', () => {
    it('shows a card per community', () => {
      render(<CommunitiesPageContent />);

      expect(allSection().getByText('Nairobi Hikers')).toBeInTheDocument();
      expect(allSection().getByText('Mall Rats')).toBeInTheDocument();
    });

    it('links each card to its community, by slug', () => {
      render(<CommunitiesPageContent />);

      expect(allSection().getByRole('link', { name: /Nairobi Hikers/ })).toHaveAttribute(
        'href',
        '/communities/nairobi-hikers',
      );
    });

    it('includes communities from every city', () => {
      respondWith([
        community('1', 'Nairobi Hikers'),
        community('2', 'Kilifi Sailors', { location: { city: 'Kilifi' } as Community['location'] }),
      ]);
      render(<CommunitiesPageContent />);

      expect(allSection().getByText('Nairobi Hikers')).toBeInTheDocument();
      expect(allSection().getByText('Kilifi Sailors')).toBeInTheDocument();
    });

    it('says so when there are none', () => {
      respondWith([]);
      render(<CommunitiesPageContent />);

      expect(screen.getByText('No communities to discover yet.')).toBeInTheDocument();
    });

    it('shows skeletons while loading', () => {
      respondWith([], { isLoading: true });
      const { container } = render(<CommunitiesPageContent />);

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });

  describe('Discover - view by type', () => {
    it('offers one chip per interest that has a community', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('heading', { name: 'View by type' })).toBeInTheDocument();
      expect(typeChip('Hiking')).toBeInTheDocument();
    });

    // It is the filter, so it stays even when nothing is tagged yet
    it('offers every interest, including ones no community carries', () => {
      interests = [{ id: 'cat-sailing', name: 'Sailing' }];
      respondWith([community('1', 'Nairobi Hikers', { categories: [] })]);
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('heading', { name: 'View by type' })).toBeInTheDocument();
      expect(typeChip('Sailing')).toBeInTheDocument();
      expect(screen.getByText('No sailing communities yet.')).toBeInTheDocument();
    });

    it('still shows when there are no interests at all', () => {
      respondWith([community('1', 'Nairobi Hikers', { categories: [] })]);
      render(<CommunitiesPageContent />);

      expect(screen.getByRole('heading', { name: 'View by type' })).toBeInTheDocument();
      expect(screen.getByText('No types to filter by yet.')).toBeInTheDocument();
    });

    it('starts on a type that has communities', () => {
      interests = [
        { id: 'cat-sailing', name: 'Sailing' },
        { id: 'cat-hiking', name: 'Hiking' },
      ];
      render(<CommunitiesPageContent />);

      expect(typeChip('Hiking').closest('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('when the Discover pool fails to load', () => {
    beforeEach(() => {
      respondWith([], { isFailed: true });
    });

    it('says so rather than claiming there are none', () => {
      render(<CommunitiesPageContent />);

      expect(screen.getByText('Communities could not load')).toBeInTheDocument();
      expect(screen.queryByText('All communities')).not.toBeInTheDocument();
    });

    it('offers a retry', async () => {
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(screen.getByRole('button', { name: 'Try again' }));

      expect(refetch).toHaveBeenCalled();
    });
  });

  describe('a reader who is not signed in', () => {
    beforeEach(() => {
      sessionState = { data: null, status: 'unauthenticated' };
    });

    // Discover is public - the page used to bounce them at the door
    it('still browses Discover', () => {
      render(<CommunitiesPageContent />);

      expect(allSection().getByText('Nairobi Hikers')).toBeInTheDocument();
    });

    it('is invited to sign in for the parts that need an account', async () => {
      const user = userEvent.setup();
      render(<CommunitiesPageContent />);

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(needAuth).toHaveBeenCalled();
    });

    it('is not nagged once signed in', () => {
      sessionState = { data: { user: { id: 'u1' } }, status: 'authenticated' };
      render(<CommunitiesPageContent />);

      expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
    });
  });
});
