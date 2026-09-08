'use client';

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
        <label className="text-xs font-medium text-gray-800">Add your experience description</label>
        <Editor
          className="text-xs"
          placeholderClassName="pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis px-3 py-[18px] text-xs text-gray-400"
          initialHtml={description}
          onHtmlChange={onDescriptionChange}
        />
        {descriptionError && <p className="text-xs text-red-500">{descriptionError}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-800">What's included</label>
        <Editor
          className="text-xs"
          placeholderClassName="pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis px-3 py-[18px] text-xs text-gray-400"
          initialHtml={whatsIncluded}
          onHtmlChange={onWhatsIncludedChange}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-800">What's NOT included</label>
        <Editor
          className="text-xs"
          placeholderClassName="pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis px-3 py-[18px] text-xs text-gray-400"
          initialHtml={whatsNotIncluded}
          onHtmlChange={onWhatsNotIncludedChange}
        />
      </div>
    </div>
  );
};
