'use client';

import { useState } from 'react';

import { $isLinkNode } from '@lexical/link';
import { $findMatchingParent } from '@lexical/utils';
import {
  $isElementNode,
  $isRangeSelection,
  BaseSelection,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToolbarContext } from '@/components/editor/context/toolbar-context';
import { useUpdateToolbarHandler } from '@/components/editor/editor-hooks/use-update-toolbar';
import { ToolbarToggleItem } from '@/components/editor/plugins/toolbar/toolbar-toggle-item';
import { getSelectedNode } from '@/components/editor/utils/get-selected-node';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup } from '@/components/ui/toggle-group';

// currentColor throughout, so each icon follows its toggle's pressed state
const ToolbarIcon = ({ iconName }: { iconName: string }) => (
  <IconComponent iconName={iconName} size={16} color="currentColor" />
);

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, 'start' | 'end' | ''>]: {
    icon: React.ReactNode;
    iconRTL: string;
    name: string;
  };
} = {
  left: {
    icon: <ToolbarIcon iconName="TextAlignLeftIcon" />,
    iconRTL: 'left-align',
    name: 'Left Align',
  },
  center: {
    icon: <ToolbarIcon iconName="TextAlignCenterIcon" />,
    iconRTL: 'center-align',
    name: 'Center Align',
  },
  right: {
    icon: <ToolbarIcon iconName="TextAlignRightIcon" />,
    iconRTL: 'right-align',
    name: 'Right Align',
  },
  justify: {
    icon: <ToolbarIcon iconName="TextAlignJustifyCenterIcon" />,
    iconRTL: 'justify-align',
    name: 'Justify Align',
  },
} as const;

export function ElementFormatToolbarPlugin({ separator = true }: { separator?: boolean }) {
  const { activeEditor } = useToolbarContext();
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || 'left',
      );
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  const handleValueChange = (value: string) => {
    if (!value) return; // Prevent unselecting current value

    setElementFormat(value as ElementFormatType);

    if (value === 'indent') {
      activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    } else if (value === 'outdent') {
      activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    } else {
      activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value as ElementFormatType);
    }
  };

  return (
    <>
      <ToggleGroup
        type="single"
        value={elementFormat}
        defaultValue={elementFormat}
        onValueChange={handleValueChange}
      >
        {/* Alignment toggles */}
        {Object.entries(ELEMENT_FORMAT_OPTIONS).map(([value, option]) => (
          <ToolbarToggleItem key={value} value={value} aria-label={option.name}>
            {option.icon}
          </ToolbarToggleItem>
        ))}
      </ToggleGroup>
      {separator && <Separator orientation="vertical" className="mx-2 !h-4" />}
      {/* Indentation toggles */}
      <ToggleGroup
        type="single"
        value={elementFormat}
        defaultValue={elementFormat}
        onValueChange={handleValueChange}
      >
        <ToolbarToggleItem value="outdent" aria-label="Outdent">
          <ToolbarIcon iconName="TextIndentLessIcon" />
        </ToolbarToggleItem>

        <ToolbarToggleItem value="indent" aria-label="Indent">
          <ToolbarIcon iconName="TextIndentMoreIcon" />
        </ToolbarToggleItem>
      </ToggleGroup>
    </>
  );
}
