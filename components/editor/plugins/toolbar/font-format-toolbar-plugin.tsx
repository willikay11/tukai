'use client';

import { useState } from 'react';

import { $isRangeSelection, BaseSelection, FORMAT_TEXT_COMMAND, TextFormatType } from 'lexical';
import { BoldIcon, ItalicIcon, UnderlineIcon } from 'lucide-react';

import { useToolbarContext } from '@/components/editor/context/toolbar-context';
import { useUpdateToolbarHandler } from '@/components/editor/editor-hooks/use-update-toolbar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const FONT_FORMAT_OPTIONS: {
  format: Extract<TextFormatType, 'bold' | 'italic' | 'underline'>;
  icon: React.ReactNode;
  name: string;
}[] = [
  { format: 'bold', icon: <BoldIcon className="size-4" />, name: 'Bold' },
  { format: 'italic', icon: <ItalicIcon className="size-4" />, name: 'Italic' },
  { format: 'underline', icon: <UnderlineIcon className="size-4" />, name: 'Underline' },
];

export function FontFormatToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  // Multiple formats can apply at once, so the group tracks a list rather than
  // a single value the way the alignment toggles do
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const $updateToolbar = (selection: BaseSelection) => {
    if (!$isRangeSelection(selection)) return;

    setActiveFormats(
      FONT_FORMAT_OPTIONS.filter(({ format }) => selection.hasFormat(format)).map(
        ({ format }) => format,
      ),
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
      {FONT_FORMAT_OPTIONS.map(({ format, icon, name }) => (
        <ToggleGroupItem key={format} value={format} variant="outline" size="sm" aria-label={name}>
          {icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
