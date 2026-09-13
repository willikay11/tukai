import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketListPageContent } from './BucketListPageContent';

let sessionState: { data: { user: { id: string } } | null; status: string } = {
  data: { user: { id: 'u1' } },
  status: 'authenticated',
};
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: jest.fn() }),
  usePathname: () => '/bucket-lists/bl1',
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const deleteBucketList = jest.fn();
let listResponse: { data: unknown } | undefined;
let isLoading = false;
let isError = false;

jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useBucketList: () => ({ data: listResponse, isLoading, isError }),
  useDeleteBucketList: () => ({ mutate: deleteBucketList, isPending: false }),
  useUpdateBucketList: () => ({ mutate: jest.fn(), isPending: false }),
  useCreateBucketList: () => ({ mutate: jest.fn(), isPending: false }),
  useAddBucketListItem: () => ({ mutate: jest.fn() }),
  useReorderBucketListItems: () => ({ mutate: jest.fn(), isPending: false }),
  useMyBucketLists: () => ({ data: undefined, isLoading: false }),
}));

jest.mock('@/app/shared/components/Share', () => ({ Share: () => <div data-testid="share" /> }));

// Each card carries the basket, which reaches for the sign-in dialog
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback: jest.fn(), setOpenSignIn: jest.fn() }),
}));

const experienceItem = (extra: Record<string, unknown> = {}) => ({
  id: 'i1',
  position: 0,
  experienceBookmark: {
    id: 'b1',
    experienceId: 'exp-1',
    experienceTitle: 'Web Experience Test',
    photo: 'https://cdn.test/hike.jpg',
    priceStartsFrom: { amount: 83, currency: 'KES' },
    startDate: '2026-09-11T11:00:00Z',
    endDate: '2026-09-11T20:00:00Z',
  },
  ...extra,
});

const placeItem = (extra: Record<string, unknown> = {}) => ({
  id: 'i2',
  position: 1,
  placeBookmark: {
    id: 'pb1',
    placeId: 'place-1',
    placeName: 'Golden Star Restaurant',
    location: 'Nairobi',
    photo: 'https://cdn.test/food.jpg',
  },
  ...extra,
});

const listOf = (items: unknown[], extra: Record<string, unknown> = {}) => ({
  data: {
    id: 'bl1',
    name: 'Bucket List',
    visibility: 'private',
    itemCount: items.length,
    memberCount: 0,
    owner: { id: 'u1', displayName: 'You' },
    items,
    ...extra,
  },
});

const renderPage = () => render(<BucketListPageContent bucketListId="bl1" />);

