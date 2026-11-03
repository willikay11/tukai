import React from 'react';

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Message, toThreads } from '@/types/message';

import { ConversationView } from './index';

const send = jest.fn();
const markRead = jest.fn();
const remove = jest.fn();
jest.mock('@/app/shared/hooks/useMessages', () => ({
  useSendMessageTo: () => ({ mutate: send }),
  useMarkMessageRead: () => ({ mutate: markRead }),
  useDeleteConversation: () => ({ mutate: remove }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const ME = 'me';

// Local times, so the breaks read the same in any time zone
const at = (day: number, hours: number, minutes: number) =>
  new Date(2026, 10, day, hours, minutes).toISOString();

const fromThem = (overrides: Partial<Message> = {}): Message => ({
  id: 'm1',
  sender: { id: 'them', displayName: 'Amina Hassan' },
  recipient: { id: ME },
  content: 'Start with breakfast at Artcaffé in Westlands.',
  isRead: true,
  dateCreated: at(1, 12, 58),
  ...overrides,
});

const fromMe = (overrides: Partial<Message> = {}): Message =>
  fromThem({
    sender: { id: ME },
    recipient: { id: 'them', displayName: 'Amina Hassan' },
    ...overrides,
  });

const onBack = jest.fn();
const onClose = jest.fn();

const renderConversation = (messages: Message[] = [fromThem()]) => {
  const [thread] = toThreads(messages, ME);
  return render(
    <ConversationView
      personId="them"
      thread={thread ?? null}
      me={{ id: ME, name: 'Wanjiku' }}
      onBack={onBack}
      onClose={onClose}
    />,
  );
};

const input = () => screen.getByRole('textbox', { name: 'Write a message' });

describe('a conversation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is headed by the person it is with, with Back, Delete and Close', () => {
    renderConversation();

    expect(screen.getByRole('heading', { name: 'Amina Hassan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Delete conversation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('goes Back and Closes', async () => {
    renderConversation();

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onBack).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('breaks time before the first message and after a long pause, and divides the rest', () => {
    renderConversation([
      fromThem(),
      fromMe({ id: 'm2', content: 'Love it.', dateCreated: at(1, 13, 6) }),
      fromThem({
        id: 'm3',
        content: 'Can you check the Saturday plan?',
        dateCreated: at(3, 9, 14),
      }),
    ]);

    const log = screen.getByRole('log');
    expect(within(log).getByText('Sun, Nov 1 at 12:58 PM')).toBeInTheDocument();
    expect(within(log).getByText('Tue, Nov 3 at 9:14 AM')).toBeInTheDocument();
    expect(within(log).queryByText(/at 1:06 PM/)).not.toBeInTheDocument();
  });

  it('names who said what for screen readers', () => {
    renderConversation([fromThem(), fromMe({ id: 'm2', content: 'Love it.' })]);

    expect(screen.getByText('Amina Hassan:')).toHaveClass('sr-only');
    expect(screen.getByText('You:')).toHaveClass('sr-only');
  });

  // Opening a conversation is reading it
  it('reads what was sent to the reader, and not their own', () => {
    renderConversation([
      fromThem({ isRead: false }),
      fromMe({ id: 'm2', isRead: false, dateCreated: at(1, 13, 0) }),
    ]);

    expect(markRead).toHaveBeenCalledTimes(1);
    expect(markRead).toHaveBeenCalledWith('m1');
  });

  it('sends what was written, trimmed, and clears the field at once', async () => {
    renderConversation();

    await userEvent.type(input(), '   On my way   ');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(send).toHaveBeenCalledWith(
      { content: 'On my way', recipientId: 'them', senderId: ME },
      expect.anything(),
    );
    expect(input()).toHaveValue('');
  });

  it('sends on Enter', async () => {
    renderConversation();

    await userEvent.type(input(), 'On my way{Enter}');

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'On my way' }),
      expect.anything(),
    );
  });

  // Enter that ends an input-method word is not a send
  it('ignores Enter while a word is still being composed', () => {
    renderConversation();

    fireEvent.change(input(), { target: { value: 'habari' } });
    fireEvent.keyDown(input(), { key: 'Enter', isComposing: true });

    expect(send).not.toHaveBeenCalled();
  });

  // It stays focusable, but pressing it with nothing written does nothing
  it('will not send an empty message', async () => {
    renderConversation();

    const button = screen.getByRole('button', { name: 'Send message' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();

    await userEvent.type(input(), '   ');
    await userEvent.click(button);

    expect(send).not.toHaveBeenCalled();
  });

  it('puts the message back and says so when it does not go', async () => {
    send.mockImplementation((_data, { onError }) => onError(new Error('Offline')));
    renderConversation();

    await userEvent.type(input(), 'On my way{Enter}');

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Offline', variant: 'destructive' }),
    );
    expect(input()).toHaveValue('On my way');
  });

  describe('deleting it', () => {
    it('asks first, with focus on keeping it', async () => {
      renderConversation();

      await userEvent.click(screen.getByRole('button', { name: 'Delete conversation' }));

      const dialog = screen.getByRole('alertdialog', { name: 'Delete this conversation?' });
      expect(dialog).toHaveAccessibleDescription(
        'Your messages with Amina Hassan are removed from your inbox. This can’t be undone.',
      );
      expect(within(dialog).getByRole('button', { name: 'Keep conversation' })).toHaveFocus();
    });

    it('keeps it, handing focus back to the trash button', async () => {
      renderConversation();

      await userEvent.click(screen.getByRole('button', { name: 'Delete conversation' }));
      await userEvent.click(screen.getByRole('button', { name: 'Keep conversation' }));

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete conversation' })).toHaveFocus();
      expect(remove).not.toHaveBeenCalled();
    });

    // Escape closes the dialog only, not the panel under it
    it('cancels on Escape without it reaching the panel', async () => {
      const panelEscape = jest.fn();
      document.addEventListener('keydown', panelEscape);
      renderConversation();

      await userEvent.click(screen.getByRole('button', { name: 'Delete conversation' }));
      fireEvent.keyDown(screen.getByRole('button', { name: 'Keep conversation' }), {
        key: 'Escape',
      });

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(panelEscape).not.toHaveBeenCalled();
      document.removeEventListener('keydown', panelEscape);
    });

    it('deletes it, goes Back and says so', async () => {
      renderConversation();

      await userEvent.click(screen.getByRole('button', { name: 'Delete conversation' }));
      await userEvent.click(
        within(screen.getByRole('alertdialog')).getByRole('button', {
          name: 'Delete conversation',
        }),
      );

      expect(remove).toHaveBeenCalledWith({ senderId: ME, recipientId: 'them' }, expect.anything());
      expect(onBack).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith({ title: 'Conversation deleted.' });
    });
  });
});
