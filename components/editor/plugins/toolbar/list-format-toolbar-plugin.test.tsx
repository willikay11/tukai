import React from 'react';

import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ListFormatToolbarPlugin } from './list-format-toolbar-plugin';

const dispatchCommand = jest.fn();
const update = jest.fn();
let blockType = 'paragraph';

jest.mock('@/components/editor/context/toolbar-context', () => ({
  useToolbarContext: () => ({ activeEditor: { dispatchCommand, update }, blockType }),
}));

describe('ListFormatToolbarPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    blockType = 'paragraph';
  });

  it('offers all three list kinds, numbered first', () => {
    render(<ListFormatToolbarPlugin />);

    const names = screen.getAllByRole('radio').map((button) => button.getAttribute('aria-label'));
    expect(names).toEqual(['Numbered list', 'Bulleted list', 'Checklist']);
  });

  it.each([
    ['Numbered list', INSERT_ORDERED_LIST_COMMAND],
    ['Bulleted list', INSERT_UNORDERED_LIST_COMMAND],
    ['Checklist', INSERT_CHECK_LIST_COMMAND],
  ])('inserts a %s', async (name, command) => {
    const user = userEvent.setup();
    render(<ListFormatToolbarPlugin />);

    await user.click(screen.getByRole('radio', { name }));

    expect(dispatchCommand).toHaveBeenCalledWith(command, undefined);
  });

  it('marks the list the cursor is in', () => {
    blockType = 'check';

    render(<ListFormatToolbarPlugin />);

    expect(screen.getByRole('radio', { name: 'Checklist' })).toHaveAttribute('data-state', 'on');
  });

  // Pressing the active list again is how a reader leaves it
  it('unwraps back to a paragraph when the active list is pressed', async () => {
    blockType = 'bullet';
    const user = userEvent.setup();
    render(<ListFormatToolbarPlugin />);

    await user.click(screen.getByRole('radio', { name: 'Bulleted list' }));

    expect(update).toHaveBeenCalled();
    expect(dispatchCommand).not.toHaveBeenCalled();
  });
});
