import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppNotification } from '@/types/notification';

import { NotificationsTab } from './index';

const markRead = jest.fn();
const markAllRead = jest.fn();
let response: Record<string, unknown> | undefined;
let isLoading = false;

jest.mock('@/app/shared/hooks/useNotifications', () => ({
  useNotifications: () => ({ data: response, isLoading }),
  useMarkNotificationRead: () => ({ mutate: markRead }),
  useMarkAllNotificationsRead: () => ({ mutate: markAllRead }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const notification = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n1',
  content: 'Kevin Mwangi joined your community Trails And Us.',
  isRead: false,
  pushCategory: 'community',
  dateCreated: new Date(2026, 10, 3, 9, 20).toISOString(),
  ...overrides,
});

const answer = (data: AppNotification[] | { results: AppNotification[] }) => ({
  success: true,
  data,
});

describe('the notifications tab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    response = answer([notification()]);
    isLoading = false;
  });

  it('says what happened, and when, absolutely', () => {
    render(<NotificationsTab />);

    expect(
      screen.getByText('Kevin Mwangi joined your community Trails And Us.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Nov 3, 9:20 AM')).toBeInTheDocument();
  });

  it('keeps what is new apart from what has been seen, each list named by its heading', () => {
    response = answer([
      notification(),
      notification({
        id: 'n2',
        content: 'Your review of Board games night is live.',
        isRead: true,
      }),
    ]);
    render(<NotificationsTab />);

    expect(screen.getByRole('list', { name: 'New notifications' })).toHaveTextContent(
      'Kevin Mwangi',
    );
    expect(screen.getByRole('list', { name: 'Older notifications' })).toHaveTextContent(
      'Board games night',
    );
  });

  it('leaves out New and offers no Mark all as read when nothing is unread', () => {
    response = answer([notification({ isRead: true })]);
    render(<NotificationsTab />);

    expect(screen.queryByRole('heading', { name: 'New notifications' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark all as read' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No new notifications');
  });

  // A new account shows only the all-clear, as the design has it
  it('shows only the all-clear when there are none', () => {
    response = answer([]);
    render(<NotificationsTab />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No new notifications');
  });

  it('reads one by opening it, and goes where it points', async () => {
    const onOpen = jest.fn();
    response = answer([notification({ source: '/communities/trails-and-us' })]);
    render(<NotificationsTab onOpen={onOpen} />);

    await userEvent.click(screen.getByRole('button', { name: /Kevin Mwangi/ }));

    expect(markRead).toHaveBeenCalledWith('n1', expect.anything());
    expect(onOpen).toHaveBeenCalledWith('/communities/trails-and-us');
  });

  it('only reads one with nowhere to go', async () => {
    const onOpen = jest.fn();
    render(<NotificationsTab onOpen={onOpen} />);

    await userEvent.click(screen.getByRole('button', { name: /Kevin Mwangi/ }));

    expect(markRead).toHaveBeenCalled();
    expect(onOpen).toHaveBeenCalledWith(null);
  });

  it('does not read again what has been read', async () => {
    response = answer([notification({ isRead: true })]);
    render(<NotificationsTab />);

    await userEvent.click(screen.getByRole('button', { name: /Kevin Mwangi/ }));

    expect(markRead).not.toHaveBeenCalled();
  });

  it('marks everything as read, and says so for focus to move', async () => {
    const onMarkedAll = jest.fn();
    render(<NotificationsTab onMarkedAll={onMarkedAll} />);

    await userEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));

    expect(markAllRead).toHaveBeenCalled();
    expect(onMarkedAll).toHaveBeenCalled();
  });

  it('reports a refusal rather than looking like it worked', async () => {
    markRead.mockImplementation((_id, { onError }) => onError(new Error('Gone')));
    render(<NotificationsTab />);

    await userEvent.click(screen.getByRole('button', { name: /Kevin Mwangi/ }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Gone', variant: 'destructive' }),
    );
  });

  it('reads a paginated answer as well as a bare list', () => {
    response = answer({ results: [notification()] });
    render(<NotificationsTab />);

    expect(screen.getByText(/Kevin Mwangi/)).toBeInTheDocument();
  });

  it('says so when the list could not load', () => {
    response = { success: false, message: 'Could not load your notifications' };
    render(<NotificationsTab />);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load your notifications');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows nothing but a placeholder while it loads', () => {
    response = undefined;
    isLoading = true;
    render(<NotificationsTab />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
