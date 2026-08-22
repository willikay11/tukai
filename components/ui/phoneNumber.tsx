import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator';

interface PhoneNumberProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  // Styles the field box, as it did when this component drew its own shell
  className?: string;
}

/**
 * A phone field: a country-code picker and a divider sit inside the field,
 * ahead of the number. The box is the shared {@link Input}, so it carries the
 * same border, radius, padding, type and focus treatment as every other field.
 */
const PhoneNumber = React.forwardRef<HTMLInputElement, PhoneNumberProps>(
  ({ className, type = 'tel', icon, onChange, ...props }, ref) => {
    const [countryCode, setCountryCode] = React.useState('+254');
    const [localNumber, setLocalNumber] = React.useState('');

    React.useEffect(() => {
      if (onChange) {
        onChange(`${countryCode}${localNumber}`);
      }
    }, [countryCode, localNumber, onChange]);

    return (
      <Input
        type={type}
        ref={ref}
        containerClassName={className}
        // 14px rather than the shared field's 14.5px. `leading` must follow the
        // size — tailwind-merge treats a text-* utility as also setting
        // line-height, so written first it would be dropped and the field would
        // lose its 44px height.
        className="text-[14px] leading-[18px]"
        onChange={(e) => setLocalNumber(e.target.value)}
        icon={
          <div className="flex items-center">
            <Select onValueChange={(val) => setCountryCode(val)}>
              <SelectTrigger
                className={cn(
                  'w-fit border-none p-0 pr-2 shadow-none ring-transparent focus:ring-0',
                  // The trigger ships with a fixed h-[50px] and a 20px chevron;
                  // left alone they make the phone field taller than every other
                  // input. Constrained to the same 18px line box the number sits
                  // in, the field lands on the standard 44px.
                  'h-auto [&_svg]:h-[18px] [&_svg]:w-[18px]',
                  // Match the number beside it. `leading` has to come after the
                  // font size: tailwind-merge treats a text-* utility as also
                  // setting line-height, so an earlier leading-* is dropped.
                  'text-[14px] font-medium leading-[18px] text-gray-800',
                )}
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
            <Separator orientation="vertical" className="mr-1 h-4 w-px bg-gray-200" />
          </div>
        }
        {...props}
      />
    );
  },
);

PhoneNumber.displayName = 'PhoneNumber';

export { PhoneNumber };
