import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { InboxPageContent } from './InboxPageContent';

let session: { user: { id: string } } | null = { user: { id: 'u1' } };
let status = 'authenticated';
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: session, status }) }));

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

jest.mock('@/app/shared/hooks/useMessages', () => ({
  useConversation: () => ({ thread: null }),
}));

jest.mock('@/app/shared/components/Inbox', () => ({
  InboxContent: ({
    myId,
    tab,
    onOpenConversation,
  }: {
    myId: string;
    tab: string;
    onOpenConversation: (personId: string) => void;
  }) => (
    <div>
      {tab} for {myId}
      <button type="button" onClick={() => onOpenConversation('them')}>
        Open Amina
      </button>
    </div>
  ),
  ConversationView: ({ personId, onBack }: { personId: string; onBack: () => void }) => (
    <div>
      conversation with {personId}
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  ),
}));

describe('the inbox page', () => {
  beforeEach(() => {
    session = { user: { id: 'u1' } };
    status = 'authenticated';
  });

  it('opens on notifications, for the reader whose they are', () => {
    render(<InboxPageContent />);

    expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument();
    expect(screen.getByText('notifications for u1')).toBeInTheDocument();
  });

  it('opens a conversation, and goes Back to Messages', async () => {
    render(<InboxPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Amina' }));
    expect(screen.getByText('conversation with them')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('messages for u1')).toBeInTheDocument();
  });

  it('asks a signed-out reader to sign in', () => {
    session = null;
    status = 'unauthenticated';
    render(<InboxPageContent />);

    expect(screen.getByText('Sign in to see your inbox.')).toBeInTheDocument();
  });
});
