import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NotificationPreferences } from '@/types/notification';

import { NotificationsDrawer } from './NotificationsDrawer';

const save = jest.fn();
let prefs: NotificationPreferences | undefined;

jest.mock('@/app/(profile)/hooks', () => ({
  useNotificationPreferences: () => ({ data: { success: true, data: prefs }, isLoading: false }),
  useUpdateNotificationPreferences: () => ({ mutate: save, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const aPrefs = (overrides: Partial<NotificationPreferences> = {}): NotificationPreferences => ({
  id: 'p1',
  email: 'wanjiku@example.com',
  marketing: false,
  communities: true,
  experiences: true,
  pushCommunity: true,
  pushExperiences: true,
  pushSocial: false,
  pushGuides: false,
  ...overrides,
});

const renderDrawer = (onClose = jest.fn()) =>
  render(<NotificationsDrawer isOpen onClose={onClose} />);

const switchRow = (name: string) => screen.getByRole('switch', { name: new RegExp(name) });
const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('notification settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prefs = aPrefs();
  });

  it('shows what is saved now', () => {
    renderDrawer();

    expect(switchRow('Marketing emails')).toHaveAttribute('aria-checked', 'false');
    expect(switchRow('Community emails')).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps Save changes disabled until something changes', () => {
    renderDrawer();

    expect(saveButton()).toBeDisabled();
  });

  it('enables Save changes once a switch is toggled', async () => {
    renderDrawer();

    await userEvent.click(switchRow('Marketing emails'));

    expect(saveButton()).toBeEnabled();
  });

  it('refuses to leave every channel off', async () => {
    renderDrawer();

    await userEvent.click(switchRow('Community emails'));
    await userEvent.click(switchRow('Experience emails'));
    await userEvent.click(switchRow('Community activity'));
    await userEvent.click(switchRow('Experience activity'));

    expect(screen.getByText('Keep at least one way for Tukai to reach you.')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('saves the toggled preferences', async () => {
    renderDrawer();

    await userEvent.click(switchRow('Marketing emails'));
    await userEvent.click(saveButton());

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p1', changes: expect.objectContaining({ marketing: true }) }),
      expect.anything(),
    );
  });

  it('confirms and closes once saved', async () => {
    const onClose = jest.fn();
    save.mockImplementation((_data, { onSuccess }) => onSuccess());
    renderDrawer(onClose);

    await userEvent.click(switchRow('Marketing emails'));
    await userEvent.click(saveButton());

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Notification settings saved' }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
