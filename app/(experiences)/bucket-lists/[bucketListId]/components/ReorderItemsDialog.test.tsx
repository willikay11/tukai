import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketListItem } from '@/types/bucket-list';

import { ReorderItemsDialog } from './ReorderItemsDialog';

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const saveOrder = jest.fn();
jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useReorderBucketListItems: () => ({ mutate: saveOrder, isPending: false }),
}));

const place = (id: string, name: string): BucketListItem =>
  ({
    id,
    position: 0,
    placeBookmark: { id: `b-${id}`, placeId: `p-${id}`, placeName: name },
  }) as BucketListItem;

const items = [
  place('i1', 'Bustani Bistro'),
  place('i2', 'Golden Star'),
  place('i3', 'Imaara Mall'),
];

const renderDialog = (props: Record<string, unknown> = {}) =>
  render(
    <ReorderItemsDialog isOpen setIsOpen={jest.fn()} bucketListId="bl1" items={items} {...props} />,
  );

const rowNames = () => screen.getAllByRole('listitem').map((row) => row.textContent?.trim());

describe('ReorderItemsDialog', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists every item in the order it stands', () => {
    renderDialog();

    expect(screen.getByText('Reorder items')).toBeInTheDocument();
    expect(rowNames()[0]).toContain('Bustani Bistro');
    expect(rowNames()[2]).toContain('Imaara Mall');
  });

  // Dragging is the point on a pointer device, but it is not the only way in
  it('moves a row down with the arrows', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Move Bustani Bistro down' }));

    expect(rowNames()[0]).toContain('Golden Star');
    expect(rowNames()[1]).toContain('Bustani Bistro');
  });

  it('moves a row back up again', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Move Imaara Mall up' }));

    expect(rowNames()[1]).toContain('Imaara Mall');
  });

  // The ends have nowhere further to go
  it('does not offer to move the first row up or the last down', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'Move Bustani Bistro up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Imaara Mall down' })).toBeDisabled();
  });

  it('sends the whole order, as item ids', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Move Bustani Bistro down' }));
    await user.click(screen.getByRole('button', { name: 'Save order' }));

    await waitFor(() => expect(saveOrder).toHaveBeenCalled());
    expect(saveOrder.mock.calls[0][0]).toEqual(['i2', 'i1', 'i3']);
  });

  // A drag often takes two or three tries to land; nothing moved is nothing to send
  it('will not save an order that has not changed', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'Save order' })).toBeDisabled();
  });

  it('closes and says so once the order is saved', async () => {
    const setIsOpen = jest.fn();
    saveOrder.mockImplementation((_order, options) => options?.onSuccess?.());
    const user = userEvent.setup();
    renderDialog({ setIsOpen });

    await user.click(screen.getByRole('button', { name: 'Move Bustani Bistro down' }));
    await user.click(screen.getByRole('button', { name: 'Save order' }));

    await waitFor(() => expect(setIsOpen).toHaveBeenCalledWith(false));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Order saved' }));
  });

  it('stays open and says why when the save fails', async () => {
    const setIsOpen = jest.fn();
    saveOrder.mockImplementation((_order, options) => options?.onError?.(new Error('Nope')));
    const user = userEvent.setup();
    renderDialog({ setIsOpen });

    await user.click(screen.getByRole('button', { name: 'Move Bustani Bistro down' }));
    await user.click(screen.getByRole('button', { name: 'Save order' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Nope', variant: 'destructive' }),
      ),
    );
    expect(setIsOpen).not.toHaveBeenCalledWith(false);
  });

  // Cancelling and reopening should not resume a half-finished rearrangement
  it('starts again from the saved order when reopened', async () => {
    const user = userEvent.setup();
    const { rerender } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Move Bustani Bistro down' }));
    expect(rowNames()[0]).toContain('Golden Star');

    rerender(
      <ReorderItemsDialog isOpen={false} setIsOpen={jest.fn()} bucketListId="bl1" items={items} />,
    );
    rerender(<ReorderItemsDialog isOpen setIsOpen={jest.fn()} bucketListId="bl1" items={items} />);

    expect(rowNames()[0]).toContain('Bustani Bistro');
  });
});
