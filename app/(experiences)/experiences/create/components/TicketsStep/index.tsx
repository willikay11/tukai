'use client';

import { useCallback, useState } from 'react';

import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

import { IconComponent } from '@/app/shared/components/Icons';
import { useCreateExperienceTicket } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import {
  createSlotTemplate,
  deleteExperienceTicket,
  updateExperienceTicket,
} from '@/services/experience';
import type { ApiResponse } from '@/types/apiResponse';
import type { CreateExperienceTicket } from '@/types/experience';
import { getDaysBetween } from '@/utils/date-utils';
import { parseApiError } from '@/utils/parseApiError';
import type { SlotTemplateRecord } from '@/utils/slot-template-utils';
import { buildSingleOccurrenceRule } from '@/utils/slot-template-utils';
import { buildAbsoluteTicketValidity, buildRecurringTicketValidity } from '@/utils/ticket-utils';

import { FormData } from '../../hooks/useCreateExperienceFlow';
import { usePendingAction } from '../../hooks/usePendingAction';
import { AddTicketTypeButton } from '../AddTicketTypeButton';
import { CommissionPicker } from '../CommissionPicker';
import { DateBadgeWithTimes } from '../DateBadgeWithTimes';
import { MultiDayTicketModePicker } from '../MultiDayTicketModePicker';
import { SavedTicketCard } from '../TicketCard';
import { TicketDateBadge } from '../TicketDateBadge';
import { TicketForm, type TicketFormValue } from '../TicketForm';

interface TicketsStepProps {
  formData: FormData['tickets'];
  dateTypeData: FormData['dateType'];
  experiencePricing: 'paid' | 'free';
  onChange: (data: Partial<FormData['tickets']>) => void;
  errors: Record<string, string>;
  // Resolves once the save settles, so the button can stop its spinner
  onSaveContinue: () => void | Promise<void>;
  onCancel: () => void;
  photos?: string[];
  isRecurring?: boolean;
  experienceId?: string | null;
  timeSlots?: { startTime: string | null; endTime: string | null }[];
  recurringDays?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  isMultiDay?: boolean;
  multiDayStartDate?: string | null;
  multiDayStartTime?: string | null;
  multiDayEndDate?: string | null;
  multiDayEndTime?: string | null;
  saveContinueLabel?: string;
  onPreview?: () => void;
  slotTemplateRecords?: SlotTemplateRecord[];
  setSlotTemplateRecords?: (records: SlotTemplateRecord[]) => void;
}

const emptyTicketForm: TicketFormValue = {
  name: '',
  quantity: null,
  amount: null,
  startTime: null,
  endTime: null,
  salesStartDate: null,
  salesStartTime: null,
  salesEndDate: null,
  salesEndTime: null,
  acceptPartialPayment: false,
  salesStartRelative: null,
  salesEndRelative: null,
  duplicateForEntirePeriod: false,
};