describe('BucketListPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 'u1' } }, status: 'authenticated' };
    listResponse = listOf([experienceItem(), placeItem()]);
    isLoading = false;
    isError = false;
  });

  it('heads the page with the list, its visibility and a way to share it', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Bucket List' })).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByTestId('share')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to bucket lists' })).toBeInTheDocument();
  });

  // Experiences and places are saved together but read as two different things
  it('splits what is saved into experiences and places', () => {
    renderPage();

    expect(screen.getByText('Saved Experiences')).toBeInTheDocument();
    expect(screen.getByText('Web Experience Test')).toBeInTheDocument();
    // Currency and amount are separate nodes, so the row is matched whole
    expect(screen.getByText(/KES\s*83/)).toBeInTheDocument();

    expect(screen.getByText('Saved Places')).toBeInTheDocument();
    expect(screen.getByText('Golden Star Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Nairobi')).toBeInTheDocument();
  });

  it('leaves out a section it has nothing for', () => {
    listResponse = listOf([placeItem()]);

    renderPage();

    expect(screen.queryByText('Saved Experiences')).not.toBeInTheDocument();
    expect(screen.getByText('Saved Places')).toBeInTheDocument();
  });

  it('opens each saved thing from its card', () => {
    renderPage();

    expect(screen.getByRole('link', { name: /Web Experience Test/ })).toHaveAttribute(
      'href',
      '/experiences/exp-1',
    );
    expect(screen.getByRole('link', { name: /Golden Star Restaurant/ })).toHaveAttribute(
      'href',
      '/places/place-1',
    );
  });

  it('falls back to a standing line where the list has no description', () => {
    renderPage();

    expect(screen.getByText('Untagged saves')).toBeInTheDocument();
  });

  it('shows the description where there is one', () => {
    listResponse = listOf([experienceItem()], { description: 'Places to try this year' });

    renderPage();

    expect(screen.getByText('Places to try this year')).toBeInTheDocument();
  });

  // The order things are saved in is the owner's to set, so the sorting
  // control opens the reorder dialog rather than re-sorting the view
  it('shows items in the order the list returns them', () => {
    listResponse = listOf([
      placeItem({ id: 'i9', placeBookmark: { id: 'p9', placeId: 'p-9', placeName: 'Zanzibar' } }),
      placeItem(),
    ]);

    renderPage();

    const names = screen.getAllByRole('link').map((link) => link.textContent);
    expect(names[0]).toContain('Zanzibar');
    expect(names[1]).toContain('Golden Star Restaurant');
  });

  it('gives the owner a way to delete the list', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button', { name: /Delete/ })[0]);

    expect(deleteBucketList).toHaveBeenCalledWith('bl1', expect.any(Object));
  });

  it('opens the edit dialog on the list it is showing', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button', { name: /Edit/ })[0]);

    expect(screen.getByText('Edit Bucket List')).toBeInTheDocument();
  });

  /**
   * Beside Share from md, where the header has room; on the bar at the foot of
   * the page on a phone, where it does not. Both are in the markup, each gated
   * to its own width.
   */
  it('places the owner actions by width', () => {
    const { container } = renderPage();

    const holds = (selector: string) =>
      Array.from(container.querySelectorAll(selector)).some(
        (node) => node.textContent?.includes('Edit') && node.textContent?.includes('Delete'),
      );

    // Beside Share from md, and on the bar at the foot of the page below it
    expect(holds('.md\\:flex')).toBe(true);
    expect(holds('.md\\:hidden')).toBe(true);
  });

  // From md the app's own navigation is on screen, so the page does not need
  // to carry a way back as well
  it('keeps the back button to phones', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'Back to bucket lists' })).toHaveClass('md:hidden');
  });

  it('opens the reorder dialog from the sorting control', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Reorder items' }));

    expect(screen.getByRole('button', { name: 'Save order' })).toBeInTheDocument();
  });

  // Someone the list was shared with reads it; they do not run it
  it('gives a member no way to edit or delete', () => {
    listResponse = listOf([experienceItem()], {
      owner: { id: 'someone-else', displayName: 'Tony Ouma' },
    });

    renderPage();

    expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit/ })).not.toBeInTheDocument();
    expect(screen.getByText('by Tony Ouma')).toBeInTheDocument();
  });

  it('offers an empty list a way to understand itself', () => {
    listResponse = listOf([]);

    renderPage();

    expect(screen.getByText(/Nothing saved yet/)).toBeInTheDocument();
  });

  it('asks a signed-out reader to sign in rather than erroring', () => {
    sessionState = { data: null, status: 'unauthenticated' };

    renderPage();

    expect(screen.getByText('Sign in to see your bucket lists.')).toBeInTheDocument();
  });

  it('says so when the list cannot be opened', () => {
    isError = true;
    listResponse = undefined;

    renderPage();

    expect(screen.getByText(/could not be opened/)).toBeInTheDocument();
  });

  it('does not offer reordering to a member', () => {
    listResponse = listOf([experienceItem(), placeItem()], {
      owner: { id: 'someone-else', displayName: 'Tony Ouma' },
    });

    renderPage();

    expect(screen.queryByRole('button', { name: 'Reorder items' })).not.toBeInTheDocument();
  });

  // Nothing to rearrange with one thing on the list
  it('does not offer reordering a list of one', () => {
    listResponse = listOf([experienceItem()]);

    renderPage();

    expect(screen.queryByRole('button', { name: 'Reorder items' })).not.toBeInTheDocument();
  });
});
