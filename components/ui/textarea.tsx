import * as React from 'react';

import { cn } from '@/lib/utils';

import { FIELD_PLACEHOLDER, FIELD_TEXT_SIZE } from './field-text';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-[12px] border border-input bg-transparent px-3 py-3 focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          // Leading of its own: a textarea wraps, where a single-line field does not
          FIELD_TEXT_SIZE,
          'leading-6',
          FIELD_PLACEHOLDER,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
