import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HeadingFormatToolbarPlugin } from './heading-format-toolbar-plugin';

const update = jest.fn();
let blockType = 'paragraph';

jest.mock('@/components/editor/context/toolbar-context', () => ({
  useToolbarContext: () => ({ activeEditor: { update }, blockType }),
}));

describe('HeadingFormatToolbarPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    blockType = 'paragraph';
  });

  it('offers the three heading levels in order', () => {
    render(<HeadingFormatToolbarPlugin />);

    const names = screen.getAllByRole('radio').map((button) => button.getAttribute('aria-label'));
    expect(names).toEqual(['Heading 1', 'Heading 2', 'Heading 3']);
  });

  it('marks the heading the cursor is in', () => {
    blockType = 'h2';

    render(<HeadingFormatToolbarPlugin />);

    expect(screen.getByRole('radio', { name: 'Heading 2' })).toHaveAttribute('data-state', 'on');
  });

  // A list or a paragraph must leave all three unpressed
  it('marks nothing outside a heading', () => {
    blockType = 'bullet';

    render(<HeadingFormatToolbarPlugin />);

    screen
      .getAllByRole('radio')
      .forEach((button) => expect(button).toHaveAttribute('data-state', 'off'));
  });

  it('applies the level the reader pressed', async () => {
    const user = userEvent.setup();
    render(<HeadingFormatToolbarPlugin />);

    await user.click(screen.getByRole('radio', { name: 'Heading 3' }));

    expect(update).toHaveBeenCalled();
  });
});
