import * as React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectValue, SelectItem, SelectContent, SelectTrigger } from './select';
import { Separator } from './separator';

interface PhoneNumberInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
}
const PhoneNumber = React.forwardRef<HTMLInputElement, PhoneNumberInputProps>(
  ({ className, type = 'tel', icon, onChange, ...props }, ref) => {
    const [countryCode, setCountryCode] = React.useState('+254');
    const [localNumber, setLocalNumber] = React.useState('');

    React.useEffect(() => {
      if (onChange) {
        onChange(`${countryCode}${localNumber}`);
      }
    }, [countryCode, localNumber, onChange]);

    return (
      <div className="flex items-center rounded-[10px] border border-gray-700 border-input px-2 shadow-sm focus-within:border-primary focus-within:outline-none disabled:cursor-not-allowed disabled:opacity-50">
        <Select onValueChange={(val) => setCountryCode(val)}>
          <SelectTrigger
            className="focus:ring-none w-fit border-none px-0 pl-2 pr-2 shadow-none ring-transparent"
            prefixIcon={icon}
          >
            <SelectValue placeholder="+254" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+254">+254</SelectItem>
            <SelectItem value="+255">+255</SelectItem>
            <SelectItem value="+256">+256</SelectItem>
          </SelectContent>
        </Select>
        <Separator
          orientation="vertical"
          className="mr-3 h-4 w-[2px] rounded-[10px] border-gray-300"
        />
        <input
          type={type}
          className={cn(
            'h-14 w-full flex-1 border-none bg-transparent py-1 text-sm focus:outline-none md:text-sm',
            className,
          )}
          ref={ref}
          onChange={(e) => setLocalNumber(e.target.value)}
          {...props}
        />
      </div>
    );
  },
);

PhoneNumber.displayName = 'PhoneNumber';

export { PhoneNumber };
