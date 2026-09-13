'use client';

import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import {
  $createParagraphNode,
  $getSelection,
  $isLineBreakNode,
  $isParagraphNode,
  $isRangeSelection,
  ElementNode,
  LexicalCommand,
  LexicalNode,
} from 'lexical';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToolbarContext } from '@/components/editor/context/toolbar-context';
import { ToolbarToggleItem } from '@/components/editor/plugins/toolbar/toolbar-toggle-item';
import { ToggleGroup } from '@/components/ui/toggle-group';

// `blockType` reports Lexical's own names for these, which is what the toggle
// group matches against
const LIST_OPTIONS: {
  blockType: string;
  command: LexicalCommand<void>;
  iconName: string;
  name: string;
}[] = [
  {
    blockType: 'number',
    command: INSERT_ORDERED_LIST_COMMAND,
    iconName: 'LeftToRightListNumberIcon',
    name: 'Numbered list',
  },
  {
    blockType: 'bullet',
    command: INSERT_UNORDERED_LIST_COMMAND,
    iconName: 'LeftToRightListBulletIcon',
    name: 'Bulleted list',
  },
  {
    blockType: 'check',
    command: INSERT_CHECK_LIST_COMMAND,
    iconName: 'CheckListIcon',
    name: 'Checklist',
  },
];

/**
 * The three list kinds as toggles. Pressing the active one unwraps the block
 * back to a paragraph, which is how a list is left.
 */
export function ListFormatToolbarPlugin() {
  const { activeEditor, blockType } = useToolbarContext();

  const isList = LIST_OPTIONS.some((option) => option.blockType === blockType);

  const formatParagraph = () =>
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });

  /**
   * Makes a list of the selected blocks, one item per line.
   *
   * A soft line break (Shift+Enter) keeps both lines in a single paragraph, and
   * a paragraph becomes a single list item — so numbering the second line
   * numbered the first one with it, inside item 1. Splitting at the breaks
   * first gives each line its own block, and the command then lists only the
   * one the caret is in.
   *
   * Note this does not try to keep the new list apart from a list directly
   * above or below it. `@lexical/list` merges adjacent lists of the same type
   * as a structural invariant — they re-merge even when split by hand — and
   * continuing the list there is what other editors do too.
   */
  const splitSelectedBlocksAtLineBreaks = () => {
    activeEditor.update(
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const blocks = new Set<ElementNode>();
        selection.getNodes().forEach((node) => {
          const block = node.getTopLevelElement();
          // Only a paragraph is split: a heading or quote holding a break is
          // one block on purpose
          if ($isParagraphNode(block)) blocks.add(block);
        });

        blocks.forEach((block) => {
          const children = block.getChildren();
          if (!children.some($isLineBreakNode)) return;

          // Grouped before anything moves — mutating while walking the
          // children would drop half of them
          const lines: LexicalNode[][] = [[]];
          children.forEach((child) => {
            if ($isLineBreakNode(child)) lines.push([]);
            else lines[lines.length - 1].push(child);
          });

          children.filter($isLineBreakNode).forEach((lineBreak) => lineBreak.remove());

          // The first line stays where it is; the rest follow as their own
          // paragraphs. The nodes are moved, not copied, so the caret goes with
          // whichever line it was in.
          let anchor: ElementNode = block;
          lines.slice(1).forEach((line) => {
            const paragraph = $createParagraphNode();
            line.forEach((node) => paragraph.append(node));
            anchor.insertAfter(paragraph);
            anchor = paragraph;
          });
        });
      },
      // One commit, and one undo step together with the list itself
      { discrete: true, tag: 'history-merge' },
    );
  };

  const handleValueChange = (value: string) => {
    const option = LIST_OPTIONS.find((entry) => entry.blockType === value);

    // An empty value is the active toggle being pressed again
    if (!option) {
      formatParagraph();
      return;
    }

    splitSelectedBlocksAtLineBreaks();
    activeEditor.dispatchCommand(option.command, undefined);
  };

  return (
    <ToggleGroup type="single" value={isList ? blockType : ''} onValueChange={handleValueChange}>
      {LIST_OPTIONS.map(({ blockType: value, iconName, name }) => (
        <ToolbarToggleItem key={value} value={value} aria-label={name}>
          {/* currentColor so the icon follows the toggle's pressed state */}
          <IconComponent iconName={iconName} size={16} color="currentColor" />
        </ToolbarToggleItem>
      ))}
    </ToggleGroup>
  );
}
