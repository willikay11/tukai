'use client';

import { Editor } from '@/components/blocks/editor-00/editor';

import { serializeEditorStateToHtml, toSerializedEditorState } from '../editorUtils';

interface EditDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const EditDescriptionField = ({ value, onChange, error }: EditDescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">Add your experience description</label>
      <Editor
        className="text-xs"
        placeholderClassName="pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis px-3 py-[18px] text-xs text-gray-400"
        editorSerializedState={toSerializedEditorState(value)}
        onSerializedChange={(state) => {
          const html = serializeEditorStateToHtml(state);
          if (html) {
            onChange(html);
          }
        }}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
