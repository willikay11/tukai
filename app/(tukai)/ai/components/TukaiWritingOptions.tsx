'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { toast } from '@/app/shared/hooks/useToast';
import type { TukaiWriting } from '@/types/tukai';

const copy = (text: string) => {
  const failed = () =>
    toast({ description: 'Could not copy. Select the text and copy it instead.' });
  try {
    navigator.clipboard.writeText(text).then(() => toast({ description: 'Copied.' }), failed);
  } catch {
    failed();
  }
};

/**
 * Three options for a caption, description, message or review, each with
 * Copy.
 *
 * ⚠️ "Use in a new moment" (captions) is not built yet: the moment composer
 * cannot be opened with text from outside it.
 */
export const TukaiWritingOptions = ({ writing }: { writing: TukaiWriting }) => (
  <div className="flex flex-col gap-[18px]">
    <span className="text-[12.5px] font-semibold text-ink-muted">{writing.label}</span>
    {writing.options.map((option, i) => (
      <div key={i} className="flex flex-col gap-0.5">
        <p className="m-0 whitespace-pre-line text-pretty text-[14.5px] leading-[1.55] text-gray-800">
          {option}
        </p>
        <div className="-ml-2.5 flex flex-wrap gap-0.5">
          <button
            type="button"
            onClick={() => copy(option)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-brand hover:bg-surface-brand"
          >
            <IconComponent iconName="Copy01Icon" size={17} color="currentColor" />
            Copy
          </button>
        </div>
      </div>
    ))}
  </div>
);
