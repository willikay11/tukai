import React from 'react';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketListDrawer } from './index';

let sessionState: { data: { user: { id: string } } | null } = {
  data: { user: { id: 'u1' } },
};
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
jest.mock('@/app/(experiences)/experiences/components/CreateBucketListModal', () => ({
  CreateBucketListModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="edit-drawer" /> : null,
}));
jest.mock('@/app/(experiences)/bucket-lists/[bucketListId]/components/SavedItemCard', () => ({
  SavedExperienceCard: ({ item }: { item: { id: string } }) => (
    <div data-testid={`experience-${item.id}`} />
  ),
  SavedPlaceCard: ({ item }: { item: { id: string } }) => <div data-testid={`place-${item.id}`} />,
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const needAuth = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ needAuth }),
}));

const deleteBucketList = jest.fn();
const leaveBucketList = jest.fn();
const joinBucketList = jest.fn();
let listResponse: { data: unknown } | undefined;
let isLoading = false;
let error: { status?: number } | null = null;

jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useBucketList: () => ({ data: listResponse, isLoading, error }),
  useDeleteBucketList: () => ({ mutate: deleteBucketList, isPending: false }),
  useLeaveBucketList: () => ({ mutate: leaveBucketList, isPending: false }),
  useJoinBucketList: () => ({ mutate: joinBucketList, isPending: false }),
}));

const baseList = (overrides: Record<string, unknown> = {}) => ({
  data: {
    id: 'bl1',
    name: 'Weekend in Naivasha',
    description: 'Two slow days by the lake with friends.',
    visibility: 'public',
    itemCount: 0,
    memberCount: 0,
    owner: { id: 'u1', displayName: 'Amina Hassan' },
    shareToken: 'share-abc',
    items: [],
    ...overrides,
  },
});

const renderDrawer = (onClose = jest.fn()) => {
  render(<BucketListDrawer bucketListId="bl1" isOpen onClose={onClose} />);
  return { onClose };
};

