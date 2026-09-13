'use client';

import { Editor } from '@/components/blocks/editor-00/editor';

interface EditExcludedFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const EditExcludedField = ({ value, onChange, error }: EditExcludedFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-800">What's NOT included</label>
      <Editor initialHtml={value} onHtmlChange={onChange} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
