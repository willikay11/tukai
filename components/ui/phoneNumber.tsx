import * as React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectValue, SelectItem, SelectContent, SelectTrigger } from './select';
import { Separator } from './separator';

interface PhoneNumberInputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode;
}

const PhoneNumber = React.forwardRef<HTMLInputElement, PhoneNumberInputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="flex items-center rounded-[10px] border border-gray-500 border-input px-2 shadow-sm focus-within:border-primary focus-within:outline-none disabled:cursor-not-allowed disabled:opacity-50">
        {icon && <div className="mr-2">{icon}</div>}
        <Select onValueChange={() => {}}>
          <SelectTrigger className="w-fit border-none shadow-none focus:ring-none ring-transparent">
            <SelectValue placeholder="+254" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+254">+254</SelectItem>
            <SelectItem value="+255">+255</SelectItem>
            <SelectItem value="+256">+256</SelectItem>
          </SelectContent>
        </Select>
        <Separator orientation='vertical' className='h-4 w-[2px] mr-3 border-gray-300 rounded-[10px]' />
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

PhoneNumber.displayName = 'PhoneNumber';

export { PhoneNumber };
