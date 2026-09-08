import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ToggleGroup } from '@/components/ui/toggle-group';

import { ToolbarToggleItem } from './toolbar-toggle-item';

const renderItem = () =>
  render(
    <ToggleGroup type="single" value="bold">
      <ToolbarToggleItem value="bold" aria-label="Bold">
        B
      </ToolbarToggleItem>
      <ToolbarToggleItem value="italic" aria-label="Italic">
        I
      </ToolbarToggleItem>
    </ToggleGroup>,
  );

describe('ToolbarToggleItem', () => {
  // The pressed button has to look different from the resting white chip
  it('marks the active button in the app’s selected green', () => {
    renderItem();

    const active = screen.getByRole('radio', { name: 'Bold' });
    expect(active).toHaveAttribute('data-state', 'on');
    expect(active).toHaveClass('data-[state=on]:bg-green-200', 'data-[state=on]:text-primary');
  });

  it('rests as a rounded white chip', () => {
    renderItem();

    expect(screen.getByRole('radio', { name: 'Italic' })).toHaveClass('rounded-lg', 'bg-white');
  });

  // Without this the click blurs the editor, the toolbar re-reads a selection
  // that has not taken the format, and the button flips straight back off
  it('keeps the caret in the editor when pressed', () => {
    renderItem();

    const mouseDown = fireEvent.mouseDown(screen.getByRole('radio', { name: 'Italic' }));

    // fireEvent returns false when a handler called preventDefault
    expect(mouseDown).toBe(false);
  });
});
