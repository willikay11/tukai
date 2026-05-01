'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';

export interface TicketFormValue {
  name: string;
  quantity: number | null;
  amount: number | null;
  salesStartDate: string | null;
  salesStartTime: string | null;
  salesEndDate: string | null;
  salesEndTime: string | null;
  acceptPartialPayment: boolean;
}

interface TicketFormProps {
  value: TicketFormValue;
  onChange: (data: Partial<TicketFormValue>) => void;
  errors: Record<string, string>;
  onSave: () => void;
  onCancel?: () => void;
  experiencePricing?: 'paid' | 'free';
  commissionPayer?: 'host' | 'customer' | 'split';
}

export const TicketForm = ({
  value,
  onChange,
  errors,
  onSave,
  onCancel,
  experiencePricing = 'paid',
  commissionPayer = 'host',
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
    <div className="space-y-6 border-l-2 border-dashed border-emerald-400 pl-4">
      <div className="space-y-2">
        <label htmlFor="ticket-name" className="text-xs font-medium text-gray-800">
          Ticket Name
        </label>
        <Input
          id="ticket-name"
          placeholder="Ticket Name e.g. VIP, Early Bird, Locals etc..."
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          suffixIcon={<IconComponent iconName="Tag01Icon" size={18} />}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="ticket-quantity" className="text-xs font-medium text-gray-800">
          Available Ticket Quantity
        </label>
        <Input
          id="ticket-quantity"
          type="number"
          placeholder="0"
          value={value.quantity ?? ''}
          onChange={(e) => onChange({ quantity: e.target.value ? parseInt(e.target.value, 10) : null })}
          suffixIcon={
            <div className="flex flex-col gap-0.5">
              <IconComponent iconName="ArrowUp01Icon" size={12} />
              <IconComponent iconName="ArrowDown01Icon" size={12} />
            </div>
          }
        />
        {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
      </div>

      {experiencePricing === 'paid' && (
        <div className="space-y-2">
          <label htmlFor="ticket-amount" className="text-xs font-medium text-gray-800">
            Amount per ticket
          </label>
          <Input
            id="ticket-amount"
            type="number"
            placeholder="0"
            value={value.amount ?? ''}
            onChange={(e) => onChange({ amount: e.target.value ? parseFloat(e.target.value) : null })}
            icon={<IconComponent iconName="Money03Icon" size={18} />}
          />
          {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
        </div>
      )}

      {experiencePricing === 'paid' && value.quantity && value.amount && (
        <div className="space-y-2 rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-600">
            Total Tickets Cost:{' '}
            <span className="font-semibold text-gray-900">KES {totalCost.toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-600">
            + What the customer sees:{' '}
            <span className="font-semibold text-emerald-600">KES {customerTotalCost.toLocaleString()}</span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-800">
          Ticket Sales Validity{' '}
          <IconComponent
            iconName="InfoCircleIcon"
            size={14}
            className="inline text-gray-500"
            title="When should the sales of these tickets start and end?"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            value={value.salesStartDate || undefined}
            onChange={(date) => onChange({ salesStartDate: date })}
            placeholder="Start date"
          />
          <TimePicker
            value={value.salesStartTime || undefined}
            onChange={(time) => onChange({ salesStartTime: time })}
            placeholder="Start time"
          />
        </div>
        {errors.salesStartDate && <p className="text-xs text-red-500">{errors.salesStartDate}</p>}

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            value={value.salesEndDate || undefined}
            onChange={(date) => onChange({ salesEndDate: date })}
            placeholder="End date"
          />
          <TimePicker
            value={value.salesEndTime || undefined}
            onChange={(time) => onChange({ salesEndTime: time })}
            placeholder="End time"
          />
        </div>
        {errors.salesEndDate && <p className="text-xs text-red-500">{errors.salesEndDate}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="accept-partial"
          checked={value.acceptPartialPayment}
          onCheckedChange={(checked) => onChange({ acceptPartialPayment: checked === true })}
        />
        <label
          htmlFor="accept-partial"
          className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-800"
        >
          Accept partial payments on this ticket
          <IconComponent iconName="InfoCircleIcon" size={14} className="text-gray-500" />
        </label>
      </div>

      <div className="flex gap-3 border-t border-gray-200 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium text-destructive hover:text-destructive/80"
          >
            Cancel
          </button>
        )}
        <div className="flex-1" />
        <Button type="button" onClick={onSave} variant="gradient" className="text-xs font-medium">
          Save Ticket
        </Button>
      </div>
    </div>
  );
};
