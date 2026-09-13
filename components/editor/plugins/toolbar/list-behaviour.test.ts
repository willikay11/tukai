import { $generateNodesFromDOM } from '@lexical/html';
import { INSERT_ORDERED_LIST_COMMAND, registerList } from '@lexical/list';
import { $getRoot, $insertNodes, type LexicalEditor, createEditor } from 'lexical';

import { nodes } from '@/components/blocks/editor-00/nodes';

/**
 * What making a list actually does to the blocks around it.
 *
 * These drive a real Lexical editor rather than a mocked one — the toolbar's
 * own tests assert that the command is dispatched, which cannot tell you what
 * the command then does to the document.
 */
const makeEditor = (html: string): LexicalEditor => {
  const editor = createEditor({
    nodes: [...nodes],
    onError: (error) => {
      throw error;
    },
  });

  // Without a root element Lexical drops the selection on reconcile, and the
  // list command then has nothing to act on
  const root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.appendChild(root);
  editor.setRootElement(root);
  registerList(editor);

  editor.update(
    () => {
      const dom = new DOMParser().parseFromString(html, 'text/html');
      const parsed = $generateNodesFromDOM(editor, dom);
      $getRoot().select();
      $insertNodes(parsed);
    },
    { discrete: true },
  );

  return editor;
};

/** e.g. ['paragraph:Text before', 'list:[One | Two]'] */
const treeOf = (editor: LexicalEditor): string[] => {
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

const numberTheLastBlock = (editor: LexicalEditor) => {
  editor.update(
    () => {
      const children = $getRoot().getChildren();
      (children[children.length - 1] as never as { selectStart: () => void }).selectStart();
    },
    { discrete: true },
  );

  editor.update(
    () => {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    },
    { discrete: true },
  );
};

describe('making a paragraph into a numbered list', () => {
  it('leaves a plain paragraph above it alone', () => {
    const editor = makeEditor('<p>First paragraph</p><p>Second paragraph</p>');

    numberTheLastBlock(editor);

    expect(treeOf(editor)).toEqual(['paragraph:First paragraph', 'list:[Second paragraph]']);
  });

  it('leaves headings and formatted text above it alone', () => {
    const editor = makeEditor(
      "<p><strong>The Lord Erroll</strong> is <em>East Africa's premier</em> restaurant.</p>" +
        '<h2>Our story</h2>' +
        '<p>A colonial-era house adds to its allure.</p>' +
        '<p>More than a culinary destination.</p>',
    );

    numberTheLastBlock(editor);

    expect(treeOf(editor)).toEqual([
      "paragraph:The Lord Erroll is East Africa's premier restaurant.",
      'heading:Our story',
      'paragraph:A colonial-era house adds to its allure.',
      'list:[More than a culinary destination.]',
    ]);
  });

  /**
   * Lexical's own normalisation merges adjacent lists, which renumbers the list
   * above along with the paragraph the reader actually picked. The toolbar
   * undoes that, so this is what the raw command does on its own.
   */
  it('is merged into a list above it by the command alone', () => {
    const editor = makeEditor('<ol><li>Already numbered</li></ol><p>A plain paragraph</p>');

    numberTheLastBlock(editor);

    expect(treeOf(editor)).toEqual(['list:[Already numbered | A plain paragraph]']);
  });

  it('does not reach past a paragraph that separates it from a list', () => {
    const editor = makeEditor(
      '<ol><li>Already numbered</li></ol><p>In between</p><p>A plain paragraph</p>',
    );

    numberTheLastBlock(editor);

    expect(treeOf(editor)).toEqual([
      'list:[Already numbered]',
      'paragraph:In between',
      'list:[A plain paragraph]',
    ]);
  });
});