const validateTicket = (
  draft: TicketFormValue,
  isPaid: boolean,
  isRecurring: boolean = false,
): Record<string, string> => {
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

  // Ticket sales validity is hidden in TicketForm for now, so nothing can be
  // entered here — restore these checks when that section comes back.
  //
  // // For recurring: validate relative validity instead of absolute dates
  // if (isRecurring) {
  //   if (!draft.salesEndRelative) {
  //     errors.salesEndRelative = 'Ticket sales validity is required';
  //   }
  // } else {
  //   // For non-recurring: validate absolute dates
  //   if (!draft.salesStartDate) {
  //     errors.salesStartDate = 'Start date is required';
  //   }
  //
  //   if (!draft.salesEndDate) {
  //     errors.salesEndDate = 'End date is required';
  //   }
  //
  //   if (draft.salesStartDate && draft.salesEndDate && draft.salesStartDate > draft.salesEndDate) {
  //     errors.salesEndDate = 'End date must be after start date';
  //   }
  // }

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
  slotTemplateRecords = [],
  recurringDays = [],
  isMultiDay = false,
  multiDayStartDate = null,
  multiDayStartTime = null,
  multiDayEndDate = null,
  multiDayEndTime = null,
  saveContinueLabel = 'Save & Continue',
  experienceId = null,
  onPreview,
  setSlotTemplateRecords,
}: TicketsStepProps) => {
  const [activeFormIndex, setActiveFormIndex] = useState<number | null>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [draftTicket, setDraftTicket] = useState<TicketFormValue>(emptyTicketForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [ticketMode, setTicketMode] = useState<'entire-period' | 'each-day'>(
    (formData.ticketMode as 'entire-period' | 'each-day') || 'entire-period',
  );
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const { pendingAction, runAction } = usePendingAction<'continue'>();

  // API mutation hooks
  const createTicketMutation = useCreateExperienceTicket(experienceId ?? '');
  const { toast } = useToast();

  const calculateDurationMinutes = (startTime: string, endTime: string): number => {
    const [startHours, startMins] = startTime.split(':').map(Number);
    const [endHours, endMins] = endTime.split(':').map(Number);
    const startTotalMins = startHours * 60 + startMins;
    const endTotalMins = endHours * 60 + endMins;
    return Math.max(0, endTotalMins - startTotalMins);
  };

  const handleTicketModeChange = (mode: 'entire-period' | 'each-day') => {
    setTicketMode(mode);
    // Saved tickets are kept. They already exist on the API (they carry an
    // apiId), so dropping them from local state here would leave them on the
    // experience with no way to see or delete them.
    onChange({ ticketMode: mode });
    setActiveFormIndex(null);
    setDraftTicket(emptyTicketForm);
    setFormErrors({});
  };

  const handleDraftTicketChange = useCallback((data: Partial<TicketFormValue>) => {
    setDraftTicket((prev) => ({ ...prev, ...data }));
  }, []);

  const handleAddTicket = useCallback(() => {
    setActiveFormIndex(formData.items.length);
    setDraftTicket(emptyTicketForm);
    setFormErrors({});
  }, [formData.items.length]);

  const handleEditTicket = useCallback(
    (index: number) => {
      const ticket = formData.items[index];
      setActiveFormIndex(index);
      setDraftTicket({
        name: ticket.name,
        quantity: ticket.quantity,
        amount: ticket.amount,
        startTime: (ticket as any).startTime || null,
        endTime: (ticket as any).endTime || null,
        salesStartDate: ticket.salesStartDate,
        salesStartTime: ticket.salesStartTime,
        salesEndDate: ticket.salesEndDate,
        salesEndTime: ticket.salesEndTime,
        acceptPartialPayment: ticket.acceptPartialPayment,
        salesStartRelative: ticket.salesStartRelative,
        salesEndRelative: ticket.salesEndRelative,
        duplicateForEntirePeriod: ticket.duplicateForEntirePeriod,
      });
      setFormErrors({});
    },
    [formData.items],
  );

  // Save locally without API
  const saveLocally = useCallback(() => {
    const items = [...formData.items];
    const isRecurringExperience = dateTypeData?.isRecurring ?? false;
    if (activeFormIndex !== null && activeFormIndex < items.length) {
      items[activeFormIndex] = {
        ...items[activeFormIndex],
        name: draftTicket.name,
        quantity: draftTicket.quantity!,
        amount: draftTicket.amount!,
        startTime: draftTicket.startTime || null,
        endTime: draftTicket.endTime || null,
        salesStartDate: draftTicket.salesStartDate!,
        salesStartTime: draftTicket.salesStartTime!,
        salesEndDate: draftTicket.salesEndDate!,
        salesEndTime: draftTicket.salesEndTime!,
        acceptPartialPayment: draftTicket.acceptPartialPayment,
        salesStartRelative: draftTicket.salesStartRelative || null,
        salesEndRelative: draftTicket.salesEndRelative || null,
        duplicateForEntirePeriod: draftTicket.duplicateForEntirePeriod || false,
        ...(isRecurringExperience && activeSlotIndex !== null
          ? { slotIndex: activeSlotIndex }
          : {}),
      };
    } else {
      items.push({
        id: uuidv4(),
        name: draftTicket.name,
        quantity: draftTicket.quantity!,
        amount: draftTicket.amount!,
        startTime: draftTicket.startTime || null,
        endTime: draftTicket.endTime || null,
        salesStartDate: draftTicket.salesStartDate!,
        salesStartTime: draftTicket.salesStartTime!,
        salesEndDate: draftTicket.salesEndDate!,
        salesEndTime: draftTicket.salesEndTime!,
        acceptPartialPayment: draftTicket.acceptPartialPayment,
        salesStartRelative: draftTicket.salesStartRelative || null,
        salesEndRelative: draftTicket.salesEndRelative || null,
        duplicateForEntirePeriod: draftTicket.duplicateForEntirePeriod || false,
        ...(isRecurringExperience && activeSlotIndex !== null
          ? { slotIndex: activeSlotIndex }
          : {}),
      });
    }

    onChange({ items });
    setActiveFormIndex(null);
    setActiveSlotIndex(null);
    setDraftTicket(emptyTicketForm);
    setFormErrors({});
  }, [draftTicket, formData.items, activeFormIndex, activeSlotIndex, onChange, dateTypeData]);

  const handleSaveTicket = useCallback(
    async (slotIndex?: number) => {
      const isRecurringExperience = dateTypeData?.isRecurring ?? false;
      const newErrors = validateTicket(
        draftTicket,
        experiencePricing === 'paid',
        isRecurringExperience,
      );

      if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        return;
      }

      // If no experienceId yet, save locally only
      if (!experienceId) {
        saveLocally();
        return;
      }

      // Build validity fields based on experience type
      const validityFields = isRecurringExperience
        ? buildRecurringTicketValidity(draftTicket.salesEndRelative ?? null)
        : buildAbsoluteTicketValidity(
            draftTicket.salesStartDate,
            draftTicket.salesStartTime,
            draftTicket.salesEndDate,
            draftTicket.salesEndTime,
          );

      try {
        setIsSavingLocal(true);

        // Build API payload and create slot template if needed
        let slotTemplateId: string | undefined;

        // For multi-day "entire-period" mode: create slot template if it doesn't exist
        if (isMultiDay && ticketMode === 'entire-period' && slotTemplateRecords.length === 0) {
          console.log('[TicketsStep] Creating slot template for entire-period mode...');

          if (!multiDayStartTime || !multiDayEndTime || !multiDayStartDate) {
            throw new Error('Multi-day start/end times and date are required');
          }

          const durationMinutes = calculateDurationMinutes(multiDayStartTime, multiDayEndTime);
          const recurrenceRule = buildSingleOccurrenceRule(multiDayStartDate, multiDayStartTime);

          const slotResponse = await createSlotTemplate(experienceId, {
            start_time: multiDayStartTime,
            duration_minutes: durationMinutes,
            recurrence_rule: recurrenceRule,
          });

          const createdId = slotResponse.data?.id;
          if (!createdId) {
            throw new Error('Slot template creation failed — no id returned');
          }

          slotTemplateId = createdId;

          // Store the created slot template
          setSlotTemplateRecords?.([
            {
              uiId: 'entire-period',
              templateId: createdId,
              startTime: multiDayStartTime,
              endTime: multiDayEndTime,
            },
          ]);
        } else if (isRecurringExperience && slotIndex !== undefined) {
          slotTemplateId = slotTemplateRecords[slotIndex]?.templateId;
        } else if (isMultiDay && slotTemplateRecords.length > 0) {
          // For multi-day experiences with existing slot templates, use the first one
          slotTemplateId = slotTemplateRecords[0]?.templateId;
        }

        const payload: CreateExperienceTicket = {
          name: draftTicket.name,
          experience: experienceId,
          quantity: draftTicket.quantity!,
          price: draftTicket.amount!.toString(),
          is_paid: experiencePricing === 'paid',
          ...validityFields,
          ...(slotTemplateId ? { slot_template: slotTemplateId } : {}),
        };

        const isEdit = activeFormIndex !== null && formData.items[activeFormIndex]?.apiId != null;
        const existingApiId = isEdit ? formData.items[activeFormIndex].apiId : undefined;

        let response: ApiResponse;
        if (existingApiId) {
          response = await updateExperienceTicket(experienceId, existingApiId, payload);
        } else {
          response = await createTicketMutation.mutateAsync(payload);
        }

        const apiId = response.data?.id;

        const items = [...formData.items];
        const isRecurringExperienceLocal = dateTypeData?.isRecurring ?? false;
        if (activeFormIndex !== null && activeFormIndex < items.length) {
          items[activeFormIndex] = {
            ...items[activeFormIndex],
            apiId,
            name: draftTicket.name,
            quantity: draftTicket.quantity!,
            amount: draftTicket.amount!,
            startTime: draftTicket.startTime || null,
            endTime: draftTicket.endTime || null,
            salesStartDate: draftTicket.salesStartDate!,
            salesStartTime: draftTicket.salesStartTime!,
            salesEndDate: draftTicket.salesEndDate!,
            salesEndTime: draftTicket.salesEndTime!,
            acceptPartialPayment: draftTicket.acceptPartialPayment,
            salesStartRelative: draftTicket.salesStartRelative || null,
            salesEndRelative: draftTicket.salesEndRelative || null,
            duplicateForEntirePeriod: draftTicket.duplicateForEntirePeriod || false,
            ...(isRecurringExperienceLocal && slotIndex !== undefined ? { slotIndex } : {}),
          };
        } else {
          items.push({
            id: uuidv4(),
            apiId,
            name: draftTicket.name,
            quantity: draftTicket.quantity!,
            amount: draftTicket.amount!,
            startTime: draftTicket.startTime || null,
            endTime: draftTicket.endTime || null,
            salesStartDate: draftTicket.salesStartDate!,
            salesStartTime: draftTicket.salesStartTime!,
            salesEndDate: draftTicket.salesEndDate!,
            salesEndTime: draftTicket.salesEndTime!,
            acceptPartialPayment: draftTicket.acceptPartialPayment,
            salesStartRelative: draftTicket.salesStartRelative || null,
            salesEndRelative: draftTicket.salesEndRelative || null,
            duplicateForEntirePeriod: draftTicket.duplicateForEntirePeriod || false,
            ...(isRecurringExperienceLocal && slotIndex !== undefined ? { slotIndex } : {}),
          });
        }

        onChange({ items });
        setActiveFormIndex(null);
        setActiveSlotIndex(null);
        setDraftTicket(emptyTicketForm);
        setFormErrors({});
      } catch (error) {
        const message = parseApiError(error, 'Failed to save ticket');
        setFormErrors({ api: message });
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsSavingLocal(false);
      }
    },
    [
      draftTicket,
      formData.items,
      activeFormIndex,
      onChange,
      experiencePricing,
      experienceId,
      createTicketMutation,
      saveLocally,
      toast,
      dateTypeData,
      slotTemplateRecords,
      isMultiDay,
      ticketMode,
      multiDayStartDate,
      multiDayStartTime,
      multiDayEndTime,
      setSlotTemplateRecords,
    ],
  );

  const handleCancelForm = useCallback(() => {
    setActiveFormIndex(null);
    setDraftTicket(emptyTicketForm);
    setFormErrors({});
  }, []);

  const handleDeleteTicket = useCallback(
    async (ticketId: string) => {
      const ticket = formData.items.find((t) => t.id === ticketId);

      if (ticket?.apiId && experienceId) {
        try {
          await deleteExperienceTicket(experienceId, ticket.apiId);
        } catch (error) {
          toast({
            title: 'Error',
            description: parseApiError(error, 'Failed to delete ticket'),
            variant: 'destructive',
          });
          return;
        }
      }

      onChange({
        items: formData.items.filter((item) => item.id !== ticketId),
      });
    },
    [formData.items, experienceId, onChange, toast],
  );

  const hasTicketDateBadge = isMultiDay
    ? Boolean(multiDayStartDate) &&
      Boolean(multiDayStartTime) &&
      Boolean(multiDayEndDate) &&
      Boolean(multiDayEndTime)
    : isRecurring
      ? Boolean(recurringDays.length > 0) &&
        timeSlots.some((slot) => slot.startTime && slot.endTime)
      : Boolean(dateTypeData.date) &&
        Boolean(dateTypeData.startTime) &&
        Boolean(dateTypeData.endTime);
  const showTicketConnector =
    hasTicketDateBadge && formData.items.length > 0 && activeFormIndex === null;

  // For recurring: check if all valid slots have a saved ticket with apiId
  const validSlots = (dateTypeData?.timeSlots ?? []).filter((s) => s.startTime && s.endTime);
  const allSlotsHaveTickets =
    !isRecurring ||
    (validSlots.length > 0 &&
      validSlots.every((_, index) =>
        formData.items.some((t) => t.slotIndex === index && t.apiId != null),
      ));
  const savedTicketsCount = isRecurring
    ? formData.items.filter((t) => t.slotIndex != null && t.apiId != null).length
    : 0;

  const multiDayDays = getDaysBetween(multiDayStartDate || '', multiDayEndDate || '');

  // Per-ticket validation messages only ever reached an open TicketForm, so a
  // blocked Save & Continue gave no feedback once the form was closed. Surface
  // them next to the action buttons instead.
  const ticketErrorMessages = Object.entries(errors)
    .filter(([key]) => key.startsWith('tickets.'))
    .map(([, message]) => message);

  const blockedMessages = [
    ...(errors.items ? [errors.items] : []),
    ...(errors.ticketMode ? [errors.ticketMode] : []),
    ...ticketErrorMessages,
  ];

  const validationSummary =
    blockedMessages.length > 0 ? (
      <div className="space-y-1 pt-4">
        {blockedMessages.map((message, index) => (
          <p key={index} className="text-xs text-red-500">
            {message}
          </p>
        ))}
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Create Tickets</h2>

      <CommissionPicker
        value={formData.commission}
        onChange={(commission) => onChange({ commission })}
      />

      {isMultiDay && (
        <div className="space-y-1">
          <MultiDayTicketModePicker value={ticketMode} onChange={handleTicketModeChange} />
          {errors.ticketMode && <p className="text-xs text-red-500">{errors.ticketMode}</p>}
        </div>
      )}

      {isMultiDay ? (
        <>
          {ticketMode === 'entire-period' && hasTicketDateBadge ? (
            <div className="relative">
              <div className="mb-2.5">
                <DateBadgeWithTimes
                  startDate={multiDayStartDate}
                  endDate={multiDayEndDate}
                  startTime={multiDayStartTime}
                  endTime={multiDayEndTime}
                />
              </div>
              <span className="pointer-events-none absolute -left-[1.25rem] bottom-0 top-[1.5rem] border-l-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.25rem] top-[1.5rem] h-0 w-5 border-t-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.563rem] top-[1.3125rem] h-2.5 w-2.5 rounded-full bg-primary" />

              {formData.items.length === 0 && activeFormIndex === null ? (
                <TicketForm
                  value={draftTicket}
                  onChange={handleDraftTicketChange}
                  errors={formErrors}
                  onSave={handleSaveTicket}
                  experiencePricing={experiencePricing}
                  commissionPayer={formData.commission}
                  isRecurring={isRecurring}
                  isMultiDay={isMultiDay}
                  ticketMode={ticketMode}
                  isSaving={createTicketMutation.isPending || isSavingLocal}
                />
              ) : (
                <>
                  <div className="mb-4 space-y-3 pt-4">
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
                      ticketMode={ticketMode}
                      isSaving={createTicketMutation.isPending || isSavingLocal}
                    />
                  ) : (
                    <AddTicketTypeButton onClick={handleAddTicket} />
                  )}
                </>
              )}
            </div>
          ) : ticketMode === 'each-day' && hasTicketDateBadge ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {multiDayDays.map((day, index) => (
                  <div key={index} className="relative">
                    <div className="mb-3">
                      <TicketDateBadge
                        mode="single"
                        date={day}
                        startTime={multiDayStartTime!}
                        endTime={multiDayEndTime!}
                      />
                    </div>
                    <span className="pointer-events-none absolute -bottom-[1.875rem] -left-[1.25rem] top-[1.5rem] border-l-[1px] border-dashed border-primary" />
                    <span className="pointer-events-none absolute -left-[1.25rem] top-[1.5rem] h-0 w-5 border-t-[1px] border-dashed border-primary" />
                    <span className="pointer-events-none absolute -left-[1.563rem] top-[1.3125rem] h-2.5 w-2.5 rounded-full bg-primary" />
                    {formData.items.length === 0 && activeFormIndex === null ? (
                      <TicketForm
                        value={draftTicket}
                        onChange={handleDraftTicketChange}
                        errors={formErrors}
                        onSave={handleSaveTicket}
                        experiencePricing={experiencePricing}
                        commissionPayer={formData.commission}
                        isRecurring={isRecurring}
                        isMultiDay={isMultiDay}
                        ticketMode={ticketMode}
                        isSaving={createTicketMutation.isPending || isSavingLocal}
                      />
                    ) : (
                      <>
                        <div className="mb-4 space-y-3">
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
                            ticketMode={ticketMode}
                            isSaving={createTicketMutation.isPending || isSavingLocal}
                          />
                        ) : (
                          <AddTicketTypeButton onClick={handleAddTicket} />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : isRecurring && hasTicketDateBadge ? (
        <div className="space-y-2">
          {validSlots.map((slot, slotIndex) => {
            const slotTicket = formData.items.find(
              (t) => t.slotIndex === slotIndex && t.apiId != null,
            );
            return (
              <div key={slotIndex} className="relative pt-2">
                <div className="mb-3">
                  <TicketDateBadge
                    mode="recurring"
                    days={recurringDays}
                    startTime={slot.startTime!}
                    endTime={slot.endTime!}
                  />
                </div>
                <span className="pointer-events-none absolute -bottom-6 -left-[1.25rem] top-[1.5rem] border-l-[1px] border-dashed border-primary" />
                <span className="pointer-events-none absolute -left-[1.25rem] top-[1.5rem] h-0 w-5 border-t-[1px] border-dashed border-primary" />
                <span className="pointer-events-none absolute -left-[1.563rem] top-[1.3125rem] h-2.5 w-2.5 rounded-full bg-primary" />

                {slotTicket ? (
                  <SavedTicketCard
                    name={slotTicket.name}
                    quantity={slotTicket.quantity}
                    amount={slotTicket.amount}
                    validity={`${slotTicket.salesEndRelative?.amount ?? 1} ${slotTicket.salesEndRelative?.unit ?? 'hour'} before the experience ${slotTicket.salesEndRelative?.anchor === 'start' ? 'starts' : 'ends'}`}
                    coverPhoto={photos?.[0]}
                    onEdit={() => {
                      setActiveFormIndex(formData.items.indexOf(slotTicket));
                      setActiveSlotIndex(slotIndex);
                      setDraftTicket({
                        name: slotTicket.name,
                        quantity: slotTicket.quantity,
                        amount: slotTicket.amount,
                        salesStartDate: slotTicket.salesStartDate,
                        salesStartTime: slotTicket.salesStartTime,
                        salesEndDate: slotTicket.salesEndDate,
                        salesEndTime: slotTicket.salesEndTime,
                        acceptPartialPayment: slotTicket.acceptPartialPayment,
                        salesStartRelative: slotTicket.salesStartRelative,
                        salesEndRelative: slotTicket.salesEndRelative,
                        duplicateForEntirePeriod: slotTicket.duplicateForEntirePeriod,
                      });
                    }}
                    onDelete={() => handleDeleteTicket(slotTicket.id)}
                  />
                ) : (
                  <TicketForm
                    value={draftTicket}
                    onChange={handleDraftTicketChange}
                    errors={formErrors}
                    onSave={() => {
                      handleSaveTicket(slotIndex);
                    }}
                    experiencePricing={experiencePricing}
                    commissionPayer={formData.commission}
                    isRecurring={isRecurring}
                    isMultiDay={isMultiDay}
                    ticketMode={ticketMode}
                    isSaving={createTicketMutation.isPending || isSavingLocal}
                  />
                )}
              </div>
            );
          })}

          {validationSummary}

          {allSlotsHaveTickets && (
            <div className="flex justify-between gap-4 pt-6">
              <Button type="button" variant="ghost" onClick={onCancel} className="text-red-600">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => runAction('continue', onSaveContinue)}
                disabled={pendingAction === 'continue'}
                variant="gradient"
                className="rounded-[50px]"
              >
                {pendingAction === 'continue' && (
                  <IconComponent iconName="Loading03Icon" size={16} className="animate-spin" />
                )}
                {saveContinueLabel}
              </Button>
            </div>
          )}

          {isRecurring && !allSlotsHaveTickets && validSlots.length > 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {savedTicketsCount} of {validSlots.length} time slots have tickets — add a ticket to
              each slot to continue
            </p>
          )}
        </div>
      ) : (
        <div className="relative">
          {hasTicketDateBadge && !isRecurring && !isMultiDay && (
            <div className="mb-4">
              <TicketDateBadge
                mode="single"
                date={dateTypeData.date!}
                startTime={dateTypeData.startTime!}
                endTime={dateTypeData.endTime!}
              />
              <span className="pointer-events-none absolute -bottom-6 -left-[1.25rem] top-[1.5rem] border-l-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.25rem] top-[1.5rem] h-0 w-5 border-t-[1px] border-dashed border-primary" />
              <span className="pointer-events-none absolute -left-[1.563rem] top-[1.3125rem] h-2.5 w-2.5 rounded-full bg-primary" />
            </div>
          )}

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
              ticketMode={ticketMode}
              isSaving={createTicketMutation.isPending || isSavingLocal}
            />
          ) : (
            <>
              <div className="mb-4 space-y-3">
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
                  ticketMode={ticketMode}
                  isSaving={createTicketMutation.isPending || isSavingLocal}
                />
              ) : (
                <AddTicketTypeButton onClick={handleAddTicket} />
              )}
            </>
          )}
        </div>
      )}

      {!isMultiDay && validationSummary}

      {showTicketConnector && !(isRecurring && allSlotsHaveTickets) && (
        <div className="flex gap-2 pt-6 lg:gap-4">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-red-600">
            Cancel
          </Button>
          <div className="flex-1" />
          <Button type="button" onClick={onPreview} variant="outline" className="lg:hidden">
            Preview
          </Button>
          <Button
            type="button"
            onClick={() => runAction('continue', onSaveContinue)}
            disabled={pendingAction === 'continue'}
            variant="gradient"
            className="rounded-[50px]"
          >
            {pendingAction === 'continue' && (
              <IconComponent iconName="Loading03Icon" size={16} className="animate-spin" />
            )}
            {saveContinueLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
