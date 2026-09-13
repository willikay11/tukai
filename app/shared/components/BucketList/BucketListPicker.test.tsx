import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketListPicker } from './BucketListPicker';

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const addItem = jest.fn();
const addItemFor = jest.fn((_bucketListId: string) => ({ mutate: addItem }));
let response: { data: { results: unknown[] } } | undefined;
let isLoading = false;

jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useMyBucketLists: () => ({ data: response, isLoading }),
  useAddBucketListItem: (id: string) => addItemFor(id),
  useCreateBucketList: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateBucketList: () => ({ mutate: jest.fn(), isPending: false }),
}));

const list = (extra: Record<string, unknown> = {}) => ({
  id: 'bl1',
  name: 'Weekend Hikes',
  visibility: 'private',
  itemCount: 2,
  memberCount: 0,
  ...extra,
});

const renderPicker = (props: Record<string, unknown> = {}) =>
  render(
    <BucketListPicker
      isOpen
      setIsOpen={jest.fn()}
      experienceId="exp-1"
      itemName="Karura Night Hike"
      {...props}
    />,
  );

describe('BucketListPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    response = {
      data: {
        results: [
          list(),
          list({ id: 'bl2', name: 'Date Nights', visibility: 'public', memberCount: 1 }),
        ],
      },
    };
    isLoading = false;
  });

  it('offers every list the reader keeps, with what each one is', () => {
    renderPicker();

    expect(screen.getByText('Your Bucket Lists')).toBeInTheDocument();
    expect(screen.getByText('Weekend Hikes')).toBeInTheDocument();
    expect(screen.getByText('Private · 0 Members')).toBeInTheDocument();
    expect(screen.getByText('Public · 1 Member')).toBeInTheDocument();
  });

  // The chosen list is what the save is keyed to
  it('saves onto the list that was picked', async () => {
    const user = userEvent.setup();
    renderPicker();

    await user.click(screen.getByText('Date Nights'));

    await waitFor(() => expect(addItemFor).toHaveBeenCalledWith('bl2'));
    expect(addItem).toHaveBeenCalledWith(
      { experienceId: 'exp-1', placeId: undefined },
      expect.any(Object),
    );
  });

  it('confirms the save by name, and closes', async () => {
    const setIsOpen = jest.fn();
    addItem.mockImplementation((_payload, options) => options?.onSuccess?.());
    const user = userEvent.setup();
    renderPicker({ setIsOpen });

    await user.click(screen.getByText('Weekend Hikes'));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Saved to Weekend Hikes',
          description: 'Karura Night Hike is on your list.',
        }),
      ),
    );
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('says so when the save fails, and stays open', async () => {
    const setIsOpen = jest.fn();
    addItem.mockImplementation((_payload, options) =>
      options?.onError?.(new Error('Already on this list')),
    );
    const user = userEvent.setup();
    renderPicker({ setIsOpen });

    await user.click(screen.getByText('Weekend Hikes'));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Already on this list', variant: 'destructive' }),
      ),
    );
    expect(setIsOpen).not.toHaveBeenCalledWith(false);
  });

  it('saves a place when that is what was handed to it', async () => {
    const user = userEvent.setup();
    renderPicker({ experienceId: undefined, placeId: 'place-1' });

    await user.click(screen.getByText('Weekend Hikes'));

    expect(addItem).toHaveBeenCalledWith(
      { experienceId: undefined, placeId: 'place-1' },
      expect.any(Object),
    );
  });

  // Nowhere to save to is a reason to make a list, not a dead end
  it('offers a way out when the reader has no lists', () => {
    response = { data: { results: [] } };

    renderPicker();

    expect(screen.getByText(/No bucket lists yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Bucket List/ })).toBeInTheDocument();
  });

  /**
   * The shared Drawer positions with `fixed` and no portal, so an ancestor
   * carrying a transform or a backdrop-filter becomes its containing block and
   * it lands off-viewport. Radix portals to the body, so where the picker is
   * opened from cannot move it.
   */
  it('renders through a portal, not inside whatever opened it', () => {
    const { container } = renderPicker();

    expect(container).toBeEmptyDOMElement();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
