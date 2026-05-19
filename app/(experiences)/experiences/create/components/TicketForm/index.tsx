'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import { RelativeValidityPicker, type RelativeValidityValue } from '../RelativeValidityPicker';
import { DuplicateTicketsCheckbox } from '../DuplicateTicketsCheckbox';

export interface TicketFormValue {
  name: string;
  quantity: number | null;
  amount: number | null;
  salesStartDate: string | null;
  salesStartTime: string | null;
  salesEndDate: string | null;
  salesEndTime: string | null;
  acceptPartialPayment: boolean;
  salesStartRelative?: RelativeValidityValue | null;
  salesEndRelative?: RelativeValidityValue | null;
  duplicateForEntirePeriod?: boolean;
}

interface TicketFormProps {
  value: TicketFormValue;
  onChange: (data: Partial<TicketFormValue>) => void;
  errors: Record<string, string>;
  onSave: () => void | Promise<void>;
  onCancel?: () => void;
  experiencePricing?: 'paid' | 'free';
  commissionPayer?: 'host' | 'customer' | 'split';
  isRecurring?: boolean;
  isMultiDay?: boolean;
  ticketMode?: 'entire-period' | 'each-day';
  isSaving?: boolean;
}

export const TicketForm = ({
  value,
  onChange,
  errors,
  onSave,
  onCancel,
  experiencePricing = 'paid',
  commissionPayer = 'host',
  isRecurring = false,
  isMultiDay = false,
  ticketMode = 'each-day',
  isSaving = false,
}: TicketFormProps) => {
  const getCommissionPercentage = () => {
    if (experiencePricing === 'free') return 0;
    return commissionPayer === 'host' ? 0 : commissionPayer === 'customer' ? 4 : 2;
  };

  const totalCost = (value.quantity ?? 0) * (value.amount ?? 0);
  const commissionPercentage = getCommissionPercentage();
  const customerPayAmount = value.amount ? value.amount + (value.amount * commissionPercentage) / 100 : 0;
  const customerTotalCost = (value.quantity ?? 0) * customerPayAmount;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Input
          id="ticket-name"
          placeholder="Ticket Name e.g. VIP, Early Bird, Locals etc..."
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          suffixIcon={<IconComponent iconName="Tag01Icon" size={18} />}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Input
          id="ticket-quantity"
          type="number"
          placeholder="Available Ticket Quantity"
          value={value.quantity ?? ''}
          onChange={(e) => onChange({ quantity: e.target.value ? parseInt(e.target.value, 10) : null })}
          suffixIcon={
            <div className="flex flex-col gap-0.5 text-gray-700">
              <IconComponent iconName="ArrowUp01Icon" size={11} />
              <IconComponent iconName="ArrowDown01Icon" size={11} />
            </div>
          }
        />
        {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
      </div>

      {experiencePricing === 'paid' && (
        <div className="space-y-1.5">
          <Input
            id="ticket-amount"
            type="number"
            placeholder="Amount per ticket"
            value={value.amount ?? ''}
            onChange={(e) => onChange({ amount: e.target.value ? parseFloat(e.target.value) : null })}
            icon={<IconComponent iconName="Money03Icon" size={18} />}
          />
          {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
        </div>
      )}

      {experiencePricing === 'paid' && value.quantity && value.amount && (
        <div className="rounded-full border border-blue-200 bg-blue-100/60 px-4 py-2">
          <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="italic">Total Tickets Cost:</span>
            <span className="font-semibold text-gray-900">KES {totalCost.toLocaleString()}.00</span>
            <span className="text-blue-400">•</span>
            <span className="italic">What the customer sees:</span>
            <span className="font-semibold text-gray-900">KES {customerTotalCost.toLocaleString()}.00</span>
          </p>
        </div>
      )}

      {isMultiDay || !isRecurring ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-800">
            Ticket Sales Validity{' '}
            <span className="font-normal text-gray-700">(When should the sales of these tickets start and end)</span>{' '}
            <IconComponent
              iconName="InfoCircleIcon"
              size={16}
              className="inline text-blue-500"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DatePicker
              value={value.salesStartDate || undefined}
              onChange={(date) => onChange({ salesStartDate: date })}
              placeholder="Start Date"
            />
            <TimePicker
              value={value.salesStartTime || undefined}
              onChange={(time) => onChange({ salesStartTime: time })}
              placeholder="Start Time"
            />
          </div>
          {errors.salesStartDate && <p className="text-xs text-red-500">{errors.salesStartDate}</p>}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DatePicker
              value={value.salesEndDate || undefined}
              onChange={(date) => onChange({ salesEndDate: date })}
              placeholder="End Date"
            />
            <TimePicker
              value={value.salesEndTime || undefined}
              onChange={(time) => onChange({ salesEndTime: time })}
              placeholder="End Time"
            />
          </div>
          {errors.salesEndDate && <p className="text-xs text-red-500">{errors.salesEndDate}</p>}

          {isMultiDay && ticketMode === 'each-day' && (
            <DuplicateTicketsCheckbox
              value={value.duplicateForEntirePeriod ?? false}
              onChange={(val) => onChange({ duplicateForEntirePeriod: val })}
            />
          )}
        </div>
      ) : (
        <>
          <RelativeValidityPicker
            startValue={
              value.salesStartRelative || { amount: 1, unit: 'hour', anchor: 'start' }
            }
            endValue={value.salesEndRelative || { amount: 1, unit: 'hour', anchor: 'end' }}
            onStartChange={(val) => onChange({ salesStartRelative: val })}
            onEndChange={(val) => onChange({ salesEndRelative: val })}
            errors={errors}
          />

          <DuplicateTicketsCheckbox
            value={value.duplicateForEntirePeriod ?? false}
            onChange={(val) => onChange({ duplicateForEntirePeriod: val })}
          />
        </>
      )}

      {/* <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="accept-partial"
          checked={value.acceptPartialPayment}
          onCheckedChange={(checked) => onChange({ acceptPartialPayment: checked === true })}
        />
        <label
          htmlFor="accept-partial"
          className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-900"
        >
          Accept partial payments on this ticket
          <IconComponent iconName="InfoCircleIcon" size={16} className="text-blue-500" />
        </label>
      </div> */}

      {errors.api && (
        <p className="text-sm text-destructive">{errors.api}</p>
      )}

      <div className="flex gap-3 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium text-destructive hover:text-destructive/80"
            disabled={isSaving}
          >
            Cancel
          </button>
        )}
        <div className="flex-1" />
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          variant="gradient"
          className="rounded-[50px] text-xs font-medium"
        >
          {isSaving ? 'Saving...' : 'Save Ticket'}
        </Button>
      </div>
    </div>
  );
};
