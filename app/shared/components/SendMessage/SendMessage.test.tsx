import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SendMessage } from './SendMessage';

const sendMessage = jest.fn();
let isPending = false;
let isSuccess = false;
let isError = false;

// The dialog sends through the same hook as the inbox's composer
jest.mock('@/app/shared/hooks/useMessages', () => ({
  useSendMessageTo: () => ({ mutate: sendMessage, isPending, isSuccess, isError }),
}));

const messageMembers = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useMessageCommunityMembers: () => ({ mutate: messageMembers, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ toast: (args: unknown) => toast(args) }));

const renderDialog = (props: Record<string, unknown> = {}) =>
  render(<SendMessage open setOpen={jest.fn()} recipientId="host-1" {...props} />);

describe('SendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isPending = false;
    isSuccess = false;
    isError = false;
  });

  it('is titled for the person being written to', () => {
    renderDialog();

    expect(screen.getByText('Message host')).toBeInTheDocument();
  });

  // It inherits a 720px dialog otherwise, which is a page width for one field
  it('is a form width, not a page width', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).toHaveClass('max-w-[420px]', 'md:max-w-[420px]');
  });

  it('sends what was written, to the right person', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByRole('textbox'), 'Is parking available?');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith({
        content: 'Is parking available?',
        recipientId: 'host-1',
      }),
    );
  });

  it('will not send an empty message', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => expect(screen.getByText('Please enter a message.')).toBeInTheDocument());
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('closes and confirms once the message is away', async () => {
    const setOpen = jest.fn();
    isSuccess = true;

    renderDialog({ setOpen });

    await waitFor(() => expect(setOpen).toHaveBeenCalledWith(false));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
  });

  it('says so when it could not be sent', async () => {
    isError = true;

    renderDialog();

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })),
    );
  });

  // DEV-379: the owner's Message members
  describe('to a whole community', () => {
    const renderMembers = (setOpen = jest.fn()) =>
      render(
        <SendMessage open setOpen={setOpen} community={{ id: 'c1', title: 'Nairobi Hikers' }} />,
      );

    it('is titled for the members, and says where it lands', () => {
      renderMembers();

      expect(screen.getByText('Message members')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Write one message to everyone in Nairobi Hikers. It arrives in their Tukai inbox.',
        ),
      ).toBeInTheDocument();
    });

    it('sends one message to the community, not to a person', async () => {
      const user = userEvent.setup();
      const setOpen = jest.fn();
      messageMembers.mockImplementation(
        (_vars: unknown, options: { onSuccess: (r: { sent: number }) => void }) =>
          options.onSuccess({ sent: 12 }),
      );
      renderMembers(setOpen);

      await user.type(screen.getByRole('textbox'), 'Hike moved to 7am');
      await user.click(screen.getByRole('button', { name: 'Send message' }));

      await waitFor(() =>
        expect(messageMembers).toHaveBeenCalledWith(
          { communityId: 'c1', content: 'Hike moved to 7am' },
          expect.anything(),
        ),
      );
      expect(sendMessage).not.toHaveBeenCalled();
      expect(setOpen).toHaveBeenCalledWith(false);
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Sent to 12 members of Nairobi Hikers.' }),
      );
    });

    it('says so when nobody was there to message', async () => {
      const user = userEvent.setup();
      messageMembers.mockImplementation(
        (_vars: unknown, options: { onSuccess: (r: { sent: number }) => void }) =>
          options.onSuccess({ sent: 0 }),
      );
      renderMembers();

      await user.type(screen.getByRole('textbox'), 'Hello all');
      await user.click(screen.getByRole('button', { name: 'Send message' }));

      await waitFor(() =>
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'There is nobody in Nairobi Hikers to message yet.',
          }),
        ),
      );
    });

    it('keeps the message when it could not be sent', async () => {
      const user = userEvent.setup();
      const setOpen = jest.fn();
      messageMembers.mockImplementation(
        (_vars: unknown, options: { onError: (e: Error) => void }) =>
          options.onError(new Error('Only the owner can')),
      );
      renderMembers(setOpen);

      await user.type(screen.getByRole('textbox'), 'Hello all');
      await user.click(screen.getByRole('button', { name: 'Send message' }));

      await waitFor(() =>
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Could not send', description: 'Only the owner can' }),
        ),
      );
      expect(setOpen).not.toHaveBeenCalledWith(false);
      expect(screen.getByRole('textbox')).toHaveValue('Hello all');
    });
  });
});
