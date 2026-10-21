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

const fillForm = async (user: ReturnType<typeof userEvent.setup>, name: string, desc: string) => {
  await user.type(screen.getByPlaceholderText(/Enter bucket list name/), name);
  await user.type(screen.getByLabelText('Bucket list description'), desc);
};

describe('CreateBucketListModal', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('creating', () => {
    it('keeps Create disabled until both a name and a description are entered', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} />);

      const submit = screen.getByRole('button', { name: 'Create bucket list' });
      expect(submit).toBeDisabled();

      await user.type(screen.getByPlaceholderText(/Enter bucket list name/), 'Date Nights');
      expect(submit).toBeDisabled();

      await user.type(screen.getByLabelText('Bucket list description'), 'Somewhere quiet');
      expect(submit).toBeEnabled();
    });

    it('sends the trimmed name and description', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} />);

      await fillForm(user, '  Date Nights  ', '  Somewhere quiet  ');
      await user.click(screen.getByRole('button', { name: 'Create bucket list' }));

      expect(createBucketList).toHaveBeenCalledWith(
        { name: 'Date Nights', description: 'Somewhere quiet', visibility: 'public' },
        expect.any(Object),
      );
    });

    it('moves focus to the description when Enter is pressed in the name field', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} />);

      await user.type(screen.getByPlaceholderText(/Enter bucket list name/), 'Date Nights{Enter}');

      expect(screen.getByLabelText('Bucket list description')).toHaveFocus();
    });

    it('shows the description counter only once space is running out', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} />);

      const description = screen.getByLabelText('Bucket list description');
      await user.type(description, 'Somewhere quiet');
      expect(screen.queryByText(/\/ 160/)).not.toBeInTheDocument();

      await user.type(description, 'x'.repeat(130 - 'Somewhere quiet'.length));
      expect(screen.getByText('130 / 160')).toBeInTheDocument();
    });

    it('replaces the form with the success view once creation succeeds', async () => {
      const user = userEvent.setup();
      createBucketList.mockImplementation((payload, { onSuccess }) => {
        onSuccess({ data: { id: 'new-list-1', ...payload } });
      });

      render(<CreateBucketListModal open onOpenChange={jest.fn()} />);

      await fillForm(user, 'Date Nights', 'Somewhere quiet');
      await user.click(screen.getByRole('button', { name: 'Create bucket list' }));

      expect(screen.getByText('Your bucket list is ready')).toBeInTheDocument();
      expect(screen.getByText(/Date Nights/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View bucket list' })).toHaveAttribute(
        'href',
        '/bucket-lists/new-list-1',
      );
      expect(screen.getByRole('button', { name: /Share link/ })).toBeInTheDocument();
      // The form is gone, not just hidden
      expect(screen.queryByPlaceholderText(/Enter bucket list name/)).not.toBeInTheDocument();
    });

    it('copies the new list\'s link when Share link is pressed', async () => {
      const user = userEvent.setup();
      // After setup(): userEvent installs its own clipboard stub, which would
      // otherwise shadow this one
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
      });
      createBucketList.mockImplementation((payload, { onSuccess }) => {
        onSuccess({ data: { id: 'new-list-1', ...payload } });
      });

      render(<CreateBucketListModal open onOpenChange={jest.fn()} />);

      await fillForm(user, 'Date Nights', 'Somewhere quiet');
      await user.click(screen.getByRole('button', { name: 'Create bucket list' }));
      await user.click(screen.getByRole('button', { name: /Share link/ }));

      expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/bucket-lists/new-list-1'));
    });

    it('offers Invite members instead of Share link for a private list', async () => {
      const user = userEvent.setup();
      createBucketList.mockImplementation((payload, { onSuccess }) => {
        onSuccess({ data: { id: 'new-list-1', ...payload } });
      });

      render(<CreateBucketListModal open onOpenChange={jest.fn()} />);

      await fillForm(user, 'Date Nights', 'Somewhere quiet');
      await user.click(screen.getByRole('radio', { name: /Private/ }));
      await user.click(screen.getByRole('button', { name: 'Create bucket list' }));

      expect(screen.getByRole('button', { name: /Invite members/ })).toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('opens pre-filled with the list it is editing', () => {
      render(<CreateBucketListModal open onOpenChange={jest.fn()} bucketList={existing} />);

      expect(screen.getByLabelText('Bucket list description')).toHaveValue(
        'Trails worth the early start',
      );
      expect(screen.getByText('Edit bucket list')).toBeInTheDocument();
    });

    it('saves a changed description against that list and closes', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      updateBucketList.mockImplementation((payload, { onSuccess }) => onSuccess());

      render(<CreateBucketListModal open onOpenChange={onOpenChange} bucketList={existing} />);

      await user.clear(screen.getByLabelText('Bucket list description'));
      await user.type(screen.getByLabelText('Bucket list description'), 'Now with fewer hills');
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(updateFor).toHaveBeenCalledWith('bl1');
      expect(updateBucketList).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Now with fewer hills' }),
        expect.any(Object),
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('disables Save changes if the description is cleared', async () => {
      const user = userEvent.setup();
      render(<CreateBucketListModal open onOpenChange={jest.fn()} bucketList={existing} />);

      await user.clear(screen.getByLabelText('Bucket list description'));

      expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    });

    it('warns when the visibility no longer matches what was saved', async () => {
      const user = userEvent.setup();
      // existing.visibility is 'private'
      render(<CreateBucketListModal open onOpenChange={jest.fn()} bucketList={existing} />);

      expect(screen.queryByText(/Switching to/)).not.toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: /Public/ }));

      expect(
        screen.getByText(/Switching to Public means anyone can find, view and join it\./),
      ).toBeInTheDocument();
    });
  });
});
