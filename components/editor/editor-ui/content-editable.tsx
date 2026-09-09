import { JSX } from 'react';

import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable';

import { FIELD_TEXT_SIZE } from '@/components/ui/field-text';
import { cn } from '@/lib/utils';

type Props = {
  placeholder: string;
  className?: string;
};

export function ContentEditable({ placeholder, className }: Props): JSX.Element {
  return (
    <LexicalContentEditable
      // The writer's text reads at the size every other field uses; the theme
      // sets the line-height, which prose needs looser than a one-line box
      className={cn(
        'ContentEditable__root relative block min-h-72 min-h-full overflow-auto px-3 py-4 text-gray-800 focus:outline-none',
        FIELD_TEXT_SIZE,
        className,
      )}
      aria-placeholder={placeholder}
      placeholder={
        <div
          // The same size as the text that replaces it, so the field does not
          // appear to grow as soon as it is typed in
          className={cn(
            'pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis px-3 py-[18px] text-gray-400',
            FIELD_TEXT_SIZE,
          )}
        >
          {placeholder}
        </div>
      }
    />
  );
}
