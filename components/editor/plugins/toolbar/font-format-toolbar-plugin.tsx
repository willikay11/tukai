'use client';

import { useState } from 'react';

import { $isRangeSelection, BaseSelection, FORMAT_TEXT_COMMAND, TextFormatType } from 'lexical';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToolbarContext } from '@/components/editor/context/toolbar-context';
import { useUpdateToolbarHandler } from '@/components/editor/editor-hooks/use-update-toolbar';
import { ToolbarToggleItem } from '@/components/editor/plugins/toolbar/toolbar-toggle-item';
import { ToggleGroup } from '@/components/ui/toggle-group';

// Both the strikethrough and the inline code format already have styling in
// editor-theme.ts, so they render as themselves once the buttons dispatch them
const FONT_FORMAT_OPTIONS: {
  format: Extract<TextFormatType, 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'>;
  iconName: string;
  name: string;
}[] = [
  { format: 'bold', iconName: 'TextBoldIcon', name: 'Bold' },
  { format: 'italic', iconName: 'TextItalicIcon', name: 'Italic' },
  { format: 'underline', iconName: 'TextUnderlineIcon', name: 'Underline' },
  { format: 'strikethrough', iconName: 'TextStrikethroughIcon', name: 'Strikethrough' },
  { format: 'code', iconName: 'SourceCodeIcon', name: 'Code' },
];

export function FontFormatToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  // Multiple formats can apply at once, so the group tracks a list rather than
  // a single value the way the alignment toggles do
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const $updateToolbar = (selection: BaseSelection) => {
    if (!$isRangeSelection(selection)) return;

    const next = FONT_FORMAT_OPTIONS.filter(({ format }) => selection.hasFormat(format)).map(
      ({ format }) => format,
    );

    // Same formats, same array — a fresh one would re-render for nothing
    setActiveFormats((current) =>
      current.length === next.length && current.every((format, index) => format === next[index])
        ? current
        : next,
    );
  };

  useUpdateToolbarHandler($updateToolbar);

  const handleValueChange = (values: string[]) => {
    // Dispatch only what actually changed — FORMAT_TEXT_COMMAND toggles, so
    // re-sending a format that is already on would switch it back off
    FONT_FORMAT_OPTIONS.forEach(({ format }) => {
      if (values.includes(format) !== activeFormats.includes(format)) {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
      }
    });

    setActiveFormats(values);
  };

  return (
    <ToggleGroup type="multiple" value={activeFormats} onValueChange={handleValueChange}>
      {FONT_FORMAT_OPTIONS.map(({ format, iconName, name }) => (
        <ToolbarToggleItem key={format} value={format} aria-label={name}>
          {/* currentColor so the icon follows the toggle's pressed state */}
          <IconComponent iconName={iconName} size={16} color="currentColor" />
        </ToolbarToggleItem>
      ))}
    </ToggleGroup>
  );
}
