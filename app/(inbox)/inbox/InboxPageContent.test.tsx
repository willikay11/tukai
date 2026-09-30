import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InboxPageContent } from './InboxPageContent';

let session: { user: { id: string } } | null = { user: { id: 'u1' } };
let status = 'authenticated';
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: session, status }) }));

let unreadCount = 0;
jest.mock('@/app/shared/hooks/useNotifications', () => ({
  useUnreadNotificationCount: () => ({ data: { data: { count: unreadCount } } }),
}));

jest.mock('./components/NotificationsTab', () => ({
  NotificationsTab: () => <div>notifications go here</div>,
}));

jest.mock('./components/MessagesTab', () => ({
  MessagesTab: ({ myId }: { myId: string }) => <div>messages for {myId}</div>,
}));

describe('the inbox', () => {
  beforeEach(() => {
    session = { user: { id: 'u1' } };
    status = 'authenticated';
    unreadCount = 0;
  });

  it('opens on notifications', () => {
    render(<InboxPageContent />);

    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('notifications go here')).toBeInTheDocument();
  });

  it('counts what is unread on the tab', () => {
    unreadCount = 3;
    render(<InboxPageContent />);

    expect(screen.getByRole('tab', { name: 'Notifications 3' })).toBeInTheDocument();
  });

  // Past nine a badge stops counting
  it('stops counting past nine', () => {
    unreadCount = 24;
    render(<InboxPageContent />);

    expect(screen.getByRole('tab', { name: 'Notifications 9+' })).toBeInTheDocument();
  });

  it('shows no badge when there is nothing unread', () => {
    render(<InboxPageContent />);

    expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument();
  });

  // The canvas puts the two side by side
  it('switches to the messages, for the reader whose they are', async () => {
    render(<InboxPageContent />);

    await userEvent.click(screen.getByRole('tab', { name: 'Messages' }));

    expect(screen.getByText('messages for u1')).toBeInTheDocument();
    expect(screen.queryByText('notifications go here')).not.toBeInTheDocument();
  });

  it('asks a signed-out reader to sign in', () => {
    session = null;
    status = 'unauthenticated';
    render(<InboxPageContent />);

    expect(screen.getByText('Sign in to see your inbox.')).toBeInTheDocument();
  });
});
