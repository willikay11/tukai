import React from 'react';

import { $generateNodesFromDOM } from '@lexical/html';
import { registerList } from '@lexical/list';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { $getRoot, $insertNodes, type LexicalEditor, createEditor } from 'lexical';

import { nodes } from '@/components/blocks/editor-00/nodes';

import { ListFormatToolbarPlugin } from './list-format-toolbar-plugin';

let editor: LexicalEditor;
let blockType = 'paragraph';

jest.mock('@/components/editor/context/toolbar-context', () => ({
  useToolbarContext: () => ({ activeEditor: editor, blockType }),
}));

const seed = (html: string) => {
  editor = createEditor({
    nodes: [...nodes],
    onError: (error) => {
      throw error;
    },
  });

  const root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.appendChild(root);
  editor.setRootElement(root);
  registerList(editor);

  editor.update(
    () => {
      const dom = new DOMParser().parseFromString(html, 'text/html');
      $getRoot().select();
      $insertNodes($generateNodesFromDOM(editor, dom));
    },
    { discrete: true },
  );

  // The caret goes in the last block, as it would after a click
  editor.update(
    () => {
      const children = $getRoot().getChildren();
      (children[children.length - 1] as never as { selectStart: () => void }).selectStart();
    },
    { discrete: true },
  );
};

const treeOf = (): string[] => {
  let out: string[] = [];

  editor.getEditorState().read(() => {
    out = $getRoot()
      .getChildren()
      .map((node) =>
        node.getType() === 'list'
          ? `list:[${(node as never as { getChildren: () => { getTextContent: () => string }[] })
              .getChildren()
              .map((child) => child.getTextContent())
              .join(' | ')}]`
          : `${node.getType()}:${node.getTextContent()}`,
      );
  });

  return out;
};

describe('ListFormatToolbarPlugin against a real editor', () => {
  beforeEach(() => {
    blockType = 'paragraph';
  });

  /**
   * The reported bug. Shift+Enter keeps both lines in one paragraph, and a
   * paragraph becomes one list item — so the line above was numbered along
   * with the one the writer picked.
   */
  it('numbers only the line the caret is in, not the one above the break', async () => {
    const user = userEvent.setup();
    seed('<p>Intro text<br>The line I want numbered</p>');
    render(<ListFormatToolbarPlugin />);

    // The caret sits in the second line, which is the one being numbered
    editor.update(
      () => {
        ($getRoot().getLastChild() as never as { selectEnd: () => void }).selectEnd();
      },
      { discrete: true },
    );

    await user.click(screen.getByRole('radio', { name: 'Numbered list' }));

    expect(treeOf()).toEqual(['paragraph:Intro text', 'list:[The line I want numbered]']);
  });

  it('gives every line its own item when the whole paragraph is selected', async () => {
    const user = userEvent.setup();
    seed('<p>First line<br>Second line<br>Third line</p>');
    render(<ListFormatToolbarPlugin />);

    editor.update(
      () => {
        ($getRoot().getFirstChild() as never as { select: () => void }).select();
      },
      { discrete: true },
    );

    await user.click(screen.getByRole('radio', { name: 'Bulleted list' }));

    expect(treeOf()).toEqual([
      'paragraph:First line',
      'paragraph:Second line',
      'list:[Third line]',
    ]);
  });

  // Splitting is for soft breaks only — a heading holding one is one block
  it('leaves a paragraph without line breaks whole', async () => {
    const user = userEvent.setup();
    seed('<p>First paragraph</p><p>A single unbroken paragraph</p>');
    render(<ListFormatToolbarPlugin />);

    await user.click(screen.getByRole('radio', { name: 'Numbered list' }));

    expect(treeOf()).toEqual(['paragraph:First paragraph', 'list:[A single unbroken paragraph]']);
  });

  /**
   * `@lexical/list` merges adjacent lists of the same type as a structural
   * invariant — two of them re-merge even when split by hand — so numbering a
   * paragraph under a list continues that list, as it does in other editors.
   */
  it('continues a list directly above it', async () => {
    const user = userEvent.setup();
    seed('<ol><li>Already numbered</li></ol><p>A plain paragraph</p>');
    render(<ListFormatToolbarPlugin />);

    await user.click(screen.getByRole('radio', { name: 'Numbered list' }));

    expect(treeOf()).toEqual(['list:[Already numbered | A plain paragraph]']);
  });

  it('leaves a plain paragraph above untouched, as it always did', async () => {
    const user = userEvent.setup();
    seed('<p>First paragraph</p><p>Second paragraph</p>');
    render(<ListFormatToolbarPlugin />);

    await user.click(screen.getByRole('radio', { name: 'Bulleted list' }));

    expect(treeOf()).toEqual(['paragraph:First paragraph', 'list:[Second paragraph]']);
  });
});
