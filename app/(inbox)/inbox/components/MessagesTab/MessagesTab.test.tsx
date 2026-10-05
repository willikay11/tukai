import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Message } from '@/types/message';

import { MessagesTab } from './index';

const markRead = jest.fn();
let messages: Message[] | { results: Message[] } = [];
let isLoading = false;

jest.mock('@/app/shared/hooks/useMessages', () => ({
  useMessages: () => ({ data: { data: messages }, isLoading }),
  useMarkMessageRead: () => ({ mutate: markRead }),
}));

jest.mock('../ConversationView', () => ({
  ConversationView: ({ thread }: { thread: { name: string } }) => (
    <div>conversation with {thread.name}</div>
  ),
}));

const ME = 'me';

const fromThem = (overrides: Partial<Message> = {}): Message => ({
  id: 'm1',
  sender: { id: 'them', displayName: 'Amina' },
  recipient: { id: ME },
  content: 'Is the hike still on?',
  isRead: false,
  dateCreated: '2026-09-29T10:00:00Z',
  ...overrides,
});

const fromMe = (overrides: Partial<Message> = {}): Message =>
  fromThem({
    sender: { id: ME },
    recipient: { id: 'them', displayName: 'Amina' },
    isRead: true,
    ...overrides,
  });

describe('the messages tab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    messages = [fromThem()];
    isLoading = false;
  });

  /**
   * The API has no threads - one flat list of every message the reader is
   * party to - so the conversations are grouped here.
   */
  it('lists a conversation per person', () => {
    messages = [fromThem(), fromThem({ id: 'm2', sender: { id: 'other', displayName: 'Kevo' } })];
    render(<MessagesTab myId={ME} />);

    expect(screen.getByText('Amina')).toBeInTheDocument();
    expect(screen.getByText('Kevo')).toBeInTheDocument();
  });

  it('previews the last thing said', () => {
    render(<MessagesTab myId={ME} />);

    expect(screen.getByText('Is the hike still on?')).toBeInTheDocument();
  });

  // The canvas prefixes the reader's own words
  it('marks a last message the reader sent', () => {
    messages = [fromMe({ content: 'Yes, 6am.' })];
    render(<MessagesTab myId={ME} />);

    expect(screen.getByText('You: Yes, 6am.')).toBeInTheDocument();
  });

  it('counts what has not been read', () => {
    messages = [fromThem(), fromThem({ id: 'm2', content: 'Still coming?' })];
    render(<MessagesTab myId={ME} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens a conversation', async () => {
    render(<MessagesTab myId={ME} />);

    await userEvent.click(screen.getByRole('button', { name: /Amina/ }));

    expect(screen.getByText('conversation with Amina')).toBeInTheDocument();
  });

  // Opening a conversation is reading it
  it('marks what was sent to the reader as read on opening', async () => {
    render(<MessagesTab myId={ME} />);

    await userEvent.click(screen.getByRole('button', { name: /Amina/ }));

    expect(markRead).toHaveBeenCalledWith('m1');
  });

  it('does not mark a message the reader sent as read', async () => {
    messages = [fromMe({ isRead: false })];
    render(<MessagesTab myId={ME} />);

    await userEvent.click(screen.getByRole('button', { name: /Amina/ }));

    expect(markRead).not.toHaveBeenCalled();
  });

  it('narrows the list by name or by what was said', async () => {
    messages = [
      fromThem(),
      fromThem({
        id: 'm2',
        sender: { id: 'other', displayName: 'Kevo' },
        content: 'Sent the invoice',
      }),
    ];
    render(<MessagesTab myId={ME} />);

    await userEvent.type(screen.getByLabelText('Search messages'), 'invoice');

    expect(screen.getByText('Kevo')).toBeInTheDocument();
    expect(screen.queryByText('Amina')).not.toBeInTheDocument();
  });

  it('says when nothing matches the search', async () => {
    render(<MessagesTab myId={ME} />);

    await userEvent.type(screen.getByLabelText('Search messages'), 'zzz');

    expect(screen.getByText('No one matches that search.')).toBeInTheDocument();
  });

  it('reads a paginated answer as well as a bare list', () => {
    messages = { results: [fromThem()] };
    render(<MessagesTab myId={ME} />);

    expect(screen.getByText('Amina')).toBeInTheDocument();
  });

  it('says plainly when there are no messages', () => {
    messages = [];
    render(<MessagesTab myId={ME} />);

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });
});
