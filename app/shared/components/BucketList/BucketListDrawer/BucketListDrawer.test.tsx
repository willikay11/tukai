import React, { useEffect } from 'react';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketListDrawerProvider, useBucketListDrawer } from '@/context/BucketListDrawerContext';

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
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: ({ itemName }: { itemName: string }) => (
    <button type="button">Save {itemName} to a bucket list</button>
  ),
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
const updateBucketList = jest.fn();
const removeMember = jest.fn();
const sendInvites = jest.fn();
let listResponse: { data: unknown } | undefined;
let membersResponse: { data: unknown } | undefined;
let isLoading = false;
let error: { status?: number } | null = null;

jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useBucketList: () => ({ data: listResponse, isLoading, error }),
  useBucketListMembers: () => ({ data: membersResponse }),
  useDeleteBucketList: () => ({ mutate: deleteBucketList, isPending: false }),
  useLeaveBucketList: () => ({ mutate: leaveBucketList, isPending: false }),
  useJoinPublicBucketList: () => ({ mutate: joinBucketList, isPending: false }),
  useUpdateBucketList: () => ({ mutate: updateBucketList, isPending: false }),
  useCreateBucketList: () => ({ mutate: jest.fn(), isPending: false }),
  useRemoveBucketListMember: () => ({ mutate: removeMember, isPending: false }),
  useInviteBucketListMembers: () => ({ mutate: sendInvites, isPending: false }),
}));

