import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketListsPageContent } from './BucketListsPageContent';

let sessionState: { data: { user: { id: string } } | null } = { data: { user: { id: 'u1' } } };
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

let search = new URLSearchParams();
const replace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/bucket-lists',
  useSearchParams: () => search,
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: () => <span />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

const needAuth = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({ useAuthDialog: () => ({ needAuth }) }));

const openBucketList = jest.fn();
const openCreateBucketList = jest.fn();
jest.mock('@/context/BucketListDrawerContext', () => ({
  useBucketListDrawer: () => ({ openBucketList, openCreateBucketList }),
}));

let publicLists: unknown[] = [];
let hasNextPage = false;
const fetchNextPage = jest.fn();
let followingLists: unknown[] = [];
let myLists: unknown[] = [];
let membership: { status: string; invitedBy?: unknown } | undefined;
const accept = jest.fn();
const decline = jest.fn();

jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useInfinitePublicBucketLists: () => ({
    data: { pages: [{ data: { results: publicLists } }] },
    isLoading: false,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: false,
  }),
  useFollowingBucketLists: () => ({
    data: { data: { results: followingLists } },
    isLoading: false,
  }),
  useMyBucketLists: () => ({ data: { data: { results: myLists } }, isLoading: false }),
  useMyBucketListMembership: () => ({ data: membership ? { data: membership } : undefined }),
  useBucketList: () => ({
    data: { data: { id: 'inv1', name: 'Mum’s 60th weekend', itemCount: 3 } },
  }),
  useAcceptBucketListInvite: () => ({ mutate: accept, isPending: false }),
  useDeclineBucketListInvite: () => ({ mutate: decline, isPending: false }),
}));

const list = (extra: Record<string, unknown> = {}) => ({
  id: 'bl1',
  name: 'Slow Sundays in Nairobi',
  visibility: 'public',
  itemCount: 6,
  memberCount: 0,
  owner: { id: 'u2', displayName: 'Otieno Ouma' },
  ...extra,
});

describe('BucketListsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 'u1' } } };
    search = new URLSearchParams();
    publicLists = [];
    hasNextPage = false;
    followingLists = [];
    myLists = [];
    membership = undefined;
  });

  it('opens on Following, with a tab panel for it', () => {
    followingLists = [list()];
    render(<BucketListsPageContent />);

    expect(screen.getByRole('heading', { level: 1, name: 'Bucket lists' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Following/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'bucket-lists-tab-following',
    );
    expect(screen.getByRole('heading', { name: 'Following' })).toBeInTheDocument();
  });

  it('names each card in full and opens it in the panel', async () => {
    followingLists = [list()];
    render(<BucketListsPageContent />);

    const card = screen.getByRole('button', {
      name: 'Slow Sundays in Nairobi, by Otieno Ouma, 6 saved',
    });
    await userEvent.click(card);

    expect(openBucketList).toHaveBeenCalledWith('bl1');
  });

  it('sends a reader who follows nothing to Discover', async () => {
    render(<BucketListsPageContent />);

    expect(screen.getByText(/You aren’t following any bucket lists yet/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Discover bucket lists' }));

    expect(replace).toHaveBeenCalledWith('/bucket-lists?tab=discover', { scroll: false });
  });

  it('moves between tabs with the arrow keys', async () => {
    render(<BucketListsPageContent />);

    screen.getByRole('tab', { name: /Following/ }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(replace).toHaveBeenCalledWith('/bucket-lists?tab=mine', { scroll: false });
  });

  describe('Discover', () => {
    beforeEach(() => {
      search = new URLSearchParams('tab=discover');
    });

    it('shows public lists the reader does not own', () => {
      publicLists = [list(), list({ id: 'mine', name: 'My own', owner: { id: 'u1' } })];
      render(<BucketListsPageContent />);

      expect(screen.getByRole('heading', { name: 'Public bucket lists' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Slow Sundays/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /My own/ })).not.toBeInTheDocument();
    });

    it('offers Show more while there are more', async () => {
      publicLists = [list()];
      hasNextPage = true;
      render(<BucketListsPageContent />);

      await userEvent.click(screen.getByRole('button', { name: 'Show more' }));

      expect(fetchNextPage).toHaveBeenCalled();
    });

    it('says so when there are none', () => {
      render(<BucketListsPageContent />);

      expect(screen.getByText('There are no public bucket lists yet.')).toBeInTheDocument();
    });
  });

  describe('My bucket lists', () => {
    beforeEach(() => {
      search = new URLSearchParams('tab=mine');
    });

    it('shows the reader’s lists with their visibility', () => {
      myLists = [
        list({
          id: 'm1',
          name: 'Saturday with my cousins',
          visibility: 'private',
          owner: { id: 'u1' },
        }),
      ];
      render(<BucketListsPageContent />);

      expect(screen.getByRole('heading', { name: 'Created by you' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Saturday with my cousins, Private, 6 saved' }),
      ).toBeInTheDocument();
    });

    it('opens Create from the empty state', async () => {
      render(<BucketListsPageContent />);

      await userEvent.click(screen.getByRole('button', { name: 'Create bucket list' }));

      expect(openCreateBucketList).toHaveBeenCalled();
    });

    it('asks a signed-out reader to sign up before creating', async () => {
      sessionState = { data: null };
      render(<BucketListsPageContent />);

      await userEvent.click(screen.getByRole('button', { name: 'Create bucket list' }));

      expect(openCreateBucketList).not.toHaveBeenCalled();
      expect(needAuth).toHaveBeenCalledWith('lists', expect.any(Function));
    });
  });

  describe('an invite', () => {
    beforeEach(() => {
      search = new URLSearchParams('invite=inv1');
      membership = { status: 'pending', invitedBy: { id: 'u5', firstName: 'Amina' } };
    });

    it('shows the banner and a badge on Following', () => {
      render(<BucketListsPageContent />);

      expect(screen.getByText('Amina invited you to Mum’s 60th weekend')).toBeInTheDocument();
      expect(screen.getByText('Private list, 3 ideas')).toBeInTheDocument();
      expect(screen.getByLabelText('1 invite waiting')).toBeInTheDocument();
      // The banner stands in for the empty state
      expect(screen.queryByText(/You aren’t following/)).not.toBeInTheDocument();
    });

    it('accepts it', async () => {
      render(<BucketListsPageContent />);

      await userEvent.click(screen.getByRole('button', { name: 'Accept' }));

      expect(accept).toHaveBeenCalledWith('inv1', expect.anything());
    });

    it('hides once it is no longer pending', () => {
      membership = { status: 'accepted' };
      render(<BucketListsPageContent />);

      expect(screen.queryByText(/invited you to/)).not.toBeInTheDocument();
      expect(screen.queryByLabelText('1 invite waiting')).not.toBeInTheDocument();
    });
  });
});
