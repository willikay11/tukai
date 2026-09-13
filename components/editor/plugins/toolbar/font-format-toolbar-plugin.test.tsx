import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FontFormatToolbarPlugin } from './font-format-toolbar-plugin';

const dispatchCommand = jest.fn();
jest.mock('@/components/editor/context/toolbar-context', () => ({
  useToolbarContext: () => ({ activeEditor: { dispatchCommand } }),
}));

jest.mock('@/components/editor/editor-hooks/use-update-toolbar', () => ({
  useUpdateToolbarHandler: jest.fn(),
}));

describe('FontFormatToolbarPlugin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('offers every text format the editor styles', () => {
    render(<FontFormatToolbarPlugin />);

    ['Bold', 'Italic', 'Underline', 'Strikethrough', 'Code'].forEach((name) =>
      expect(screen.getByRole('button', { name })).toBeInTheDocument(),
    );
  });

  it('dispatches the format the reader pressed', async () => {
    const user = userEvent.setup();
    render(<FontFormatToolbarPlugin />);

    await user.click(screen.getByRole('button', { name: 'Strikethrough' }));

    expect(dispatchCommand).toHaveBeenCalledWith(expect.anything(), 'strikethrough');
  });
});
