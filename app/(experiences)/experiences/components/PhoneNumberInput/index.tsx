import { Input } from '@/components/ui/input';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PhoneNumberInput = ({
  value,
  onChange,
  placeholder = 'Enter M-Pesa number',
}: PhoneNumberInputProps) => {
  return (
    <Input
      shape="pill"
      type="tel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      // The dialling code is a full-height segment with its own divider, so the
      // field carries no left padding of its own
      containerClassName="overflow-hidden py-0 pl-0"
      icon={
        <div className="flex items-center self-stretch border-r border-gray-200 bg-gray-50 px-4">
          <span className="text-sm font-medium text-gray-700">+254</span>
        </div>
      }
    />
  );
};
