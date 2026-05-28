import { useState } from 'react';

import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';
import { ListIcon, ListOrderedIcon } from 'lucide-react';

import { useToolbarContext } from '@/components/editor/context/toolbar-context';
import { ContentEditable } from '@/components/editor/editor-ui/content-editable';
import { ListMaxIndentLevelPlugin } from '@/components/editor/plugins/list-max-indent-level-plugin';
import { BlockFormatDropDown } from '@/components/editor/plugins/toolbar/block-format-toolbar-plugin';
import { FormatCheckList } from '@/components/editor/plugins/toolbar/block-format/format-check-list';
import { FormatHeading } from '@/components/editor/plugins/toolbar/block-format/format-heading';
import { FormatParagraph } from '@/components/editor/plugins/toolbar/block-format/format-paragraph';
import { FormatQuote } from '@/components/editor/plugins/toolbar/block-format/format-quote';
import { ElementFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/element-format-toolbar-plugin';
import { ToolbarPlugin } from '@/components/editor/plugins/toolbar/toolbar-plugin';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function ListFormatButtons() {
  const { activeEditor, blockType } = useToolbarContext();

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const toggleBulletedList = () => {
    if (blockType !== 'bullet') {
      activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const toggleNumberedList = () => {
    if (blockType !== 'number') {
      activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleBulletedList}
        aria-label="Bulleted list"
      >
        <ListIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleNumberedList}
        aria-label="Numbered list"
      >
        <ListOrderedIcon className="size-4" />
      </Button>
    </div>
  );
}

export function Plugins({ placeholderClassName }: { placeholderClassName?: string }) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      {/* toolbar plugins */}
      <ToolbarPlugin>
        {() => (
          <div className="flex items-center gap-1 border-b bg-background p-2">
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={['h1', 'h2', 'h3']} />
              {/* <FormatCheckList /> */}
              {/* <FormatQuote /> */}
            </BlockFormatDropDown>

            <Separator orientation="vertical" className="!h-7" />

            <ListFormatButtons />

            <Separator orientation="vertical" className="!h-7" />

            <ElementFormatToolbarPlugin separator={false} />
          </div>
        )}
      </ToolbarPlugin>

      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  placeholder={'Start typing ...'}
                  placeholderClassName={placeholderClassName}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        {/* editor plugins */}
      </div>
      {/* actions plugins */}
    </div>
  );
}
