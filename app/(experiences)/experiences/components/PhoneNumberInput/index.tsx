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
    <div className="flex border border-gray-200 rounded-full overflow-hidden">
      <div className="flex items-center px-4 bg-gray-50 border-r border-gray-200">
        <span className="text-sm text-gray-700 font-medium">+254</span>
      </div>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 text-sm outline-none placeholder-gray-400"
      />
    </div>
  );
};
