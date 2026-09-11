import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketList } from '@/types/bucket-list';

import { CreateBucketListModal } from './index';

const createBucketList = jest.fn();
const updateBucketList = jest.fn();
const updateFor = jest.fn((_id: string) => ({ mutate: updateBucketList, isPending: false }));

jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useCreateBucketList: () => ({ mutate: createBucketList, isPending: false }),
  useUpdateBucketList: (id: string) => updateFor(id),
}));

const existing: BucketList = {
  id: 'bl1',
  name: 'Weekend Hikes',
  description: 'Trails worth the early start',
  visibility: 'private',
  itemCount: 3,
  memberCount: 0,
};

describe('CreateBucketListModal', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('creating', () => {
    it('sends the description alongside the name', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} />);

      await user.type(screen.getByPlaceholderText(/Bucket list name/), 'Date Nights');
      await user.type(screen.getByLabelText('Description'), 'Somewhere quiet');
      await user.click(screen.getByRole('button', { name: 'Create Bucket List' }));

      expect(createBucketList).toHaveBeenCalledWith(
        { name: 'Date Nights', description: 'Somewhere quiet', visibility: 'public' },
        expect.any(Object),
      );
    });

    // It is optional, so an empty one must not block the save
    it('creates a list with no description at all', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} />);

      await user.type(screen.getByPlaceholderText(/Bucket list name/), 'Date Nights');
      await user.click(screen.getByRole('button', { name: 'Create Bucket List' }));

      expect(createBucketList).toHaveBeenCalledWith(
        expect.objectContaining({ description: '' }),
        expect.any(Object),
      );
    });
  });

  describe('editing', () => {
    it('opens on the description the list already has', () => {
      render(<CreateBucketListModal open onOpenChange={jest.fn()} bucketList={existing} />);

      expect(screen.getByLabelText('Description')).toHaveValue('Trails worth the early start');
      expect(screen.getByText('Edit Bucket List')).toBeInTheDocument();
    });

    it('saves a changed description against that list', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} bucketList={existing} />);

      await user.clear(screen.getByLabelText('Description'));
      await user.type(screen.getByLabelText('Description'), 'Now with fewer hills');
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      expect(updateFor).toHaveBeenCalledWith('bl1');
      expect(updateBucketList).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Now with fewer hills' }),
        expect.any(Object),
      );
    });

    // Sent even when emptied, or clearing one would silently do nothing
    it('lets a description be cleared', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} bucketList={existing} />);

      await user.clear(screen.getByLabelText('Description'));
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      expect(updateBucketList).toHaveBeenCalledWith(
        expect.objectContaining({ description: '' }),
        expect.any(Object),
      );
    });

    it('still refuses a list with no name', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} bucketList={existing} />);

      await user.clear(screen.getByPlaceholderText(/Bucket list name/));
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      expect(updateBucketList).not.toHaveBeenCalled();
      expect(screen.getByText(/Please enter a name/)).toBeInTheDocument();
    });
  });
});
