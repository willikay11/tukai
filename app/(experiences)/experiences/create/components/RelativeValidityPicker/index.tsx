'use client';

export type RelativeUnit = 'hour' | 'day' | 'week';
export type RelativeAnchor = 'start' | 'end';

export interface RelativeValidityValue {
  amount: number;
  unit: RelativeUnit;
  anchor: RelativeAnchor;
}

interface RelativeValidityPickerProps {
  value: RelativeValidityValue | null;
  onChange: (value: RelativeValidityValue) => void;
  errors: Record<string, string>;
}

const OPTIONS: RelativeValidityValue[] = [
  { amount: 1, unit: 'hour', anchor: 'start' },
  { amount: 1, unit: 'hour', anchor: 'end' },
  { amount: 1, unit: 'day', anchor: 'start' },
];

const formatOptionLabel = (option: RelativeValidityValue): string => {
  const unitLabel =
    option.unit === 'hour'
      ? `${option.amount} ${option.amount === 1 ? 'hour' : 'hours'}`
      : option.unit === 'day'
        ? `${option.amount} ${option.amount === 1 ? 'day' : 'days'}`
        : `${option.amount} ${option.amount === 1 ? 'week' : 'weeks'}`;

  const anchorLabel =
    option.anchor === 'start'
      ? 'before the experience starts'
      : 'before the experience ends';

  return `${unitLabel} ${anchorLabel}`;
};

const isSelected = (
  option: RelativeValidityValue,
  selected: RelativeValidityValue | null,
): boolean =>
  selected !== null &&
  option.amount === selected.amount &&
  option.unit === selected.unit &&
  option.anchor === selected.anchor;

export const RelativeValidityPicker = ({ value, onChange, errors }: RelativeValidityPickerProps) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">
        Ticket Sales Validity{' '}
        <span className="font-normal text-gray-700">
          (When should the sales of these tickets end?)
        </span>
      </label>

      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option, index) => {
          const selected = isSelected(option, value);
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(option)}
              className={`
                px-4 py-3 rounded-full text-xs font-medium
                transition-colors
                ${
                  selected
                    ? 'bg-gradient-to-b to-[#064E3B] from-[#047857] text-white border-primary'
                    : 'bg-gray-100 text-gray-700 hover:border-gray-400'
                }
              `}
            >
              {formatOptionLabel(option)}
            </button>
          );
        })}
      </div>

      {errors.salesEndRelative && (
        <p className="text-xs text-red-500">{errors.salesEndRelative}</p>
      )}
    </div>
  );
};
