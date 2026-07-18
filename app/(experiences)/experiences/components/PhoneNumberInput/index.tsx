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
    <div className="flex overflow-hidden rounded-full border border-gray-200">
      <div className="flex items-center border-r border-gray-200 bg-gray-50 px-4">
        <span className="text-sm font-medium text-gray-700">+254</span>
      </div>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 text-sm placeholder-gray-400 outline-none"
      />
    </div>
  );
};
