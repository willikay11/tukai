import * as React from 'react';

import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, suffixIcon, ...props }, ref) => {
    return (
      <div className="flex items-center rounded-[10px] border border-gray-700 border-input px-3 focus-within:border-primary focus-within:outline-none disabled:cursor-not-allowed disabled:opacity-50">
        {icon && <div className="mr-2">{icon}</div>}
        <input
          type={type}
          className={cn(
            'h-[50px] w-full flex-1 origin-left scale-[0.875] text-[16px] border-none bg-transparent py-1 placeholder:text-gray-400 placeholder:text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          {...props}
        />
        {suffixIcon && <div className="ml-2">{suffixIcon}</div>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
