'use client';

import { useCallback, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { AddTicketTypeButton } from '../AddTicketTypeButton/AddTicketTypeButton';
import { CommissionPicker } from '../CommissionPicker/CommissionPicker';
import { TicketCard } from '../TicketCard/TicketCard';
import { TicketDateBadge } from '../TicketDateBadge/TicketDateBadge';
import { TicketForm, TicketFormValue } from '../TicketForm/TicketForm';
import { FormData } from '../../hooks/useCreateExperienceFlow';

interface TicketsStepProps {
  formData: FormData['tickets'];
  dateTypeData: FormData['dateType'];
  experiencePricing: 'paid' | 'free';
  onChange: (data: Partial<FormData['tickets']>) => void;
  errors: Record<string, string>;
  onSaveContinue: () => void;
  onCancel: () => void;
}

const emptyTicketForm: TicketFormValue = {
  name: '',
  quantity: null,
  amount: null,
  salesStartDate: null,
  salesStartTime: null,
  salesEndDate: null,
  salesEndTime: null,
  acceptPartialPayment: false,
};

const validateTicket = (draft: TicketFormValue, isPaid: boolean): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!draft.name.trim()) {
    errors.name = 'Ticket name is required';
  }

  if (draft.quantity === null || draft.quantity === undefined || draft.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }

  if (isPaid && (draft.amount === null || draft.amount === undefined || draft.amount <= 0)) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!draft.salesStartDate) {
    errors.salesStartDate = 'Start date is required';
  }

  if (!draft.salesEndDate) {
    errors.salesEndDate = 'End date is required';
  }

  if (draft.salesStartDate && draft.salesEndDate && draft.salesStartDate > draft.salesEndDate) {
    errors.salesEndDate = 'End date must be after start date';
  }

  return errors;
};

export const TicketsStep = ({
  formData,
  dateTypeData,
  experiencePricing,
  onChange,
  errors,
  onSaveContinue,
  onCancel,
}: TicketsStepProps) => {
  const [activeFormIndex, setActiveFormIndex] = useState<number | null>(null);
  const [draftTicket, setDraftTicket] = useState<TicketFormValue>(emptyTicketForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleAddTicket = useCallback(() => {
    setActiveFormIndex(formData.items.length);
    setDraftTicket(emptyTicketForm);
    setFormErrors({});
  }, [formData.items.length]);

  const handleEditTicket = useCallback((index: number) => {
    const ticket = formData.items[index];
    setActiveFormIndex(index);
    setDraftTicket({
      name: ticket.name,
      quantity: ticket.quantity,
      amount: ticket.amount,
      salesStartDate: ticket.salesStartDate,
      salesStartTime: ticket.salesStartTime,
      salesEndDate: ticket.salesEndDate,
      salesEndTime: ticket.salesEndTime,
      acceptPartialPayment: ticket.acceptPartialPayment,
    });
    setFormErrors({});
  }, [formData.items]);

  const handleSaveTicket = useCallback(() => {
    const newErrors = validateTicket(draftTicket, experiencePricing === 'paid');

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    const items = [...formData.items];
    if (activeFormIndex !== null && activeFormIndex < items.length) {
      items[activeFormIndex] = {
        ...items[activeFormIndex],
        name: draftTicket.name,
        quantity: draftTicket.quantity!,
        amount: draftTicket.amount!,
        salesStartDate: draftTicket.salesStartDate!,
        salesStartTime: draftTicket.salesStartTime!,
        salesEndDate: draftTicket.salesEndDate!,
        salesEndTime: draftTicket.salesEndTime!,
        acceptPartialPayment: draftTicket.acceptPartialPayment,
      };
    } else {
      items.push({
        id: uuidv4(),
        name: draftTicket.name,
        quantity: draftTicket.quantity!,
        amount: draftTicket.amount!,
        salesStartDate: draftTicket.salesStartDate!,
        salesStartTime: draftTicket.salesStartTime!,
        salesEndDate: draftTicket.salesEndDate!,
        salesEndTime: draftTicket.salesEndTime!,
        acceptPartialPayment: draftTicket.acceptPartialPayment,
      });
    }

    onChange({ items });
    setActiveFormIndex(null);
    setDraftTicket(emptyTicketForm);
    setFormErrors({});
  }, [draftTicket, formData.items, activeFormIndex, onChange, experiencePricing]);

  const handleCancelForm = useCallback(() => {
    setActiveFormIndex(null);
    setDraftTicket(emptyTicketForm);
    setFormErrors({});
  }, []);

  const handleDeleteTicket = useCallback(
    (id: string) => {
      onChange({ items: formData.items.filter((item) => item.id !== id) });
    },
    [formData.items, onChange],
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Create Tickets</h2>

      <CommissionPicker value={formData.commission} onChange={(commission) => onChange({ commission })} />

      {dateTypeData.date && dateTypeData.startTime && dateTypeData.endTime && (
        <TicketDateBadge
          date={dateTypeData.date}
          startTime={dateTypeData.startTime}
          endTime={dateTypeData.endTime}
        />
      )}

      {formData.items.length === 0 && activeFormIndex === null ? (
        <TicketForm
          value={emptyTicketForm}
          onChange={setDraftTicket}
          errors={formErrors}
          onSave={() => {
            setActiveFormIndex(0);
          }}
          onCancel={onCancel}
          experiencePricing={experiencePricing}
          commissionPayer={formData.commission}
        />
      ) : (
        <>
          <div className="space-y-3">
            {formData.items.map((ticket, index) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onEdit={() => handleEditTicket(index)}
                onDelete={() => handleDeleteTicket(ticket.id)}
              />
            ))}
          </div>

          {activeFormIndex !== null ? (
            <TicketForm
              value={draftTicket}
              onChange={setDraftTicket}
              errors={formErrors}
              onSave={handleSaveTicket}
              onCancel={handleCancelForm}
              experiencePricing={experiencePricing}
              commissionPayer={formData.commission}
            />
          ) : (
            <AddTicketTypeButton onClick={handleAddTicket} />
          )}
        </>
      )}

      {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}

      <div className="flex justify-between gap-4 border-t border-gray-200 pt-6">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-sm font-medium text-red-600">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSaveContinue}
          variant="gradient"
          className="rounded-[50px] text-sm font-medium"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
};
