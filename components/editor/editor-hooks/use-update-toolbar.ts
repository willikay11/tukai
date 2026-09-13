import { useEffect, useRef } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  BaseSelection,
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';

import { useToolbarContext } from '@/components/editor/context/toolbar-context';

export function useUpdateToolbarHandler(callback: (selection: BaseSelection) => void) {
  useLexicalComposerContext();
  const { activeEditor } = useToolbarContext();

  // Callers pass a fresh closure on every render. Depending on it made the
  // effect below re-run each render and set state again — and because that
  // state is a newly built array, React never bailed out, so the pair looped
  // until it hit the update-depth limit. The ref keeps the latest callback
  // without making it a dependency.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return activeEditor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if (selection) {
          callbackRef.current(selection);
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [activeEditor]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      const selection = $getSelection();
      if (selection) {
        callbackRef.current(selection);
      }
    });
  }, [activeEditor]);
}
