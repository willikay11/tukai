import * as React from 'react';

import { FIELD_TEXT } from '@/components/ui/field-text';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator';

interface PhoneNumberProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  // Styles the field box, as it did when this component drew its own shell
  className?: string;
  /**
   * A stored number to open on, e.g. "+254721920820". Split across the picker
   * and the field, so editing a saved number starts from what was saved rather
   * than from an empty box.
   */
  initialValue?: string;
}

const COUNTRY_CODES = ['+254', '+255', '+256'];

/** "+254721920820" → ['+254', '721920820'] */
const splitNumber = (value?: string): [string, string] => {
  const trimmed = (value ?? '').replace(/\s+/g, '');
  const code = COUNTRY_CODES.find((entry) => trimmed.startsWith(entry));

  return code ? [code, trimmed.slice(code.length)] : ['+254', trimmed];
};

/**
 * A phone field: a country-code picker and a divider sit inside the field,
 * ahead of the number. The box is the shared {@link Input}, so it carries the
 * same border, radius, padding, type and focus treatment as every other field.
 */
const PhoneNumber = React.forwardRef<HTMLInputElement, PhoneNumberProps>(
  ({ className, type = 'tel', icon, onChange, initialValue, ...props }, ref) => {
    const [initialCode, initialNumber] = React.useMemo(
      () => splitNumber(initialValue),
      [initialValue],
    );
    const [countryCode, setCountryCode] = React.useState(initialCode);
    const [localNumber, setLocalNumber] = React.useState(initialNumber);

    // Held in a ref so the report below keys on the value alone. Depending on
    // `onChange` itself re-fires on every render for any caller that passes an
    // inline arrow — and if that caller sets state, the two loop forever.
    const onChangeRef = React.useRef(onChange);
    React.useEffect(() => {
      onChangeRef.current = onChange;
    });

    React.useEffect(() => {
      onChangeRef.current?.(`${countryCode}${localNumber}`);
    }, [countryCode, localNumber]);

    return (
      <Input
        type={type}
        ref={ref}
        containerClassName={className}
        // The shared field text, so the number matches every box beside it
        className={FIELD_TEXT}
        defaultValue={initialNumber}
        onChange={(e) => setLocalNumber(e.target.value)}
        icon={
          <div className="flex items-center">
            <Select value={countryCode} onValueChange={(val) => setCountryCode(val)}>
              <SelectTrigger
                className={cn(
                  'w-fit border-none p-0 pr-2 shadow-none ring-transparent focus:ring-0',
                  // The trigger ships with a fixed h-[50px] and a 20px chevron;
                  // left alone they make the phone field taller than every other
                  // input. Constrained to the same 18px line box the number sits
                  // in, the field lands on the standard 44px.
                  'h-auto [&_svg]:h-[18px] [&_svg]:w-[18px]',
                  // Match the number beside it
                  FIELD_TEXT,
                )}
                prefixIcon={icon}
              >
                <SelectValue placeholder="+254" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
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
