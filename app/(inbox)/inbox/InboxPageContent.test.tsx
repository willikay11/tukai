import React from 'react';

import { render, screen } from '@testing-library/react';

import { InboxPageContent } from './InboxPageContent';

let session: { user: { id: string } } | null = { user: { id: 'u1' } };
let status = 'authenticated';
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: session, status }) }));

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

jest.mock('@/app/shared/components/Inbox', () => ({
  InboxContent: ({ myId, tab }: { myId: string; tab: string }) => (
    <div>
      {tab} for {myId}
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

  it('asks a signed-out reader to sign in', () => {
    session = null;
    status = 'unauthenticated';
    render(<InboxPageContent />);

    expect(screen.getByText('Sign in to see your inbox.')).toBeInTheDocument();
  });
});
