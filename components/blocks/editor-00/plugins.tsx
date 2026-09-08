import { useState } from 'react';

import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { ContentEditable } from '@/components/editor/editor-ui/content-editable';
import { ListMaxIndentLevelPlugin } from '@/components/editor/plugins/list-max-indent-level-plugin';
import { ElementFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/element-format-toolbar-plugin';
import { FontFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/font-format-toolbar-plugin';
import { HeadingFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/heading-format-toolbar-plugin';
import { ListFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/list-format-toolbar-plugin';
import { ToolbarPlugin } from '@/components/editor/plugins/toolbar/toolbar-plugin';
import { Separator } from '@/components/ui/separator';

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
          // Scrolls rather than squashing: the editor sits in narrow columns
          // (the create-experience side panel, the inline edit panels), where
          // the controls used to compress into each other.
          //
          // `[&>*]:flex-shrink-0` is what makes it scroll — without it the
          // children give up their width to fit and there is nothing to
          // overflow. The dropdowns portal to the body, so the clipping this
          // container introduces does not reach them.
          <div className="flex items-center gap-1 overflow-x-auto border-b bg-gray-100 p-2 scrollbar-hide [&>*]:flex-shrink-0">
            {/* The block-format dropdown that used to lead the toolbar is gone:
                it offered Paragraph and H1–H3, which the heading toggles now
                cover — pressing the active one drops back to a paragraph. */}
            <FontFormatToolbarPlugin />

            <Separator orientation="vertical" className="mx-2 !h-4" />

            <HeadingFormatToolbarPlugin />

            <Separator orientation="vertical" className="mx-2 !h-4" />

            <ListFormatToolbarPlugin />

            <Separator orientation="vertical" className="mx-2 !h-4" />

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
        {/* Without this the boxes render but cannot be ticked */}
        <CheckListPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        {/* editor plugins */}
      </div>
      {/* actions plugins */}
    </div>
  );
}
