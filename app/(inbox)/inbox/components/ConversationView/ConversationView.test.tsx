import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Message, toThreads } from '@/types/message';

import { ConversationView } from './index';

const send = jest.fn();
jest.mock('@/app/shared/hooks/useMessages', () => ({
  useSendMessageTo: () => ({ mutate: send, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const ME = 'me';

const fromThem = (overrides: Partial<Message> = {}): Message => ({
  id: 'm1',
  sender: { id: 'them', displayName: 'Amina' },
  recipient: { id: ME },
  content: 'Is the hike still on?',
  isRead: true,
  dateCreated: '2026-09-29T10:00:00Z',
  ...overrides,
});

const fromMe = (overrides: Partial<Message> = {}): Message =>
  fromThem({ sender: { id: ME }, recipient: { id: 'them', displayName: 'Amina' }, ...overrides });

const renderConversation = (messages: Message[] = [fromThem()]) => {
  const [thread] = toThreads(messages, ME);
  return render(<ConversationView thread={thread} myId={ME} onBack={jest.fn()} />);
};

const write = async (text: string) => {
  await userEvent.type(screen.getByLabelText('Message Amina'), text);
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
};

describe('a conversation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is headed by the person it is with', () => {
    renderConversation();

    expect(screen.getByText('Amina')).toBeInTheDocument();
  });

  it('shows both sides', () => {
    renderConversation([fromThem(), fromMe({ id: 'm2', content: 'Yes, 6am.' })]);

    expect(screen.getByText('Is the hike still on?')).toBeInTheDocument();
    expect(screen.getByText('Yes, 6am.')).toBeInTheDocument();
  });

  it('sends what was written to the person it is with', async () => {
    renderConversation();

    await write('On my way');

    expect(send).toHaveBeenCalledWith(
      { content: 'On my way', recipientId: 'them' },
      expect.anything(),
    );
  });

  it('will not send an empty message', async () => {
    renderConversation();

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(send).not.toHaveBeenCalled();
  });

  it('trims what was written', async () => {
    renderConversation();

    await write('   Coming   ');

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'Coming' }),
      expect.anything(),
    );
  });

  it('clears the field once the message is away', async () => {
    send.mockImplementation((_data, { onSuccess }) => onSuccess({ success: true }));
    renderConversation();

    await write('On my way');

    expect(screen.getByLabelText('Message Amina')).toHaveValue('');
  });

  /**
   * The send service reports a refusal in its own result rather than throwing,
   * so a failure would otherwise read as a sent message.
   */
  it('reports a refusal that came back as a result', async () => {
    send.mockImplementation((_data, { onSuccess }) =>
      onSuccess({ success: false, message: 'Recipient not found' }),
    );
    renderConversation();

    await write('On my way');

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Recipient not found', variant: 'destructive' }),
    );
    expect(screen.getByLabelText('Message Amina')).toHaveValue('On my way');
  });

  it('reports a thrown failure too', async () => {
    send.mockImplementation((_data, { onError }) => onError(new Error('Offline')));
    renderConversation();

    await write('On my way');

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Offline', variant: 'destructive' }),
    );
  });
});
