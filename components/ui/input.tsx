import * as React from 'react';

import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  // Drawn over the field itself — an animated placeholder, say. Given one, the
  // input is wrapped so the overlay has something to position against; without
  // one the markup is unchanged.
  overlay?: React.ReactNode;
  // Search fields keep their pill silhouette; every other field takes the
  // 14px radius
  shape?: 'default' | 'pill';
  // The border, padding and focus colour live on the wrapper, so callers that
  // need to change the field's box target this. `className` still reaches the
  // <input> itself, as it always has.
  containerClassName?: string;
}

/**
 * The single text-input primitive. Every text-like field in the app renders
 * through this so borders, radius, type and focus behaviour stay in one place.
 *
 * ⚠️ The focus border is `brand-green` (#066349), which is NOT the `primary`
 * token (#047857). They are different greens; the spec for this component asks
 * for the former.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, containerClassName, type, icon, suffixIcon, overlay, shape = 'default', ...props },
    ref,
  ) => {
    const field = (
      <input
        type={type}
        className={cn(
          // 14.5px/18px + 13px padding top and bottom lands the field on a
          // 44px height — the standard touch target
          'w-full flex-1 border-none bg-transparent p-0 text-[14.5px] font-medium leading-[18px] text-gray-800 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed',
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    return (
      <div
        className={cn(
          // Transparent rather than white, so the field sits on white and grey
          // panels alike
          'flex items-center gap-2 border border-gray-200 bg-transparent px-4 py-[13px] transition-colors focus-within:border-brand-green',
          shape === 'pill' ? 'rounded-full' : 'rounded-[14px]',
          props.disabled && 'cursor-not-allowed opacity-50',
          containerClassName,
        )}
      >
        {icon}

        {overlay ? (
          <div className="relative min-w-0 flex-1">
            {field}
            {overlay}
          </div>
        ) : (
          field
        )}

        {suffixIcon}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