describe('BucketListDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 'u1' } } };
    listResponse = baseList();
    isLoading = false;
    error = null;
  });

  it('shows a loading shell while the list is still on the way', () => {
    listResponse = undefined;
    isLoading = true;
    render(<BucketListDrawer bucketListId="bl1" isOpen onClose={jest.fn()} />);

    expect(screen.getByText('Bucket list')).toBeInTheDocument();
  });

  it('reads a 404 as the list being gone', () => {
    listResponse = undefined;
    error = { status: 404 };
    render(<BucketListDrawer bucketListId="bl1" isOpen onClose={jest.fn()} />);

    expect(screen.getByText('This bucket list is no longer available')).toBeInTheDocument();
  });

  it('reads any other failure as a private list the reader cannot open', () => {
    listResponse = undefined;
    error = { status: 403 };
    render(<BucketListDrawer bucketListId="bl1" isOpen onClose={jest.fn()} />);

    expect(screen.getByText('This bucket list is private')).toBeInTheDocument();
  });

  it('shows the list, its owner, and its visibility', () => {
    renderDrawer();

    expect(screen.getByText('Weekend in Naivasha')).toBeInTheDocument();
    expect(screen.getByText('Two slow days by the lake with friends.')).toBeInTheDocument();
    expect(screen.getByText('Amina Hassan')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('shows the empty state with explore actions for the owner', () => {
    renderDrawer();

    expect(screen.getByText('Nothing saved here yet')).toBeInTheDocument();
    expect(screen.getByText('Explore experiences')).toBeInTheDocument();
    expect(screen.getByText('Explore places')).toBeInTheDocument();
  });

  it('closes the drawer when an explore link is followed', async () => {
    const { onClose } = renderDrawer();

    await userEvent.click(screen.getByText('Explore experiences'));

    expect(onClose).toHaveBeenCalled();
  });

  it('withholds the explore actions from a visitor who cannot add to it', () => {
    listResponse = baseList({ owner: { id: 'someone-else', displayName: 'Amina Hassan' } });
    renderDrawer();

    expect(screen.getByText('Nothing on this list yet')).toBeInTheDocument();
    expect(screen.queryByText('Explore experiences')).not.toBeInTheDocument();
  });

  it('lists saved experiences and places', () => {
    listResponse = baseList({
      items: [
        { id: 'i1', experienceBookmark: { id: 'b1', experienceTitle: 'Pottery' } },
        { id: 'i2', placeBookmark: { id: 'b2', placeName: 'Karura Forest' } },
      ],
    });
    renderDrawer();

    expect(screen.getByText('Experiences')).toBeInTheDocument();
    expect(screen.getByTestId('experience-i1')).toBeInTheDocument();
    expect(screen.getByText('Places')).toBeInTheDocument();
    expect(screen.getByTestId('place-i2')).toBeInTheDocument();
  });

  describe('the owner’s footer', () => {
    it('opens the edit drawer', async () => {
      renderDrawer();

      await userEvent.click(screen.getByText('Edit'));

      expect(screen.getByTestId('edit-drawer')).toBeInTheDocument();
    });

    it('asks before deleting, then deletes and closes', async () => {
      deleteBucketList.mockImplementation((_id, { onSuccess }) => onSuccess());
      const { onClose } = renderDrawer();

      await userEvent.click(screen.getByText('Delete'));

      expect(screen.getByText('Delete "Weekend in Naivasha"?')).toBeInTheDocument();

      await userEvent.click(screen.getByText('Delete bucket list'));

      expect(deleteBucketList).toHaveBeenCalledWith('bl1', expect.anything());
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Deleted Weekend in Naivasha' }),
      );
      expect(onClose).toHaveBeenCalled();
    });

    it('backs out of the delete confirm on "Keep bucket list"', async () => {
      renderDrawer();

      await userEvent.click(screen.getByText('Delete'));
      await userEvent.click(screen.getByText('Keep bucket list'));

      expect(deleteBucketList).not.toHaveBeenCalled();
      expect(screen.queryByText('Delete "Weekend in Naivasha"?')).not.toBeInTheDocument();
    });
  });

  describe('a joined member’s footer', () => {
    beforeEach(() => {
      listResponse = baseList({
        owner: { id: 'someone-else', displayName: 'Amina Hassan' },
        isMember: true,
      });
    });

    it('offers to leave, with the public wording', async () => {
      const { onClose } = renderDrawer();

      await userEvent.click(screen.getByText('Leave bucket list'));
      expect(screen.getByText('Leave "Weekend in Naivasha"?')).toBeInTheDocument();
      expect(screen.getByText(/stays public/i)).toBeInTheDocument();

      leaveBucketList.mockImplementation((_id, { onSuccess }) => onSuccess());
      const dialog = screen.getByRole('alertdialog');
      await userEvent.click(within(dialog).getByText('Leave bucket list'));

      expect(leaveBucketList).toHaveBeenCalledWith('bl1', expect.anything());
      // A public list stays open to read once membership ends
      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes the drawer after leaving a private list', async () => {
      listResponse = baseList({
        owner: { id: 'someone-else', displayName: 'Amina Hassan' },
        isMember: true,
        visibility: 'private',
      });
      leaveBucketList.mockImplementation((_id, { onSuccess }) => onSuccess());
      const { onClose } = renderDrawer();

      await userEvent.click(screen.getByText('Leave bucket list'));
      const dialog = screen.getByRole('alertdialog');
      await userEvent.click(within(dialog).getByText('Leave bucket list'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('a visitor’s footer', () => {
    beforeEach(() => {
      listResponse = baseList({ owner: { id: 'someone-else', displayName: 'Amina Hassan' } });
    });

    it('offers to join a public list', async () => {
      renderDrawer();

      await userEvent.click(screen.getByText('Join bucket list'));

      expect(joinBucketList).toHaveBeenCalledWith('share-abc', expect.anything());
    });

    it('sends a signed-out visitor to sign in first', async () => {
      sessionState = { data: null };
      renderDrawer();

      await userEvent.click(screen.getByText('Join bucket list'));

      expect(joinBucketList).not.toHaveBeenCalled();
      expect(needAuth).toHaveBeenCalled();
    });
  });

  it('opens the members view from the owner chip, and comes back from it', async () => {
    listResponse = baseList({
      memberCount: 1,
      members: [{ id: 'm1', status: 'accepted', user: { id: 'u2', displayName: 'Kevo' } }],
    });
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: /Owner of this list/i }));

    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Kevo')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Back'));

    expect(screen.getByText('Weekend in Naivasha')).toBeInTheDocument();
  });

  it('copies the public share link with public wording', async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    renderDrawer();

    await userEvent.click(screen.getByLabelText('Share'));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/bucket-lists/bl1'),
      ),
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Anyone with it can view and join this list.' }),
    );
  });

  it('offers to invite instead of share on the owner’s private list', () => {
    listResponse = baseList({ visibility: 'private' });
    renderDrawer();

    expect(screen.getByLabelText('Invite members')).toBeInTheDocument();
  });
});
