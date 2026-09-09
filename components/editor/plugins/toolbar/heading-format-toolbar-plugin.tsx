'use client';

import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToolbarContext } from '@/components/editor/context/toolbar-context';
import { ToolbarToggleItem } from '@/components/editor/plugins/toolbar/toolbar-toggle-item';
import { ToggleGroup } from '@/components/ui/toggle-group';

// 'paragraph' is Lexical's own name for a plain block, which is what
// `blockType` reports — so the toggle matches it without translation
const BLOCK_OPTIONS: { level: HeadingTagType | 'paragraph'; iconName: string; name: string }[] = [
  { level: 'paragraph', iconName: 'ParagraphIcon', name: 'Paragraph' },
  { level: 'h1', iconName: 'Heading01Icon', name: 'Heading 1' },
  { level: 'h2', iconName: 'Heading02Icon', name: 'Heading 2' },
  { level: 'h3', iconName: 'Heading03Icon', name: 'Heading 3' },
];

/**
 * Paragraph and H1–H3 as toggles rather than a dropdown, so the block in use is
 * visible without opening anything.
 *
 * Paragraph is offered outright rather than left to "press the active heading
 * again": a writer leaving a list, or coming from a quote, has no active
 * heading to press, and had no way back to plain text from the toolbar.
 */
export function HeadingFormatToolbarPlugin() {
  const { activeEditor, blockType } = useToolbarContext();

  const isKnownBlock = BLOCK_OPTIONS.some(({ level }) => level === blockType);

  const setBlock = (level: HeadingTagType | 'paragraph' | null) =>
    activeEditor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      $setBlocksType(selection, () =>
        level && level !== 'paragraph' ? $createHeadingNode(level) : $createParagraphNode(),
      );
    });

  return (
    <ToggleGroup
      type="single"
      // Empty rather than the block type itself, so a list or a quote leaves
      // all of these unpressed
      value={isKnownBlock ? blockType : ''}
      onValueChange={(value) => setBlock((value as HeadingTagType | 'paragraph') || null)}
    >
      {BLOCK_OPTIONS.map(({ level, iconName, name }) => (
        <ToolbarToggleItem key={level} value={level} aria-label={name}>
          {/* currentColor so the icon follows the toggle's pressed state */}
          <IconComponent iconName={iconName} size={16} color="currentColor" />
        </ToolbarToggleItem>
      ))}
    </ToggleGroup>
  );
}
