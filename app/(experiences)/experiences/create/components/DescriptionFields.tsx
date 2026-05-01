'use client';

import { SerializedEditorState } from 'lexical';
import { Editor } from '@/components/blocks/editor-00/editor';

interface DescriptionFieldsProps {
  description: string;
  whatsIncluded: string;
  whatsNotIncluded: string;
  onDescriptionChange: (value: string) => void;
  onWhatsIncludedChange: (value: string) => void;
  onWhatsNotIncludedChange: (value: string) => void;
  descriptionError?: string;
}

const toSerializedEditorState = (text: string): SerializedEditorState =>
  ({
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }) as unknown as SerializedEditorState;

const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

export const DescriptionFields = ({
  description,
  whatsIncluded,
  whatsNotIncluded,
  onDescriptionChange,
  onWhatsIncludedChange,
  onWhatsNotIncludedChange,
  descriptionError,
}: DescriptionFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-800">
          Add your experience description
        </label>
        <Editor
          editorSerializedState={toSerializedEditorState(description)}
          onSerializedChange={(state) => {
            const root = state?.root;
            if (root?.children?.[0]?.children?.[0]) {
              const text = root.children[0].children[0].text || '';
              onDescriptionChange(text);
            }
          }}
        />
        {descriptionError && <p className="text-xs text-red-500">{descriptionError}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-800">
          What's included
        </label>
        <Editor
          editorSerializedState={toSerializedEditorState(whatsIncluded)}
          onSerializedChange={(state) => {
            const root = state?.root;
            if (root?.children?.[0]?.children?.[0]) {
              const text = root.children[0].children[0].text || '';
              onWhatsIncludedChange(text);
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-800">
          What's NOT included
        </label>
        <Editor
          editorSerializedState={toSerializedEditorState(whatsNotIncluded)}
          onSerializedChange={(state) => {
            const root = state?.root;
            if (root?.children?.[0]?.children?.[0]) {
              const text = root.children[0].children[0].text || '';
              onWhatsNotIncludedChange(text);
            }
          }}
        />
      </div>
    </div>
  );
};
