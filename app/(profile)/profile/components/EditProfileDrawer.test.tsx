import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MyProfile } from '../profile';
import { EditProfileDrawer } from './EditProfileDrawer';

const save = jest.fn();
jest.mock('@/app/shared/hooks/useAuth', () => ({
  useUpdateMyProfile: () => ({ mutate: save, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const profile = (overrides: Partial<MyProfile> = {}): MyProfile =>
  ({
    id: 'u1',
    firstName: 'Wanjiku',
    lastName: 'Maina',
    displayName: 'wanjiku.m',
    bio: 'Weekend hiker.',
    ...overrides,
  }) as MyProfile;

const renderDrawer = (onClose = jest.fn(), current: MyProfile | null = profile()) =>
  render(<EditProfileDrawer profile={current} userId="u1" isOpen onClose={onClose} />);

const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('editing a profile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens on what is there now', () => {
    renderDrawer();

    expect(screen.getByLabelText('First name')).toHaveValue('Wanjiku');
    expect(screen.getByLabelText('Last name')).toHaveValue('Maina');
    expect(screen.getByLabelText('Username')).toHaveValue('wanjiku.m');
    expect(screen.getByLabelText('Bio')).toHaveValue('Weekend hiker.');
  });

  it('keeps Save changes disabled until something changes', () => {
    renderDrawer();

    expect(saveButton()).toBeDisabled();
  });

  it('lowercases a username and drops anything not a letter, number, dot or underscore', async () => {
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('Username'));
    await userEvent.type(screen.getByLabelText('Username'), '@Wanjiku 123!');

    expect(screen.getByLabelText('Username')).toHaveValue('wanjiku123');
  });

  it('disables Save changes for a username shorter than 3 characters', async () => {
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('Username'));
    await userEvent.type(screen.getByLabelText('Username'), 'ab');

    expect(saveButton()).toBeDisabled();
  });

  it('disables Save changes once the name is cleared', async () => {
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('First name'));
    await userEvent.clear(screen.getByLabelText('Last name'));

    expect(saveButton()).toBeDisabled();
  });

  it('saves what was changed', async () => {
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('Bio'));
    await userEvent.type(screen.getByLabelText('Bio'), 'Slow reader.');
    expect(saveButton()).toBeEnabled();

    await userEvent.click(saveButton());

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ bio: 'Slow reader.', firstName: 'Wanjiku' }),
      expect.anything(),
    );
  });

  it('confirms and closes once it is saved', async () => {
    const onClose = jest.fn();
    save.mockImplementation((_changes, { onSuccess }) => onSuccess());
    renderDrawer(onClose);

    await userEvent.type(screen.getByLabelText('Bio'), ' Slow reader.');
    await userEvent.click(saveButton());

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Your profile is updated.' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the refusal the API gave', async () => {
    save.mockImplementation((_changes, { onError }) => onError(new Error('That username is taken.')));
    renderDrawer();

    await userEvent.type(screen.getByLabelText('Bio'), ' Slow reader.');
    await userEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('That username is taken.');
  });

  // The picture is changed through a toast-only action (the photo picker isn't
  // designed yet), and the email is verified rather than typed, so neither is
  // a field here. Website and YouTube dropped too - this handoff's Social
  // links are Instagram, X and TikTok only.
  it('offers only what this handoff asks for', () => {
    renderDrawer();

    expect(screen.queryByLabelText(/^Website$/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^YouTube$/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/picture/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Instagram username')).toBeInTheDocument();
    expect(screen.getByLabelText('X username')).toBeInTheDocument();
    expect(screen.getByLabelText('TikTok username')).toBeInTheDocument();
  });

  it('copes with a profile that could not be loaded', () => {
    renderDrawer(jest.fn(), null);

    expect(screen.getByLabelText('First name')).toHaveValue('');
  });
});
