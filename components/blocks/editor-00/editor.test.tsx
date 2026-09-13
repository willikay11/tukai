import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';

import { Editor } from './editor';

describe('Editor HTML round trip', () => {
  // The bug this covers: the old loader stripped every tag with a regex, so a
  // description saved with formatting came back as plain text
  it('restores the formatting stored in the HTML', async () => {
    render(<Editor initialHtml="<p>A <strong>bold</strong> and <em>italic</em> plan</p>" />);

    await waitFor(() => expect(screen.getByText('bold')).toBeInTheDocument());

    // Lexical wraps formatted runs in a span, so the tag is on an ancestor
    expect(screen.getByText('bold').closest('strong')).toBeInTheDocument();
    expect(screen.getByText('italic').closest('em')).toBeInTheDocument();
  });

  it('restores headings and lists', async () => {
    render(<Editor initialHtml="<h2>Day one</h2><ul><li>Coffee</li><li>Hike</li></ul>" />);

    await waitFor(() => expect(screen.getByText('Day one')).toBeInTheDocument());

    expect(screen.getByText('Day one').closest('h2')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  // Loading is not editing: firing a change here would mark the form dirty
  // the moment a saved description was opened
  it('reports no change just for loading', async () => {
    const onHtmlChange = jest.fn();

    render(<Editor initialHtml="<p>Hello</p>" onHtmlChange={onHtmlChange} />);

    await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument());
    expect(onHtmlChange).not.toHaveBeenCalled();
  });

  it('opens empty when there is nothing stored', async () => {
    render(<Editor initialHtml="" />);

    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
  });
});
