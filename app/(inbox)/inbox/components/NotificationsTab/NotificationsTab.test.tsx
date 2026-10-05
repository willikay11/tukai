import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppNotification } from '@/types/notification';

import { NotificationsTab } from './index';

const markRead = jest.fn();
const markAllRead = jest.fn();
let notifications: AppNotification[] | { results: AppNotification[] } = [];
let isLoading = false;

jest.mock('@/app/shared/hooks/useNotifications', () => ({
  useNotifications: () => ({ data: { data: notifications }, isLoading }),
  useMarkNotificationRead: () => ({ mutate: markRead, isPending: false, variables: undefined }),
  useMarkAllNotificationsRead: () => ({ mutate: markAllRead, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const notification = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n1',
  content: 'Amina joined Nairobi Hikers',
  isRead: false,
  pushCategory: 'community',
  dateCreated: '2026-09-29T10:00:00Z',
  ...overrides,
});

describe('the notifications tab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notifications = [notification()];
    isLoading = false;
  });

  it('says what happened', () => {
    render(<NotificationsTab />);

    expect(screen.getByText('Amina joined Nairobi Hikers')).toBeInTheDocument();
  });

  // The canvas's two groups
  it('keeps what is new apart from what has been seen', () => {
    notifications = [
      notification(),
      notification({ id: 'n2', content: 'Your ticket is confirmed', isRead: true }),
    ];
    render(<NotificationsTab />);

    expect(screen.getByRole('heading', { name: 'New' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Earlier' })).toBeInTheDocument();
  });

  it('leaves out the New heading when nothing is unread', () => {
    notifications = [notification({ isRead: true })];
    render(<NotificationsTab />);

    expect(screen.queryByRole('heading', { name: 'New' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark all as read' })).not.toBeInTheDocument();
  });

  it('marks one as read', async () => {
    render(<NotificationsTab />);

    await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));

    expect(markRead).toHaveBeenCalledWith('n1', expect.anything());
  });

  it('marks everything as read', async () => {
    render(<NotificationsTab />);

    await userEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));

    expect(markAllRead).toHaveBeenCalled();
  });

  // One already read has nothing left to press
  it('does not offer to re-read what has been read', () => {
    notifications = [notification({ isRead: true })];
    render(<NotificationsTab />);

    expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument();
  });

  it('reports a refusal rather than looking like it worked', async () => {
    markRead.mockImplementation((_id, { onError }) => onError(new Error('Gone')));
    render(<NotificationsTab />);

    await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Gone', variant: 'destructive' }),
    );
  });

  it('reads a paginated answer as well as a bare list', () => {
    notifications = { results: [notification()] };
    render(<NotificationsTab />);

    expect(screen.getByText('Amina joined Nairobi Hikers')).toBeInTheDocument();
  });

  it('says plainly when there is nothing to catch up on', () => {
    notifications = [];
    render(<NotificationsTab />);

    expect(screen.getByText('Nothing to catch up on')).toBeInTheDocument();
  });

  it('shows nothing but a placeholder while it loads', () => {
    notifications = [];
    isLoading = true;
    render(<NotificationsTab />);

    expect(screen.queryByText('Nothing to catch up on')).not.toBeInTheDocument();
  });
});
