'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type RelativeUnit = 'hour' | 'day' | 'week';
export type RelativeAnchor = 'start' | 'end';

export interface RelativeValidityValue {
  amount: number;
  unit: RelativeUnit;
  anchor: RelativeAnchor;
}

interface RelativeValidityPickerProps {
  startValue: RelativeValidityValue;
  endValue: RelativeValidityValue;
  onStartChange: (value: RelativeValidityValue) => void;
  onEndChange: (value: RelativeValidityValue) => void;
  errors: Record<string, string>;
}

const AMOUNT_OPTIONS = [
  '1 hour',
  '2 hours',
  '3 hours',
  '6 hours',
  '12 hours',
  '24 hours',
];

const parseAmount = (str: string): { amount: number; unit: RelativeUnit } => {
  const match = str.match(/^(\d+)\s+(hour|day|week)s?$/);
  if (match) {
    return {
      amount: parseInt(match[1], 10),
      unit: (match[2] + (parseInt(match[1], 10) === 1 ? '' : 's')) as any as RelativeUnit,
    };
  }
  return { amount: 1, unit: 'hour' };
};

const formatAmount = (amount: number, unit: RelativeUnit): string => {
  const unitName = unit === 'hour' ? 'hour' : unit === 'day' ? 'day' : 'week';
  return `${amount} ${unitName}${amount > 1 ? 's' : ''}`;
};

export const RelativeValidityPicker = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  errors,
}: RelativeValidityPickerProps) => {
  const startAnchorLabel =
    startValue.anchor === 'start' ? 'Before the experience starts' : 'After the experience starts';

  const endAnchorLabel =
    endValue.anchor === 'start' ? 'Before the experience ends' : 'After the experience ends';

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">
        Ticket Sales Validity{' '}
        <span className="font-normal text-gray-700">
          (When should the sales of these tickets start and end)
        </span>{' '}
        <IconComponent iconName="InfoCircleIcon" size={16} className="inline text-blue-500" />
      </label>

      <div className="space-y-3">
        {/* <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Sales Start</label>
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={formatAmount(startValue.amount, startValue.unit)}
              onValueChange={(val) => {
                const { amount, unit } = parseAmount(val);
                onStartChange({ amount, unit, anchor: startValue.anchor });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AMOUNT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={startValue.anchor}
              onValueChange={(anchor) => {
                onStartChange({ ...startValue, anchor: anchor as RelativeAnchor });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Before the experience starts</SelectItem>
                <SelectItem value="start-after">After the experience starts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.salesStartRelative && (
            <p className="text-xs text-red-500">{errors.salesStartRelative}</p>
          )}
        </div> */}

        <div className="space-y-2">
          {/* <label className="text-xs font-medium text-gray-700">Sales End</label> */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={formatAmount(endValue.amount, endValue.unit)}
              onValueChange={(val) => {
                const { amount, unit } = parseAmount(val);
                onEndChange({ amount, unit, anchor: endValue.anchor });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AMOUNT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={endValue.anchor}
              onValueChange={(anchor) => {
                onEndChange({ ...endValue, anchor: anchor as RelativeAnchor });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="end">Before the experience ends</SelectItem>
                <SelectItem value="end-after">After the experience ends</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.salesEndRelative && (
            <p className="text-xs text-red-500">{errors.salesEndRelative}</p>
          )}
        </div>
      </div>
    </div>
  );
};
