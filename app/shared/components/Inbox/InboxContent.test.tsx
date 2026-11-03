import React, { useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InboxContent, InboxTab } from './InboxContent';

let unreadNotifications = 0;
let unreadConversations = 0;
jest.mock('@/app/shared/hooks/useNotifications', () => ({
  useUnreadNotificationCount: () => ({ data: { data: { count: unreadNotifications } } }),
}));
jest.mock('@/app/shared/hooks/useMessages', () => ({
  useUnreadConversationCount: () => unreadConversations,
}));

jest.mock('./NotificationsTab', () => ({
  NotificationsTab: ({ onMarkedAll }: { onMarkedAll: () => void }) => (
    <button type="button" onClick={onMarkedAll}>
      Mark all as read
    </button>
  ),
}));
jest.mock('./MessagesTab', () => ({
  MessagesTab: ({ myId }: { myId: string }) => <div>messages for {myId}</div>,
}));

const Harness = ({
  start = 'notifications',
  autoFocus = false,
}: {
  start?: InboxTab;
  autoFocus?: boolean;
}) => {
  const [tab, setTab] = useState<InboxTab>(start);

  return <InboxContent myId="u1" tab={tab} onTabChange={setTab} autoFocus={autoFocus} />;
};

describe('the inbox tabs', () => {
  beforeEach(() => {
    unreadNotifications = 0;
    unreadConversations = 0;
  });

  it('opens on the tab it is given', () => {
    render(<Harness start="messages" />);

    expect(screen.getByRole('tab', { name: 'Messages' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('messages for u1')).toBeInTheDocument();
  });

  it('counts what is unread on each tab, and nothing at zero', () => {
    unreadNotifications = 2;
    render(<Harness />);

    expect(screen.getByRole('tab', { name: 'Notifications 2' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Messages' })).toBeInTheDocument();
  });

  it('counts unread conversations on Messages', () => {
    unreadConversations = 3;
    render(<Harness />);

    expect(screen.getByRole('tab', { name: 'Messages 3' })).toBeInTheDocument();
  });

  it('ties the panel to its tab', () => {
    render(<Harness />);

    const tab = screen.getByRole('tab', { name: 'Notifications' });
    const panel = screen.getByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('switches on a click', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('tab', { name: 'Messages' }));

    expect(screen.getByText('messages for u1')).toBeInTheDocument();
  });

  it('moves between tabs with the arrow keys, wrapping', () => {
    render(<Harness />);

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Notifications' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Messages' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Messages' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Messages' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveFocus();
  });

  it('keeps only the picked tab in the tab order', () => {
    render(<Harness />);

    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Messages' })).toHaveAttribute('tabindex', '-1');
  });

  it('puts focus on the picked tab when asked to on arrival', () => {
    render(<Harness start="messages" autoFocus />);

    expect(screen.getByRole('tab', { name: 'Messages' })).toHaveFocus();
  });

  // The Mark all as read button goes, so focus needs somewhere to land
  it('moves focus to Notifications after everything is marked read', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));

    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveFocus();
  });
});
