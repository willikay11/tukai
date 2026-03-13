import { JSX } from 'react';

import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable';

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        `ContentEditable__root relative block min-h-72 min-h-full overflow-auto px-3 py-4 focus:outline-none`
      }
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis px-3 py-[18px] text-sm text-gray-400`
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
