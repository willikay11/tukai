'use client';

import { useCallback, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { AddTicketTypeButton } from '../AddTicketTypeButton/AddTicketTypeButton';
import { CommissionPicker } from '../CommissionPicker/CommissionPicker';
import { SavedTicketCard } from '../TicketCard/TicketCard';
import { TicketDateBadge } from '../TicketDateBadge/TicketDateBadge';
import { TicketForm, TicketFormValue } from '../TicketForm/TicketForm';
import { MultiDayTicketModePicker } from '../MultiDayTicketModePicker/MultiDayTicketModePicker';
import { FormData } from '../../hooks/useCreateExperienceFlow';
import { getDaysBetween, formatMultiDayRange } from '@/utils/date-utils';

interface TicketsStepProps {
  formData: FormData['tickets'];
  dateTypeData: FormData['dateType'];
  experiencePricing: 'paid' | 'free';
  onChange: (data: Partial<FormData['tickets']>) => void;
  errors: Record<string, string>;
  onSaveContinue: () => void;
  onCancel: () => void;
  photos?: string[];
  isRecurring?: boolean;
  timeSlots?: { startTime: string | null; endTime: string | null }[];
  recurringDays?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  isMultiDay?: boolean;
  multiDayStartDate?: string | null;
  multiDayStartTime?: string | null;
  multiDayEndDate?: string | null;
  multiDayEndTime?: string | null;
  saveContinueLabel?: string;
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
  photos,
  isRecurring = false,
  timeSlots = [],
  recurringDays = [],
  isMultiDay = false,
  multiDayStartDate = null,
  multiDayStartTime = null,
  multiDayEndDate = null,
  multiDayEndTime = null,
  saveContinueLabel = 'Save & Continue',
}: TicketsStepProps) => {
  const [activeFormIndex, setActiveFormIndex] = useState<number | null>(null);
  const [draftTicket, setDraftTicket] = useState<TicketFormValue>(emptyTicketForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [ticketMode, setTicketMode] = useState<'entire-period' | 'each-day'>('entire-period');

  const handleDraftTicketChange = useCallback((data: Partial<TicketFormValue>) => {
    setDraftTicket((prev) => ({ ...prev, ...data }));
  }, []);

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
        salesStartRelative: draftTicket.salesStartRelative || null,
        salesEndRelative: draftTicket.salesEndRelative || null,
        duplicateForEntirePeriod: draftTicket.duplicateForEntirePeriod || false,
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
        salesStartRelative: draftTicket.salesStartRelative || null,
        salesEndRelative: draftTicket.salesEndRelative || null,
        duplicateForEntirePeriod: draftTicket.duplicateForEntirePeriod || false,
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

  const hasTicketDateBadge = isMultiDay
    ? Boolean(multiDayStartDate) && Boolean(multiDayStartTime) && Boolean(multiDayEndDate) && Boolean(multiDayEndTime)
    : isRecurring
      ? Boolean(recurringDays.length > 0) && timeSlots.some((slot) => slot.startTime && slot.endTime)
      : Boolean(dateTypeData.date) && Boolean(dateTypeData.startTime) && Boolean(dateTypeData.endTime);
  const showTicketConnector = hasTicketDateBadge && formData.items.length > 0 && activeFormIndex === null;

  const multiDayDateRange = formatMultiDayRange(multiDayStartDate || null, multiDayEndDate || null);
  const multiDayDays = getDaysBetween(multiDayStartDate || '', multiDayEndDate || '');

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Create Tickets</h2>

      <CommissionPicker value={formData.commission} onChange={(commission) => onChange({ commission })} />

      {isMultiDay && (
        <MultiDayTicketModePicker
          value={ticketMode}
          onChange={setTicketMode}
        />
      )}

      {hasTicketDateBadge && (isMultiDay || (!isRecurring && !isMultiDay)) && (
        <div className="relative">
          {isMultiDay && (
            <div className="space-y-2">
              {ticketMode === 'entire-period' ? (
                <TicketDateBadge
                  mode="single"
                  date={multiDayDateRange}
                  startTime={multiDayStartTime!}
                  endTime={multiDayEndTime!}
                />
              ) : (
                multiDayDays.map((day, index) => (
                  <TicketDateBadge
                    key={index}
                    mode="single"
                    date={day}
                    startTime={multiDayStartTime!}
                    endTime={multiDayEndTime!}
                  />
                ))
              )}
            </div>
          )}

          {!isRecurring && !isMultiDay && (
            <>
              <TicketDateBadge
                mode="single"
                date={dateTypeData.date!}
                startTime={dateTypeData.startTime!}
                endTime={dateTypeData.endTime!}
              />
              <span className="pointer-events-none absolute -left-[1.25rem] top-0 bottom-0 border-l-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.25rem] top-0 h-0 w-5 border-t-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.563rem] -top-[0.3125rem] h-2.5 w-2.5 rounded-full bg-primary" />
            </>
          )}

          {isMultiDay && (
            <>
              <span className="pointer-events-none absolute -left-[1.25rem] top-0 bottom-0 border-l-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.25rem] top-0 h-0 w-5 border-t-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.563rem] -top-[0.3125rem] h-2.5 w-2.5 rounded-full bg-primary" />
            </>
          )}
        </div>
      )}

      {isRecurring && !isMultiDay && hasTicketDateBadge ? (
        <div className="space-y-0">
          {timeSlots.map((slot, slotIndex) => (
            <div key={slotIndex} className="relative">
              <div className='mb-3'>
                <TicketDateBadge
                  mode="recurring"
                  days={recurringDays}
                  startTime={slot.startTime!}
                  endTime={slot.endTime!}
                />
              </div>
              <span className="pointer-events-none absolute -left-[1.25rem] top-[1.5rem] -bottom-6 border-l-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.25rem] top-[1.5rem] h-0 w-5 border-t-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.563rem] top-[1.3125rem] h-2.5 w-2.5 rounded-full bg-primary" />

              <TicketForm
                value={draftTicket}
                onChange={handleDraftTicketChange}
                errors={formErrors}
                onSave={handleSaveTicket}
                // onCancel={onCancel}
                experiencePricing={experiencePricing}
                commissionPayer={formData.commission}
                isRecurring={isRecurring}
                isMultiDay={isMultiDay}
              />
            </div>
          ))}

          <div className="flex justify-between gap-4 pt-6">
            <Button type="button" variant="ghost" onClick={onCancel} className="text-red-600">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSaveContinue}
              variant="gradient"
              className="rounded-[50px]"
            >
              {saveContinueLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {formData.items.length === 0 && activeFormIndex === null ? (
            <TicketForm
              value={draftTicket}
              onChange={handleDraftTicketChange}
              errors={formErrors}
              onSave={handleSaveTicket}
              onCancel={onCancel}
              experiencePricing={experiencePricing}
              commissionPayer={formData.commission}
              isRecurring={isRecurring}
              isMultiDay={isMultiDay}
            />
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {formData.items.map((ticket, index) => (
                  <SavedTicketCard
                    key={ticket.id}
                    name={ticket.name}
                    quantity={ticket.quantity}
                    amount={ticket.amount}
                    validity={`${moment(ticket.salesStartDate).format('MMM D, YYYY,')} ${moment(ticket.salesStartTime, 'HH:mm').format('h:mm A')} – ${moment(ticket.salesEndDate).format('MMM D, YYYY,')} ${moment(ticket.salesEndTime, 'HH:mm').format('h:mm A')}`}
                    coverPhoto={photos?.[0]}
                    onEdit={() => handleEditTicket(index)}
                    onDelete={() => handleDeleteTicket(ticket.id)}
                  />
                ))}
              </div>

              {activeFormIndex !== null ? (
                <TicketForm
                  value={draftTicket}
                  onChange={handleDraftTicketChange}
                  errors={formErrors}
                  onSave={handleSaveTicket}
                  onCancel={handleCancelForm}
                  experiencePricing={experiencePricing}
                  commissionPayer={formData.commission}
                  isRecurring={isRecurring}
                  isMultiDay={isMultiDay}
                />
              ) : (
                <AddTicketTypeButton onClick={handleAddTicket} />
              )}
            </>
          )}
        </div>
      )}

      {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}

      {showTicketConnector &&(
        <div className="flex justify-between gap-4 pt-6">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-red-600">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSaveContinue}
            variant="gradient"
            className="rounded-[50px]"
          >
            {saveContinueLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
