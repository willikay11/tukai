import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="flex items-center rounded-[10px] border border-gray-500 border-input px-2 shadow-sm focus-within:border-primary focus-within:outline-none disabled:cursor-not-allowed disabled:opacity-50">
        {icon && <div className="mr-2">{icon}</div>}
        <input
          type={type}
          className={cn(
            'h-14 w-full flex-1 border-none bg-transparent py-1 text-sm focus:outline-none md:text-sm',
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
