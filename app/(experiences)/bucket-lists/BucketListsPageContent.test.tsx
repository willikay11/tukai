import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketListsPageContent } from './BucketListsPageContent';

let sessionState: { data: { user: { id: string } } | null; status: string } = {
  data: { user: { id: 'u1' } },
  status: 'authenticated',
};
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

let response: { data: { results: unknown[] } } | undefined;
let isLoading = false;

jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useMyBucketLists: () => ({ data: response, isLoading }),
  // The real one is a plain function, so it is kept rather than stubbed away
  isSharedWithMe: (list: { owner?: { id: string } }, userId?: string | null) =>
    Boolean(list.owner?.id && userId && list.owner.id !== userId),
  useJoinBucketList: () => ({ mutate: jest.fn(), isPending: false }),
  useCreateBucketList: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateBucketList: () => ({ mutate: jest.fn(), isPending: false }),
}));

const list = (extra: Record<string, unknown> = {}) => ({
  id: 'bl1',
  name: 'Weekend Hikes',
  visibility: 'private',
  itemCount: 3,
  memberCount: 0,
  owner: { id: 'u1', displayName: 'You' },
  ...extra,
});

describe('BucketListsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 'u1' } }, status: 'authenticated' };
    response = { data: { results: [list()] } };
    isLoading = false;
  });

  it('lists what the reader keeps, each opening its own page', () => {
    render(<BucketListsPageContent />);

    expect(screen.getByRole('heading', { name: 'Bucket List' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Weekend Hikes/ })).toHaveAttribute(
      'href',
      '/bucket-lists/bl1',
    );
  });

  // One endpoint returns both; the owner is what tells them apart
  it('separates the lists shared with the reader from their own', () => {
    response = {
      data: {
        results: [
          list(),
          list({
            id: 'bl2',
            name: 'Tony’s Picks',
            owner: { id: 'someone-else', displayName: 'Tony Ouma' },
            shareToken: 'tok',
          }),
        ],
      },
    };

    render(<BucketListsPageContent />);

    expect(screen.getByText('Shared with you')).toBeInTheDocument();
    expect(screen.getByText(/By Tony Ouma/)).toBeInTheDocument();
  });

  it('says nothing is shared when nothing is', () => {
    render(<BucketListsPageContent />);

    expect(screen.queryByText('Shared with you')).not.toBeInTheDocument();
  });

  it('offers a first list to someone with none', async () => {
    const user = userEvent.setup();
    response = { data: { results: [] } };

    render(<BucketListsPageContent />);

    expect(screen.getByText(/No bucket lists yet/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Create your first bucket list/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens the create dialog from the header', async () => {
    const user = userEvent.setup();
    render(<BucketListsPageContent />);

    await user.click(screen.getByRole('button', { name: /New bucket list/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('asks a signed-out reader to sign in', () => {
    sessionState = { data: null, status: 'unauthenticated' };

    render(<BucketListsPageContent />);

    expect(screen.getByText('Sign in to keep bucket lists.')).toBeInTheDocument();
  });
});
