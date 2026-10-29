import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditInterestsDrawer } from './EditInterestsDrawer';

const save = jest.fn();
const categories = [
  { id: 'c1', name: 'Hiking', icon: 'Mountain01Icon' },
  { id: 'c2', name: 'Live music', icon: 'MusicNote01Icon' },
  { id: 'c3', name: 'Food & drink', icon: 'RestaurantIcon' },
];

jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: () => ({ data: categories, isLoading: false }),
  useUpdateMyProfile: () => ({ mutate: save, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const renderDrawer = (
  onClose = jest.fn(),
  interests: { id: string; name?: string }[] = [{ id: 'c1', name: 'Hiking' }],
) => render(<EditInterestsDrawer interests={interests} userId="u1" isOpen onClose={onClose} />);

const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('editing interests', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens with what is already selected pressed', () => {
    renderDrawer();

    expect(screen.getByRole('button', { name: /Hiking/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Live music/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps Save changes disabled until something changes', () => {
    renderDrawer();

    expect(saveButton()).toBeDisabled();
  });

  it('enables Save changes once a pill is toggled', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: /Live music/ }));

    expect(saveButton()).toBeEnabled();
  });

  it('disables Save changes if every interest is removed', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: /Hiking/ }));

    expect(saveButton()).toBeDisabled();
  });

  it('saves the selected ids', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: /Live music/ }));
    await userEvent.click(saveButton());

    expect(save).toHaveBeenCalledWith(
      { interestIds: expect.arrayContaining(['c1', 'c2']) },
      expect.anything(),
    );
  });

  it('confirms and closes once it is saved', async () => {
    const onClose = jest.fn();
    save.mockImplementation((_changes, { onSuccess }) => onSuccess());
    renderDrawer(onClose);

    await userEvent.click(screen.getByRole('button', { name: /Live music/ }));
    await userEvent.click(saveButton());

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Your interests are updated.' }));
    expect(onClose).toHaveBeenCalled();
  });
});
