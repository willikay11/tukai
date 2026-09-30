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

describe('editing a profile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens on what is there now', () => {
    renderDrawer();

    expect(screen.getByLabelText('First name')).toHaveValue('Wanjiku');
    expect(screen.getByLabelText('Handle')).toHaveValue('wanjiku.m');
    expect(screen.getByLabelText('About you')).toHaveValue('Weekend hiker.');
  });

  it('saves what was changed', async () => {
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('About you'));
    await userEvent.type(screen.getByLabelText('About you'), 'Slow reader.');
    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ bio: 'Slow reader.', firstName: 'Wanjiku' }),
      expect.anything(),
    );
  });

  // The API stores the handle without its @, however it was typed
  it('strips an @ from the handle', async () => {
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('Handle'));
    await userEvent.type(screen.getByLabelText('Handle'), '@wanjiku');
    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'wanjiku' }),
      expect.anything(),
    );
  });

  it('trims what was typed', async () => {
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('Website'));
    await userEvent.type(screen.getByLabelText('Website'), '  https://example.com  ');
    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ websiteUrl: 'https://example.com' }),
      expect.anything(),
    );
  });

  it('will not save without a first name', async () => {
    renderDrawer();

    await userEvent.clear(screen.getByLabelText('First name'));
    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(save).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A first name is the one thing people need to recognise you.',
    );
  });

  it('confirms and closes once it is saved', async () => {
    const onClose = jest.fn();
    save.mockImplementation((_changes, { onSuccess }) => onSuccess());
    renderDrawer(onClose);

    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Profile saved' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the refusal the API gave', async () => {
    save.mockImplementation((_changes, { onError }) => onError(new Error('That handle is taken.')));
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('That handle is taken.');
  });

  // The picture is read-only on this serializer and the email is verified
  // rather than typed, so neither is offered
  it('offers only what the API lets a reader change', () => {
    renderDrawer();

    expect(screen.queryByLabelText(/picture/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it('copes with a profile that could not be loaded', () => {
    renderDrawer(jest.fn(), null);

    expect(screen.getByLabelText('First name')).toHaveValue('');
  });
});
