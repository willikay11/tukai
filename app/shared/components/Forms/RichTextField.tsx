'use client';

import { Editor } from '@/components/blocks/editor-00/editor';

export interface RichTextFieldProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  error?: string;
}

/**
 * The canvas's Rich text field (tk-rte): bold, italic, underline and
 * bulleted/numbered lists, used for the experience description and the
 * what's-included / what's-not-included lists. Wraps the existing Lexical
 * `Editor` rather than a new implementation - the toolbar carries two extra
 * controls (strikethrough/code, a checklist option) beyond the handoff's
 * minimal bold/italic/underline/list set, which is an accepted, disclosed
 * trade-off rather than a reason to fork the editor's toolbar plugins.
 */
export const RichTextField = ({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 120,
  error,
}: RichTextFieldProps) => (
  <div className="flex flex-col gap-2">
    {label && <span className="text-15 font-semibold text-gray-800">{label}</span>}
    <Editor
      initialHtml={value}
      onHtmlChange={onChange}
      minHeight={minHeight}
      placeholder={placeholder}
      className="rounded-xl border-line focus-within:border-brand focus-within:shadow-[0_0_0_3px_#E8F1ED]"
    />
    {error && <span className="text-[13.5px] leading-tight text-danger-deep">{error}</span>}
  </div>
);
