'use client';

import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToolbarContext } from '@/components/editor/context/toolbar-context';
import { ToolbarToggleItem } from '@/components/editor/plugins/toolbar/toolbar-toggle-item';
import { ToggleGroup } from '@/components/ui/toggle-group';

const HEADING_OPTIONS: { level: HeadingTagType; iconName: string; name: string }[] = [
  { level: 'h1', iconName: 'Heading01Icon', name: 'Heading 1' },
  { level: 'h2', iconName: 'Heading02Icon', name: 'Heading 2' },
  { level: 'h3', iconName: 'Heading03Icon', name: 'Heading 3' },
];

/**
 * H1–H3 as toggles rather than a dropdown, so the level in use is visible
 * without opening anything. Pressing the active one returns the block to a
 * paragraph, which is how the reader gets back out of a heading.
 */
export function HeadingFormatToolbarPlugin() {
  const { activeEditor, blockType } = useToolbarContext();

  const isHeading = HEADING_OPTIONS.some(({ level }) => level === blockType);

  const setBlock = (level: HeadingTagType | null) =>
    activeEditor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      $setBlocksType(selection, () => (level ? $createHeadingNode(level) : $createParagraphNode()));
    });

  return (
    <ToggleGroup
      type="single"
      // Empty rather than the block type itself: a paragraph or a list must
      // leave every heading unpressed
      value={isHeading ? blockType : ''}
      onValueChange={(value) => setBlock((value as HeadingTagType) || null)}
    >
      {HEADING_OPTIONS.map(({ level, iconName, name }) => (
        <ToolbarToggleItem key={level} value={level} aria-label={name}>
          {/* currentColor so the icon follows the toggle's pressed state */}
          <IconComponent iconName={iconName} size={16} color="currentColor" />
        </ToolbarToggleItem>
      ))}
    </ToggleGroup>
  );
}
