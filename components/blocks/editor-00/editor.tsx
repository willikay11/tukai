'use client';

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $insertNodes, EditorState, LexicalEditor, SerializedEditorState } from 'lexical';

import { editorTheme } from '@/components/editor/themes/editor-theme';
import { TooltipProvider } from '@/components/ui/tooltip';

import { nodes } from './nodes';
import { Plugins } from './plugins';

/**
 * Seeds the editor from stored HTML.
 *
 * Lexical's own parser is what makes the round trip hold: it restores every
 * format the toolbar can apply — bold, italic, underline, strikethrough, code,
 * headings, lists and alignment — where hand-rolled loaders have to know about
 * each tag and silently drop the ones they do not.
 */
const editorStateFromHtml = (html: string) => (editor: LexicalEditor) => {
  const dom = new DOMParser().parseFromString(html, 'text/html');
  const nodes = $generateNodesFromDOM(editor, dom);

  if (nodes.length === 0) return;

  $getRoot().select();
  $insertNodes(nodes);
};

const editorConfig: InitialConfigType = {
  namespace: 'Editor',
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

export function Editor({
  editorState,
  editorSerializedState,
  initialHtml,
  onChange,
  onSerializedChange,
  onHtmlChange,
  className,
  placeholderClassName,
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  // The stored value, for callers that persist HTML rather than editor state
  initialHtml?: string;
  onChange?: (editorState: EditorState, editor: LexicalEditor) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  onHtmlChange?: (html: string) => void;
  className?: string;
  placeholderClassName?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-lg border bg-background ${className || ''}`}>
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState ? { editorState: JSON.stringify(editorSerializedState) } : {}),
          ...(initialHtml ? { editorState: editorStateFromHtml(initialHtml) } : {}),
        }}
      >
        <TooltipProvider>
          <Plugins placeholderClassName={placeholderClassName} />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState, editor) => {
              onChange?.(editorState, editor);
              onSerializedChange?.(editorState.toJSON());
              // Read inside the state being reported, not the live one
              if (onHtmlChange) {
                editorState.read(() => onHtmlChange($generateHtmlFromNodes(editor, null)));
              }
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
