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
        <label className="text-sm font-medium text-gray-800">Add your experience description</label>
        <Editor initialHtml={description} onHtmlChange={onDescriptionChange} />
        {descriptionError && <p className="text-xs text-red-500">{descriptionError}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-800">What's included</label>
        <Editor initialHtml={whatsIncluded} onHtmlChange={onWhatsIncludedChange} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-800">What's NOT included</label>
        <Editor initialHtml={whatsNotIncluded} onHtmlChange={onWhatsNotIncludedChange} />
      </div>
    </div>
  );
};