jest.mock('@/services/experience', () => ({
  searchUsers: jest.fn().mockResolvedValue({ data: [] }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isFetching: false }),
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

/** Opens the list the way a card does, and reports whether the panel is open. */
const Opener = ({ onState }: { onState: (open: boolean) => void }) => {
  const drawer = useBucketListDrawer()!;

  useEffect(() => {
    drawer.openBucketList('bl1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onState(Boolean(drawer.openBucketListId));
  }, [drawer.openBucketListId, onState]);

  return null;
};

const renderDrawer = () => {
  const state = { open: true };
  render(
    <BucketListDrawerProvider>
      <Opener
        onState={(open) => {
          state.open = open;
        }}
      />
    </BucketListDrawerProvider>,
  );
  return state;
};

const asOwner = () => {
  sessionState = { data: { user: { id: 'u1' } } };
};
const asSomeoneElse = () => {
  sessionState = { data: { user: { id: 'u9' } } };
};

describe('BucketListDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    asOwner();
    listResponse = baseList();
    membersResponse = undefined;
    isLoading = false;
    error = null;
  });

  it('shows a loading shell while the list is still on the way', () => {
    listResponse = undefined;
    isLoading = true;
    renderDrawer();

    expect(screen.getByText('Bucket list')).toBeInTheDocument();
  });

  it('reads a 404 as the list being gone', () => {
    listResponse = undefined;
    error = { status: 404 };
    renderDrawer();

    expect(screen.getByText('This bucket list is no longer available')).toBeInTheDocument();
  });

  it('reads any other failure as a private list the reader cannot open', () => {
    listResponse = undefined;
    error = { status: 403 };
    renderDrawer();

    expect(screen.getByText('This bucket list is private')).toBeInTheDocument();
  });

  it('shows the list, its owner, and its visibility', () => {
    renderDrawer();

    expect(screen.getByRole('heading', { name: 'Weekend in Naivasha' })).toBeInTheDocument();
    expect(screen.getByText('Two slow days by the lake with friends.')).toBeInTheDocument();
    expect(screen.getByText('Amina Hassan')).toBeInTheDocument();
    expect(screen.getByText('Owner (you)')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('moves focus to the title when the list opens', () => {
    renderDrawer();

    expect(screen.getByRole('heading', { name: 'Weekend in Naivasha' })).toHaveFocus();
  });

  it('shows the empty state with explore actions for the owner', () => {
    renderDrawer();

    expect(screen.getByText('Nothing saved here yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore experiences' })).toHaveAttribute(
      'href',
      '/experiences',
    );
    expect(screen.getByRole('link', { name: 'Explore places' })).toHaveAttribute('href', '/places');
  });

  it('closes the drawer when an explore link is followed', async () => {
    const state = renderDrawer();

    await userEvent.click(screen.getByText('Explore experiences'));

    expect(state.open).toBe(false);
  });

  it('withholds the explore actions from a visitor who cannot add to it', () => {
    asSomeoneElse();
    renderDrawer();

    expect(screen.getByText('Nothing on this list yet')).toBeInTheDocument();
    expect(screen.queryByText('Explore experiences')).not.toBeInTheDocument();
  });

  it('lists saved experiences and places, each one link with its own save', () => {
    listResponse = baseList({
      items: [
        {
          id: 'i1',
          experienceBookmark: { id: 'b1', experienceId: 'e1', experienceTitle: 'Pottery' },
        },
        { id: 'i2', placeBookmark: { id: 'b2', placeId: 'p1', placeName: 'Karura Forest' } },
      ],
    });
    renderDrawer();

    expect(screen.getByRole('heading', { name: 'Experiences' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pottery/ })).toHaveAttribute(
      'href',
      '/experiences/e1',
    );
    expect(screen.getByRole('heading', { name: 'Places' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Karura Forest/ })).toHaveAttribute(
      'href',
      '/places/p1',
    );
    expect(screen.getByText('Save Pottery to a bucket list')).toBeInTheDocument();
  });

  describe('the owner’s action bar', () => {
    it('opens Edit on top, and comes back to the list after saving', async () => {
      updateBucketList.mockImplementation((_payload, { onSuccess }) => onSuccess());
      renderDrawer();

      await userEvent.click(screen.getByText('Edit'));

      expect(screen.getByRole('heading', { name: 'Edit bucket list' })).toBeInTheDocument();
      expect(screen.getByLabelText('Bucket list name/title')).toHaveValue('Weekend in Naivasha');

      await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(updateBucketList).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Changes saved.' }));
      expect(screen.getByRole('heading', { name: 'Weekend in Naivasha' })).toBeInTheDocument();
    });

    it('asks before deleting, then deletes and closes', async () => {
      deleteBucketList.mockImplementation((_id, { onSuccess }) => onSuccess());
      const state = renderDrawer();

      await userEvent.click(screen.getByText('Delete'));

      const dialog = screen.getByRole('alertdialog');
      expect(within(dialog).getByText('Delete "Weekend in Naivasha"?')).toBeInTheDocument();
      // Focus starts on the safe choice
      expect(within(dialog).getByText('Keep bucket list')).toHaveFocus();

      await userEvent.click(within(dialog).getByText('Delete bucket list'));

      expect(deleteBucketList).toHaveBeenCalledWith('bl1', expect.anything());
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title:
            'Deleted Weekend in Naivasha. The experiences and places on it are still on Tukai.',
        }),
      );
      expect(state.open).toBe(false);
    });

    it('backs out of the delete confirm on "Keep bucket list"', async () => {
      renderDrawer();

      await userEvent.click(screen.getByText('Delete'));
      await userEvent.click(screen.getByText('Keep bucket list'));

      expect(deleteBucketList).not.toHaveBeenCalled();
      expect(screen.queryByText('Delete "Weekend in Naivasha"?')).not.toBeInTheDocument();
    });
  });

  describe('a joined member’s action bar', () => {
    beforeEach(() => {
      asSomeoneElse();
      listResponse = baseList({ isMember: true });
    });

    it('offers to leave, with the public wording, and stays open', async () => {
      const state = renderDrawer();

      await userEvent.click(screen.getByText('Leave bucket list'));
      expect(screen.getByText('Leave "Weekend in Naivasha"?')).toBeInTheDocument();
      expect(screen.getByText(/stays public/i)).toBeInTheDocument();

      leaveBucketList.mockImplementation((_id, { onSuccess }) => onSuccess());
      const dialog = screen.getByRole('alertdialog');
      await userEvent.click(within(dialog).getByText('Leave bucket list'));

      expect(leaveBucketList).toHaveBeenCalledWith('bl1', expect.anything());
      // A public list stays open to read once membership ends
      expect(state.open).toBe(true);
    });

    it('closes the drawer after leaving a private list', async () => {
      listResponse = baseList({ isMember: true, visibility: 'private' });
      leaveBucketList.mockImplementation((_id, { onSuccess }) => onSuccess());
      const state = renderDrawer();

      await userEvent.click(screen.getByText('Leave bucket list'));
      const dialog = screen.getByRole('alertdialog');
      await userEvent.click(within(dialog).getByText('Leave bucket list'));

      expect(state.open).toBe(false);
    });
  });

  describe('a visitor’s action bar', () => {
    beforeEach(asSomeoneElse);

    it('joins a public list by its id', async () => {
      joinBucketList.mockImplementation((_id, { onSuccess }) => onSuccess());
      renderDrawer();

      await userEvent.click(screen.getByText('Join bucket list'));

      expect(joinBucketList).toHaveBeenCalledWith('bl1', expect.anything());
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'You joined Weekend in Naivasha. It is in Following. Nothing was booked.',
        }),
      );
    });

    it('sends a signed-out visitor to sign up first', async () => {
      sessionState = { data: null };
      renderDrawer();

      await userEvent.click(screen.getByText('Join bucket list'));

      expect(joinBucketList).not.toHaveBeenCalled();
      expect(needAuth).toHaveBeenCalledWith('join', expect.any(Function));
    });
  });

  describe('Members', () => {
    beforeEach(() => {
      listResponse = baseList({
        memberCount: 1,
        members: [{ id: 'm1', status: 'accepted', user: { id: 'u2', displayName: 'Kevo' } }],
      });
      membersResponse = {
        data: [
          { id: 'm1', status: 'accepted', user: { id: 'u2', displayName: 'Kevo' } },
          { id: 'm2', status: 'pending', user: { id: 'u3', displayName: 'Njeri' } },
        ],
      };
    });

    it('opens from the owner button, and comes back with Back', async () => {
      renderDrawer();

      await userEvent.click(screen.getByRole('button', { name: /owner of this list/i }));

      expect(screen.getByRole('heading', { name: 'Members' })).toBeInTheDocument();
      expect(screen.getByText('Kevo')).toBeInTheDocument();
      expect(screen.getByText('1 member, 1 invited')).toBeInTheDocument();
      expect(screen.getByText('Invited')).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText('Back'));

      expect(screen.getByRole('heading', { name: 'Weekend in Naivasha' })).toBeInTheDocument();
    });

    it('filters as you type, and says so when nobody matches', async () => {
      renderDrawer();
      await userEvent.click(screen.getByRole('button', { name: 'See members, 1 member' }));

      await userEvent.type(screen.getByLabelText('Find members'), 'kev');
      expect(screen.getByText('Kevo')).toBeInTheDocument();
      expect(screen.queryByText('Njeri')).not.toBeInTheDocument();

      await userEvent.clear(screen.getByLabelText('Find members'));
      await userEvent.type(screen.getByLabelText('Find members'), 'zz');
      expect(screen.getByText(/No one on this list matches/)).toBeInTheDocument();
    });

    it('lets the owner remove a member after asking', async () => {
      removeMember.mockImplementation((_id, { onSuccess }) => onSuccess());
      renderDrawer();
      await userEvent.click(screen.getByRole('button', { name: /owner of this list/i }));

      await userEvent.click(screen.getByLabelText('Member options for Kevo'));
      const dialog = screen.getByRole('alertdialog');
      expect(
        within(dialog).getByText('Remove Kevo from "Weekend in Naivasha"?'),
      ).toBeInTheDocument();

      await userEvent.click(within(dialog).getByText('Remove from bucket list'));

      expect(removeMember).toHaveBeenCalledWith('u2', expect.anything());
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Kevo was removed. It no longer shows in their Following.',
        }),
      );
    });

    it('lets the owner cancel an invite', async () => {
      renderDrawer();
      await userEvent.click(screen.getByRole('button', { name: /owner of this list/i }));

      await userEvent.click(screen.getByLabelText('Invite options for Njeri'));

      expect(screen.getByText('Cancel the invite to Njeri?')).toBeInTheDocument();
    });

    it('gives a non-owner no options on anyone', async () => {
      asSomeoneElse();
      renderDrawer();
      await userEvent.click(screen.getByRole('button', { name: /owner of this list/i }));

      expect(screen.queryByLabelText(/options for/)).not.toBeInTheDocument();
    });
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
      expect.objectContaining({
        title: 'Link copied. Anyone with it can view and join this list.',
      }),
    );
  });

  it('opens Invite members from the header of the owner’s private list', async () => {
    listResponse = baseList({ visibility: 'private' });
    renderDrawer();

    expect(screen.queryByLabelText('Share')).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Invite members'));

    expect(screen.getByRole('heading', { name: 'Invite members' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send invite' })).toBeDisabled();
  });

  it('invites a typed email address, then goes back to the list', async () => {
    listResponse = baseList({ visibility: 'private' });
    sendInvites.mockImplementation((_invitees, { onSuccess }) => onSuccess());
    renderDrawer();
    await userEvent.click(screen.getByLabelText('Invite members'));

    await userEvent.type(screen.getByRole('combobox'), 'amina@example.com');
    expect(screen.getByRole('option', { name: /Invite by email/ })).toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    expect(screen.getByLabelText('Remove amina@example.com')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Send invite' }));

    expect(sendInvites).toHaveBeenCalledWith([{ email: 'amina@example.com' }], expect.anything());
    expect(screen.getByRole('heading', { name: 'Weekend in Naivasha' })).toBeInTheDocument();
  });
});
