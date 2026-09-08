'use client';

import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode, $getSelection, $isRangeSelection, LexicalCommand } from 'lexical';

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

  const handleValueChange = (value: string) => {
    const option = LIST_OPTIONS.find((entry) => entry.blockType === value);

    // An empty value is the active toggle being pressed again
    if (!option) {
      formatParagraph();
      return;
    }

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
