import React from 'react';

import { render, screen } from '@testing-library/react';

import { EditDescriptionField } from './EditDescriptionField';
import { EditExcludedField } from './EditExcludedField';
import { EditIncludedField } from './EditIncludedField';

const editorProps = jest.fn();
jest.mock('@/components/blocks/editor-00/editor', () => ({
  Editor: (props: Record<string, unknown>) => {
    editorProps(props);
    return <div data-testid="editor" data-min-height={String(props.minHeight)} />;
  },
}));

/**
 * The canvas imports its Rich Text Field three times with three different
 * heights - 120 for the description, 96 for the included and excluded lists.
 * Without them all three open at the editor's own default, and the create
 * flow's three boxes are the same size where the design has them differ.
 */
describe('the create flow rich-text fields', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['description', EditDescriptionField, 120],
    ['included', EditIncludedField, 96],
    ['excluded', EditExcludedField, 96],
  ])('opens the %s field at the canvas height', (_name, Field, height) => {
    render(<Field value="" onChange={jest.fn()} />);

    expect(screen.getByTestId('editor')).toHaveAttribute('data-min-height', String(height));
  });
});
