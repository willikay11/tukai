import React from 'react';

import { render, screen } from '@testing-library/react';

import { ContentEditable } from './content-editable';

jest.mock('@lexical/react/LexicalContentEditable', () => ({
  ContentEditable: ({
    className,
    placeholder,
  }: {
    className: string;
    placeholder: React.ReactNode;
  }) => (
    <div>
      <div data-testid="editable" className={className} />
      {placeholder}
    </div>
  ),
}));

describe('editor ContentEditable', () => {
  // Six call sites used to restate the placeholder's styling at text-xs, so it
  // read two sizes smaller than the text that replaced it
  it('shows the placeholder at the size the writer will type at', () => {
    render(<ContentEditable placeholder="Tell people about it" />);

    const placeholder = screen.getByText('Tell people about it');
    expect(placeholder).toHaveClass('text-[14.5px]', 'text-gray-400');
    expect(placeholder.className).not.toMatch(/text-(xs|sm|base)\b/);
  });

  it('writes at the shared field size', () => {
    render(<ContentEditable placeholder="Tell people about it" />);

    expect(screen.getByTestId('editable')).toHaveClass('text-[14.5px]', 'font-normal');
  });

  it('still takes a class for the editable itself', () => {
    render(<ContentEditable placeholder="x" className="min-h-40" />);

    expect(screen.getByTestId('editable')).toHaveClass('min-h-40');
  });
});
