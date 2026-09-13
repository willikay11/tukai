import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketList } from '@/types/bucket-list';

import { SharedBucketListCard } from '../SharedBucketListCard';
import { BucketListCard } from './index';

const mockJoin = jest.fn();
jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useJoinBucketList: () => ({ mutate: mockJoin, isPending: false }),
}));

// The API's own shape: `name`, `visibility`, counts rather than embedded lists
const bucketList: BucketList = {
  id: 'bucket-1',
  name: 'Weekend Hikes',
  visibility: 'public',
  coverImage: '/images/kilimanjaro.webp',
  itemCount: 12,
  memberCount: 4,
  owner: { id: 'me', displayName: 'You' },
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('BucketListCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the name, who it belongs to, and what it holds', () => {
    render(<BucketListCard bucketList={bucketList} onClick={jest.fn()} />);

    expect(screen.getByText('Weekend Hikes')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('12 saved')).toBeInTheDocument();
    expect(screen.getByText('by You')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('says when a list is private', () => {
    render(
      <BucketListCard bucketList={{ ...bucketList, visibility: 'private' }} onClick={jest.fn()} />,
    );

    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  // Given an href the whole card is one link, which is what a list of them wants
  it('opens the list when it is given somewhere to go', () => {
    render(<BucketListCard bucketList={bucketList} href="/bucket-lists/bucket-1" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/bucket-lists/bucket-1');
  });

  it('falls back to a press handler where there is no href', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<BucketListCard bucketList={bucketList} onClick={onClick} />);

    await user.click(screen.getByText('Weekend Hikes'));

    expect(onClick).toHaveBeenCalled();
  });
});

describe('SharedBucketListCard', () => {
  beforeEach(() => jest.clearAllMocks());

  const shared: BucketList = {
    ...bucketList,
    id: 'bucket-shared-1',
    owner: { id: 'm1', displayName: 'Tony Ouma' },
    itemCount: 8,
    shareToken: 'share-abc',
    isMember: false,
  };

  it('names the owner and joins with the share token, not the list id', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedBucketListCard bucketList={shared} />);

    expect(screen.getByText('By Tony Ouma · 8 saved')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Join' }));

    expect(mockJoin).toHaveBeenCalledWith('share-abc');
  });

  it('shows a disabled Joined button once the reader is on the list', () => {
    renderWithQueryClient(<SharedBucketListCard bucketList={{ ...shared, isMember: true }} />);

    expect(screen.getByRole('button', { name: 'Joined' })).toBeDisabled();
  });

  // The list serializer sends this as a string
  it('reads membership sent as a string', () => {
    renderWithQueryClient(<SharedBucketListCard bucketList={{ ...shared, isMember: 'true' }} />);

    expect(screen.getByRole('button', { name: 'Joined' })).toBeDisabled();
  });

  it('cannot join a list that came without a token', () => {
    renderWithQueryClient(
      <SharedBucketListCard bucketList={{ ...shared, shareToken: undefined }} />,
    );

    expect(screen.getByRole('button', { name: 'Join' })).toBeDisabled();
  });
});

/**
 * `cover_image` is documented as a string and arrives as the Photo object on
 * some responses — the same split that left the saved items blank on the
 * detail page.
 */
describe('the cover, however it arrives', () => {
  const srcOf = (container: HTMLElement) =>
    decodeURIComponent(container.querySelector('img')?.getAttribute('src') ?? '');

  it('takes a plain URL', () => {
    const { container } = render(
      <BucketListCard
        bucketList={{ ...bucketList, coverImage: 'https://cdn.test/cover.jpg' }}
        onClick={jest.fn()}
      />,
    );

    expect(srcOf(container)).toContain('cdn.test/cover.jpg');
  });

  it.each([
    ['photo', { photo: 'https://cdn.test/obj.jpg' }],
    ['photoUrl', { photoUrl: 'https://cdn.test/obj.jpg' }],
    ['photoWebpMdUrl', { photoWebpMdUrl: 'https://cdn.test/obj.jpg' }],
  ])('takes an object carrying %s', (_label, coverImage) => {
    const { container } = render(
      <BucketListCard bucketList={{ ...bucketList, coverImage } as never} onClick={jest.fn()} />,
    );

    expect(srcOf(container)).toContain('cdn.test/obj.jpg');
  });

  it('falls back rather than breaking when a list has no cover', () => {
    const { container } = render(
      <BucketListCard bucketList={{ ...bucketList, coverImage: null }} onClick={jest.fn()} />,
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getByText('Weekend Hikes')).toBeInTheDocument();
  });
});
