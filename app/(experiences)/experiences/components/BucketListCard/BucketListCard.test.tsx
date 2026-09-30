import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketList, BucketListDetail } from '@/types/bucket-list';

import { BucketListCard } from './index';

const join = jest.fn();
const leave = jest.fn();
jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useJoinBucketList: () => ({ mutate: join, isPending: false }),
  useLeaveBucketList: () => ({ mutate: leave, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

let userId: string | undefined = 'me';
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: userId ? { user: { id: userId } } : null }),
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

const shared: BucketList = {
  ...bucketList,
  id: 'bucket-shared-1',
  owner: { id: 'm1', displayName: 'Tony Ouma' },
  itemCount: 8,
  shareToken: 'share-abc',
  isMember: false,
};

describe('BucketListCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userId = 'me';
  });

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

    // Both the card and its Open list button are that link
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/bucket-lists/bucket-1');
  });

  it('falls back to a press handler where there is no href', async () => {
    const onClick = jest.fn();
    render(<BucketListCard bucketList={bucketList} onClick={onClick} />);

    await userEvent.click(screen.getByText('Weekend Hikes'));

    expect(onClick).toHaveBeenCalled();
  });
});

/**
 * The canvas gives one card three states — a list you own, one you are on, and
 * a public one you could join. Two cards used to say this, and neither covered
 * all three.
 */
describe('the three states of a list card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userId = 'me';
  });

  // Opening is the same link the card is, so it is an anchor rather than a button
  it('offers to open a list you own', () => {
    render(<BucketListCard bucketList={bucketList} href="/bucket-lists/bucket-1" />);

    expect(screen.getByRole('link', { name: 'Open list' })).toHaveAttribute(
      'href',
      '/bucket-lists/bucket-1',
    );
  });

  it('falls back to a button where the card has no href', () => {
    render(<BucketListCard bucketList={bucketList} onClick={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Open list' })).toBeInTheDocument();
  });

  it('offers to join one that is not yours', () => {
    render(<BucketListCard bucketList={shared} href="/bucket-lists/bucket-shared-1" />);

    expect(screen.getByRole('button', { name: 'Join list' })).toBeInTheDocument();
  });

  it('joins with the share token, not the list id', async () => {
    render(<BucketListCard bucketList={shared} href="/x" />);

    await userEvent.click(screen.getByRole('button', { name: 'Join list' }));

    expect(join).toHaveBeenCalledWith('share-abc', expect.anything());
  });

  it('says so when a list arrived without a share link', async () => {
    render(<BucketListCard bucketList={{ ...shared, shareToken: undefined }} href="/x" />);

    await userEvent.click(screen.getByRole('button', { name: 'Join list' }));

    expect(join).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'This list has no share link' }),
    );
  });

  it('says you are on a list you have joined', () => {
    render(<BucketListCard bucketList={{ ...shared, isMember: true }} href="/x" />);

    expect(screen.getByRole('button', { name: 'Joined' })).toBeInTheDocument();
  });

  // The list serializer sends this as a string
  it('reads membership sent as a string', () => {
    render(<BucketListCard bucketList={{ ...shared, isMember: 'true' }} href="/x" />);

    expect(screen.getByRole('button', { name: 'Joined' })).toBeInTheDocument();
  });

  it('ignores the string "false"', () => {
    render(<BucketListCard bucketList={{ ...shared, isMember: 'false' }} href="/x" />);

    expect(screen.getByRole('button', { name: 'Join list' })).toBeInTheDocument();
  });

  // Pressing "Joined" is how the canvas leaves a list
  it('leaves a list you are on', async () => {
    render(<BucketListCard bucketList={{ ...shared, isMember: true }} href="/x" />);

    await userEvent.click(screen.getByRole('button', { name: 'Joined' }));

    expect(leave).toHaveBeenCalledWith('bucket-shared-1', expect.anything());
  });

  it('promises a public list stays readable after you leave', async () => {
    leave.mockImplementation((_id, { onSuccess }) => onSuccess());
    render(<BucketListCard bucketList={{ ...shared, isMember: true }} href="/x" />);

    await userEvent.click(screen.getByRole('button', { name: 'Joined' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'The public list stays readable.' }),
    );
  });

  it('warns that a private one needs another invite', async () => {
    leave.mockImplementation((_id, { onSuccess }) => onSuccess());
    render(
      <BucketListCard
        bucketList={{ ...shared, isMember: true, visibility: 'private' }}
        href="/x"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Joined' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'You will need another invite to open it again.',
      }),
    );
  });

  // Signed out, nothing is yours
  it('offers to join when no one is signed in', () => {
    userId = undefined;
    render(<BucketListCard bucketList={bucketList} href="/x" />);

    expect(screen.getByRole('button', { name: 'Join list' })).toBeInTheDocument();
  });
});

/**
 * The canvas stacks three faces with a "+N". Members ride on the detail
 * serializer only, so a card built from the collection shows the count instead.
 */
describe('members on the card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userId = 'me';
  });

  it('shows the count when no people came with the list', () => {
    render(<BucketListCard bucketList={bucketList} href="/x" />);

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('stacks the faces when they did', () => {
    const detail = {
      ...bucketList,
      memberCount: 5,
      members: [
        { id: 'm1', status: 'accepted', user: { id: 'u1', displayName: 'Amina' } },
        { id: 'm2', status: 'accepted', user: { id: 'u2', displayName: 'Kevo' } },
      ],
    } as unknown as BucketListDetail;

    render(<BucketListCard bucketList={detail} href="/x" />);

    expect(screen.getByTitle('Amina')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  // Someone who was asked and has not answered is not a member yet
  it('ignores an invite that has not been accepted', () => {
    const detail = {
      ...bucketList,
      memberCount: 1,
      members: [{ id: 'm1', status: 'pending', user: { id: 'u1', displayName: 'Amina' } }],
    } as unknown as BucketListDetail;

    render(<BucketListCard bucketList={detail} href="/x" />);

    expect(screen.queryByTitle('Amina')).not.toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows nothing where a list has no members at all', () => {
    render(<BucketListCard bucketList={{ ...bucketList, memberCount: 0 }} href="/x" />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
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
