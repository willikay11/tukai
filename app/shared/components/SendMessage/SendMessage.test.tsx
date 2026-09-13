import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SendMessage } from './SendMessage';

const sendMessage = jest.fn();
let isPending = false;
let isSuccess = false;
let isError = false;

jest.mock('@/app/(experiences)/hooks/useComms', () => ({
  useSendMessage: () => ({ mutate: sendMessage, isPending, isSuccess, isError }),
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
});
