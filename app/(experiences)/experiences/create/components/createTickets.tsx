'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { RRule } from 'rrule';
import { z } from 'zod';

import { IconComponent } from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import {
  useCreateExperienceTicket,
  useDeleteExperienceTicket,
  useUpdateExperienceTicket,
} from '@/hooks/experiences';
import { toast } from '@/hooks/use-toast';
import { Experience } from '@/types/experience';
import { Ticket } from '@/types/ticket';

import { SavedTicketCard } from './savedTicketCard';

const commissionOptions = [
  { value: 'organizer', label: 'I will fully pay the commission' },
  { value: 'customer', label: 'The customer will pay the commission' },
  { value: 'split', label: 'Split 50-50 between the customer and myself' },
] as const;

const ticketSchema = z.object({
  slotSectionId: z.string().default('slot-0'),
  ticketName: z.string().min(1, 'Ticket name is required'),
  quantity: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      const parsedValue = Number(value);
      return Number.isNaN(parsedValue) ? value : parsedValue;
    },
    z
      .number({
        required_error: 'Quantity is required',
        invalid_type_error: 'Quantity is required',
      })
      .int()
      .min(1, 'Quantity must be at least 1'),
  ),
  amount: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      const parsedValue = Number(value);
      return Number.isNaN(parsedValue) ? value : parsedValue;
    },
    z
      .number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount is required',
      })
      .min(1, 'Amount must be greater than 0'),
  ),
  salesStartDate: z.string().min(1, 'Start date is required'),
  salesStartTime: z.string().min(1, 'Start time is required'),
  salesEndDate: z.string().min(1, 'End date is required'),
  salesEndTime: z.string().min(1, 'End time is required'),
});

const createTicketsSchema = z.object({
  commissionPayer: z.enum(['organizer', 'customer', 'split']),
  selectedDateSummary: z.string().min(1),
  tickets: z.array(ticketSchema).min(1),
});

type CreateTicketsFormValues = z.input<typeof createTicketsSchema>;

type SavedTicketCard = {
  fieldId: string;
  slotSectionId: string;
  name: string;
  quantity: number;
  amount: number;
  validity: string;
};

type PersistedTicketSlotConfig = {
  isRecurring: boolean;
  recurrenceWeekdays: string[];
  selectedDate: string;
  timeSlots: Array<{ startTime: string; endTime: string }>;
};

type TicketSection = {
  id: string;
  title: string;
};

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatKes(value: number) {
  return `KES ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
}

function formatKsh(value: number) {
  return `Ksh ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
}

function formatTicketValidity(
  salesStartDate: string,
  salesStartTime: string,
  salesEndDate: string,
  salesEndTime: string,
) {
  if (!salesStartDate || !salesStartTime || !salesEndDate || !salesEndTime) {
    return '—';
  }

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hourRaw, minuteRaw] = time.split(':');
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return time;
    }

    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return `${formatDate(salesStartDate)}, ${formatTime(salesStartTime)} - ${formatDate(salesEndDate)} ${formatTime(salesEndTime)}`;
}

function getApiTicketValidity(ticket: Ticket): string {
  const apiValidity = (ticket as unknown as { validity?: string | null }).validity;
  return apiValidity?.trim() ? apiValidity : '-';
}

const weekdayLabelsByIndex: Record<number, string> = {
  0: 'Mon',
  1: 'Tue',
  2: 'Wed',
  3: 'Thu',
  4: 'Fri',
  5: 'Sat',
  6: 'Sun',
};

const weekdayLabelsByCode: Record<string, string> = {
  MO: 'Mon',
  TU: 'Tue',
  WE: 'Wed',
  TH: 'Thu',
  FR: 'Fri',
  SA: 'Sat',
  SU: 'Sun',
};

function formatTimeLabel(time: string): string {
  const timeMoment = moment(time, 'HH:mm', true);
  return timeMoment.isValid() ? timeMoment.format('h:mm A') : time;
}

function buildTicketSectionsFromConfig(
  config: PersistedTicketSlotConfig,
  fallbackSummary: string,
): TicketSection[] {
  if (!config.timeSlots.length) {
    return [{ id: 'slot-0', title: fallbackSummary || 'No date set' }];
  }

  const recurrenceDayLabels = config.recurrenceWeekdays
    .map((day) => weekdayLabelsByCode[day])
    .filter(Boolean);
  const selectedDateMoment = moment(config.selectedDate, 'YYYY-MM-DD', true);

  return config.timeSlots.map((slot, index) => {
    const timeLabel = `${formatTimeLabel(slot.startTime)} - ${formatTimeLabel(slot.endTime)}`;

    if (config.isRecurring) {
      const recurringPrefix = recurrenceDayLabels.length
        ? `Every ${recurrenceDayLabels.join(', ')}`
        : `Recurring Slot ${index + 1}`;

      return {
        id: `slot-${index}`,
        title: `${recurringPrefix}: ${timeLabel}`,
      };
    }

    const datePrefix = selectedDateMoment.isValid()
      ? selectedDateMoment.format('DD/MM/YYYY')
      : `Slot ${index + 1}`;

    return {
      id: `slot-${index}`,
      title: `${datePrefix}: ${timeLabel}`,
    };
  });
}

function parseRecurringWeekdayLabels(recurrenceRule: string): string[] {
  if (!recurrenceRule?.trim()) {
    return [];
  }

  const normalizedRule = recurrenceRule.trim();
  const lines = normalizedRule
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const rruleLine = lines.find((line) => line.toUpperCase().startsWith('RRULE:')) || lines[0] || '';
  const rruleBody = rruleLine.toUpperCase().startsWith('RRULE:')
    ? rruleLine.slice('RRULE:'.length)
    : rruleLine;

  try {
    const parsedRule = RRule.fromString(rruleBody);
    const rawByWeekday = parsedRule.origOptions.byweekday ?? parsedRule.options.byweekday;
    const weekdays = Array.isArray(rawByWeekday)
      ? rawByWeekday
      : rawByWeekday !== undefined
        ? [rawByWeekday]
        : [];

    const labels = weekdays
      .map((weekday) => {
        const weekdayIndex =
          typeof weekday === 'number'
            ? weekday
            : typeof weekday === 'object' && weekday && 'weekday' in weekday
              ? Number((weekday as { weekday: number }).weekday)
              : -1;

        return weekdayLabelsByIndex[weekdayIndex] || null;
      })
      .filter((label): label is string => Boolean(label));

    return Array.from(new Set(labels));
  } catch {
    const byDayMatch = rruleBody.match(/(?:^|;)BYDAY=([A-Z,]+)(?:;|$)/i);
    const fallbackMap: Record<string, string> = {
      MO: 'Mon',
      TU: 'Tue',
      WE: 'Wed',
      TH: 'Thu',
      FR: 'Fri',
      SA: 'Sat',
      SU: 'Sun',
    };

    if (!byDayMatch?.[1]) {
      return [];
    }

    return byDayMatch[1]
      .split(',')
      .map((day) => fallbackMap[day.trim().toUpperCase()])
      .filter(Boolean);
  }
}

export const CreateTickets = ({
  experienceId,
  experience,
}: {
  experienceId?: string | null;
  experience?: Experience;
}) => {
  const savedRecurrenceRule =
    (experience as Experience & { recurrenceRule?: string; recurrence_rule?: string })
      ?.recurrence_rule ||
    (experience as Experience & { recurrenceRule?: string; recurrence_rule?: string })
      ?.recurrenceRule ||
    '';

  const recurringWeekdayLabels = useMemo(
    () => parseRecurringWeekdayLabels(savedRecurrenceRule),
    [savedRecurrenceRule],
  );
  const isRecurringExperience = recurringWeekdayLabels.length > 0;
  const [ticketSections, setTicketSections] = useState<TicketSection[]>([
    { id: 'slot-0', title: 'No date set' },
  ]);

  // Compute selectedDateSummary from experience dates
  const selectedDateSummary = useMemo(() => {
    if (!experience?.startDate || !experience?.endDate) {
      return '';
    }

    const startMoment = moment(experience.startDate);
    const endMoment = moment(experience.endDate);

    if (!startMoment.isValid() || !endMoment.isValid()) {
      return '';
    }

    const startTimeStr = startMoment.format('hh:mm A');
    const endTimeStr = endMoment.format('hh:mm A');

    if (isRecurringExperience) {
      return `Every ${recurringWeekdayLabels.join(', ')}: ${startTimeStr} - ${endTimeStr}`;
    }

    const dateStr = startMoment.format('DD/MM/YYYY');

    return `${dateStr} - ${startTimeStr} - ${endTimeStr}`;
  }, [experience?.startDate, experience?.endDate, isRecurringExperience, recurringWeekdayLabels]);

  const form = useForm<CreateTicketsFormValues>({
    resolver: zodResolver<CreateTicketsFormValues>(createTicketsSchema),
    mode: 'onChange',
    defaultValues: {
      commissionPayer: 'organizer',
      selectedDateSummary: selectedDateSummary || '',
      tickets: [
        {
          slotSectionId: 'slot-0',
          ticketName: '',
          quantity: '',
          amount: '',
          salesStartDate: '',
          salesStartTime: '',
          salesEndDate: '',
          salesEndTime: '',
        },
      ],
    },
  });

  const { register, control, watch, setValue, handleSubmit, formState } = form;
  const { errors, isValid, isSubmitting } = formState;
  const [submittedTicketIds, setSubmittedTicketIds] = useState<string[]>([]);
  const [savedTickets, setSavedTickets] = useState<SavedTicketCard[]>([]);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const { mutateAsync: createExperienceTicket, isPending: isCreatingTicket } =
    useCreateExperienceTicket();
  const { mutateAsync: updateExperienceTicket, isPending: isUpdatingTicket } =
    useUpdateExperienceTicket(editingTicketId || '');
  const { mutateAsync: deleteExperienceTicketMutation, isPending: isDeletingTicket } =
    useDeleteExperienceTicket(deletingTicketId || '');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tickets',
  });

  const watchedTickets = watch('tickets');
  const commissionPayer = watch('commissionPayer');

  const existingTickets = experience?.tickets ?? [];
  const coverPhoto =
    experience?.photos?.find((p) => p.isCover)?.photo || experience?.photos?.[0]?.photo;

  // Max date for ticket sales date pickers (experience end date)
  const experienceEndDate = useMemo(() => {
    if (!experience?.endDate) return undefined;
    const endMoment = moment(experience.endDate);
    return endMoment.isValid() ? endMoment.toDate() : undefined;
  }, [experience?.endDate]);

  // Min date for ticket sales date pickers (current date)
  const currentDate = useMemo(() => new Date(), []);

  const isEditing = Boolean(editingTicketId);

  const defaultSectionId = ticketSections[0]?.id || 'slot-0';

  useEffect(() => {
    if (!experienceId || typeof window === 'undefined') {
      setTicketSections([{ id: 'slot-0', title: selectedDateSummary || 'No date set' }]);
      return;
    }

    const storedRaw = window.localStorage.getItem(`experience-ticket-slots:${experienceId}`);

    if (!storedRaw) {
      setTicketSections([{ id: 'slot-0', title: selectedDateSummary || 'No date set' }]);
      return;
    }

    try {
      const parsed = JSON.parse(storedRaw) as PersistedTicketSlotConfig;
      const hasArraySlots = Array.isArray(parsed.timeSlots);

      if (!hasArraySlots) {
        setTicketSections([{ id: 'slot-0', title: selectedDateSummary || 'No date set' }]);
        return;
      }

      const nextSections = buildTicketSectionsFromConfig(parsed, selectedDateSummary || 'No date set');
      setTicketSections(nextSections.length ? nextSections : [{ id: 'slot-0', title: selectedDateSummary || 'No date set' }]);
    } catch {
      setTicketSections([{ id: 'slot-0', title: selectedDateSummary || 'No date set' }]);
    }
  }, [experienceId, selectedDateSummary]);

  useEffect(() => {
    watchedTickets?.forEach((ticket, index) => {
      if (!ticket?.slotSectionId) {
        setValue(`tickets.${index}.slotSectionId`, defaultSectionId, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    });
  }, [watchedTickets, setValue, defaultSectionId]);

  const handleEditTicket = (ticket: Ticket | SavedTicketCard, fieldId?: string) => {
    // Determine if this is an API ticket or a locally saved ticket
    const isApiTicket = 'id' in ticket && !('fieldId' in ticket);
    const ticketId = isApiTicket ? (ticket as Ticket).id : editingTicketId;

    if (isApiTicket) {
      setEditingTicketId((ticket as Ticket).id);
    } else if (fieldId) {
      // For locally saved tickets, we need to find the original API ticket id if it exists
      // For now, just re-enable editing the form field
      setSubmittedTicketIds((prev) => prev.filter((id) => id !== fieldId));
      return;
    }

    // Fill form with ticket data
    const apiTicket = ticket as Ticket;
    setValue('tickets.0.slotSectionId', defaultSectionId, { shouldValidate: false });
    setValue('tickets.0.ticketName', apiTicket.name, { shouldValidate: true });
    setValue('tickets.0.quantity', apiTicket.quantity.toString(), { shouldValidate: true });
    setValue('tickets.0.amount', apiTicket.price.toString(), { shouldValidate: true });
    // Note: API tickets may not have sales validity dates, so we leave them empty or prefill if available
    setValue('tickets.0.salesStartDate', '', { shouldValidate: false });
    setValue('tickets.0.salesStartTime', '', { shouldValidate: false });
    setValue('tickets.0.salesEndDate', '', { shouldValidate: false });
    setValue('tickets.0.salesEndTime', '', { shouldValidate: false });
  };

  const handleCancelEdit = () => {
    setEditingTicketId(null);
    // Reset the first ticket form
    setValue('tickets.0.ticketName', '', { shouldValidate: false });
    setValue('tickets.0.quantity', '', { shouldValidate: false });
    setValue('tickets.0.amount', '', { shouldValidate: false });
    setValue('tickets.0.salesStartDate', '', { shouldValidate: false });
    setValue('tickets.0.salesStartTime', '', { shouldValidate: false });
    setValue('tickets.0.salesEndDate', '', { shouldValidate: false });
    setValue('tickets.0.salesEndTime', '', { shouldValidate: false });
  };

  // Effect to handle ticket deletion when deletingTicketId is set
  useEffect(() => {
    if (!deletingTicketId) return;

    const performDelete = async () => {
      try {
        await deleteExperienceTicketMutation();
        toast({
          title: 'Ticket deleted',
          description: 'Ticket has been deleted successfully.',
          variant: 'success',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to delete ticket.',
          variant: 'destructive',
        });
      } finally {
        setDeletingTicketId(null);
      }
    };

    performDelete();
  }, [deletingTicketId, deleteExperienceTicketMutation]);

  const handleDeleteTicket = (ticketId: string) => {
    setDeletingTicketId(ticketId);
  };

  const submitNewTickets = async (values: CreateTicketsFormValues) => {
    if (!experienceId) {
      toast({
        title: 'Create experience first',
        description: 'Please create the experience before adding tickets.',
        variant: 'destructive',
      });
      return false;
    }

    const ticketEntries = values.tickets
      .map((ticket, index) => ({ ticket, fieldId: fields[index]?.id }))
      .filter(
        (entry) => Boolean(entry.fieldId) && !submittedTicketIds.includes(entry.fieldId as string),
      );

    if (!ticketEntries.length) {
      return true;
    }

    try {
      await Promise.all(
        ticketEntries.map(({ ticket }) =>
          createExperienceTicket({
            experience: experienceId,
            name: ticket.ticketName,
            quantity: Number(ticket.quantity),
            price: Number(ticket.amount),
            availableQuantity: Number(ticket.quantity),
          }),
        ),
      );

      setSavedTickets((prev) => {
        const next = [...prev];

        ticketEntries.forEach(({ fieldId, ticket }) => {
          const normalizedFieldId = fieldId as string;
          const nextCard: SavedTicketCard = {
            fieldId: normalizedFieldId,
            slotSectionId: ticket.slotSectionId || defaultSectionId,
            name: ticket.ticketName,
            quantity: Number(ticket.quantity),
            amount: Number(ticket.amount),
            validity: formatTicketValidity(
              ticket.salesStartDate,
              ticket.salesStartTime,
              ticket.salesEndDate,
              ticket.salesEndTime,
            ),
          };

          const existingIndex = next.findIndex((saved) => saved.fieldId === normalizedFieldId);
          if (existingIndex >= 0) {
            next[existingIndex] = nextCard;
          } else {
            next.push(nextCard);
          }
        });

        return next;
      });

      setSubmittedTicketIds((prev) => [
        ...prev,
        ...ticketEntries.map((entry) => entry.fieldId as string).filter((id) => !prev.includes(id)),
      ]);

      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create ticket(s).',
        variant: 'destructive',
      });
      return false;
    }
  };

  const onSubmit = async (values: CreateTicketsFormValues) => {
    // Handle update flow
    if (isEditing && editingTicketId) {
      const ticket = values.tickets[0];
      try {
        await updateExperienceTicket({
          experience: experienceId!,
          name: ticket.ticketName,
          quantity: Number(ticket.quantity),
          price: Number(ticket.amount),
          availableQuantity: Number(ticket.quantity),
        });

        toast({
          title: 'Ticket updated',
          description: 'Ticket details have been updated successfully.',
          variant: 'success',
        });

        // Reset editing state and form
        handleCancelEdit();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to update ticket.',
          variant: 'destructive',
        });
      }
      return;
    }

    // Handle create flow
    const didSubmit = await submitNewTickets(values);
    if (!didSubmit) {
      return;
    }

    toast({
      title: 'Tickets saved',
      description: 'Ticket details have been saved successfully.',
      variant: 'success',
    });
  };

  const handleAddAnotherTicketType = (slotSectionId: string) => {
    append({
      slotSectionId,
      ticketName: '',
      quantity: '',
      amount: '',
      salesStartDate: '',
      salesStartTime: '',
      salesEndDate: '',
      salesEndTime: '',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full">
      <h2 className="text-xl font-semibold text-gray-900">Create Tickets</h2>

      <p className="mt-4 text-xs text-gray-700">
        Fees allocation{' '}
        <span className="text-gray-500">
          (Tukai charges a 4% commission, who should pay this commission?)
        </span>
      </p>

      <div className="mt-3 space-y-3">
        {commissionOptions.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 text-sm text-gray-800"
          >
            <input
              type="radio"
              value={option.value}
              {...register('commissionPayer')}
              className="h-4 w-4 border-gray-300 accent-primary"
            />
            <span className="text-xs">{option.label}</span>
          </label>
        ))}
      </div>

      <div className="relative mt-5 pl-5">
        <div className="absolute bottom-1 left-0 top-5 border-l border-dashed border-gray-300" />
        <div className="absolute left-[1px] top-5 z-10 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />

        <div className="mt-4 space-y-5">
          {(ticketSections.length ? ticketSections : [{ id: 'slot-0', title: 'No date set' }]).map(
            (section, sectionIndex) => (
              <div
                key={section.id}
                className="relative space-y-4"
              >
                <div className="relative inline-flex">
                  <div className="absolute right-full top-1/2 w-5 -translate-y-1/2 border-t border-dashed border-gray-300" />

                  <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-primary bg-emerald-100 px-4 py-2 text-sm font-medium text-gray-900">
                    <IconComponent iconName="Calendar03Icon" size={16} color="#064E3B" />
                    <span className="text-xs font-semibold text-green-900">
                      {ticketSections.length > 1
                        ? section.title
                        : isRecurringExperience
                          ? selectedDateSummary || 'Recurring schedule not set'
                          : `Date: ${selectedDateSummary || 'No date set'}`}
                    </span>
                    {/* <IconComponent iconName="ArrowDown01Icon" size={16} color="#064E3B" /> */}
                  </div>
                </div>

                {/* Existing tickets from API (shown in first section when slot mapping is unavailable) */}
                {sectionIndex === 0 &&
                  existingTickets.map((ticket) => (
                    <SavedTicketCard
                      key={ticket.id}
                      name={ticket.name}
                      quantity={ticket.quantity}
                      amount={ticket.price}
                      validity={getApiTicketValidity(ticket)}
                      coverPhoto={coverPhoto}
                      onEdit={() => handleEditTicket(ticket)}
                      onDelete={() => handleDeleteTicket(ticket.id)}
                      isDeleting={isDeletingTicket && deletingTicketId === ticket.id}
                    />
                  ))}

                {fields.map((field, index) => {
                  const ticketErrors = errors.tickets?.[index];
                  const ticketQuantity = Number(watchedTickets?.[index]?.quantity) || 0;
                  const ticketAmount = Number(watchedTickets?.[index]?.amount) || 0;
                  const customerCommissionRate =
                    commissionPayer === 'customer' ? 0.04 : commissionPayer === 'split' ? 0.02 : 0;
                  const ticketTotalCost = ticketQuantity * ticketAmount;
                  const customerSeesPerTicket = ticketAmount * (1 + customerCommissionRate);
                  const savedTicket = savedTickets.find((ticket) => ticket.fieldId === field.id);
                  const ticketSlotSectionId =
                    watchedTickets?.[index]?.slotSectionId ||
                    (field as { slotSectionId?: string }).slotSectionId ||
                    defaultSectionId;

                  if (ticketSlotSectionId !== section.id) {
                    return null;
                  }

                  if (savedTicket) {
                    return (
                      <SavedTicketCard
                        key={field.id}
                        name={savedTicket.name}
                        quantity={savedTicket.quantity}
                        amount={savedTicket.amount}
                        validity={savedTicket.validity}
                        coverPhoto={coverPhoto}
                        onEdit={() => handleEditTicket(savedTicket, field.id)}
                        onDelete={() => {
                          remove(index);
                          setSubmittedTicketIds((prev) => prev.filter((id) => id !== field.id));
                          setSavedTickets((prev) =>
                            prev.filter((ticket) => ticket.fieldId !== field.id),
                          );
                        }}
                      />
                    );
                  }

                  return (
                    <div key={field.id} className="space-y-3">
                      <input type="hidden" {...register(`tickets.${index}.slotSectionId`)} />

                      <Input
                        placeholder="Ticket Name e.g. VIP, Early Bird, Locals etc..."
                        suffixIcon={<IconComponent iconName="Ticket01Icon" size={16} color="#9CA3AF" />}
                        {...register(`tickets.${index}.ticketName`)}
                      />
                      {ticketErrors?.ticketName && (
                        <p className="text-xs text-red-500">{ticketErrors.ticketName.message}</p>
                      )}

                      <Input
                        type="number"
                        min={1}
                        placeholder="Available Ticket Quantity"
                        suffixIcon={
                          <IconComponent iconName="ArrowUpDownIcon" size={16} color="#9CA3AF" />
                        }
                        {...register(`tickets.${index}.quantity`)}
                      />
                      {ticketErrors?.quantity && (
                        <p className="text-xs text-red-500">{ticketErrors.quantity.message}</p>
                      )}

                      <Input
                        type="number"
                        min={1}
                        placeholder="Amount per ticket"
                        suffixIcon={<IconComponent iconName="Money03Icon" size={16} color="#9CA3AF" />}
                        {...register(`tickets.${index}.amount`)}
                      />
                      {ticketErrors?.amount && (
                        <p className="text-xs text-red-500">{ticketErrors.amount.message}</p>
                      )}

                      <div className="mt-3 flex items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-xs text-gray-700">
                        <span className="italic">
                          Total Tickets Cost:{' '}
                          <span className="font-semibold text-gray-900">
                            {formatKes(ticketTotalCost)}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="italic">
                          What the customer sees:{' '}
                          <span className="font-semibold text-gray-900">
                            {formatKes(customerSeesPerTicket)}
                          </span>
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-semibold text-gray-900">
                        Ticket Sales Validity{' '}
                        <span className="font-normal text-gray-600">
                          (When should the sales of these tickets start and end)
                        </span>
                      </p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <DatePicker
                            value={watch(`tickets.${index}.salesStartDate`) || ''}
                            onChange={(value) =>
                              setValue(`tickets.${index}.salesStartDate`, value, {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            }
                            placeholder="Start Date"
                            minDate={currentDate}
                            maxDate={experienceEndDate}
                          />
                          {ticketErrors?.salesStartDate && (
                            <p className="mt-1 text-xs text-red-500">
                              {ticketErrors.salesStartDate.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <TimePicker
                            value={watch(`tickets.${index}.salesStartTime`) || ''}
                            onChange={(value) =>
                              setValue(`tickets.${index}.salesStartTime`, value, {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            }
                            placeholder="Start Time"
                          />
                          {ticketErrors?.salesStartTime && (
                            <p className="mt-1 text-xs text-red-500">
                              {ticketErrors.salesStartTime.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <DatePicker
                            value={watch(`tickets.${index}.salesEndDate`) || ''}
                            onChange={(value) =>
                              setValue(`tickets.${index}.salesEndDate`, value, {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            }
                            placeholder="End Date"
                            minDate={currentDate}
                            maxDate={experienceEndDate}
                          />
                          {ticketErrors?.salesEndDate && (
                            <p className="mt-1 text-xs text-red-500">
                              {ticketErrors.salesEndDate.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <TimePicker
                            value={watch(`tickets.${index}.salesEndTime`) || ''}
                            onChange={(value) =>
                              setValue(`tickets.${index}.salesEndTime`, value, {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            }
                            placeholder="End Time"
                          />
                          {ticketErrors?.salesEndTime && (
                            <p className="mt-1 text-xs text-red-500">
                              {ticketErrors.salesEndTime.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {fields.length > 1 && !isEditing && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-xs font-medium text-red-500"
                        >
                          Remove ticket type
                        </button>
                      )}

                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-xs font-medium text-gray-500"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  );
                })}

                {!isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleAddAnotherTicketType(section.id)}
                    disabled={isCreatingTicket}
                    className="px-0 text-primary hover:bg-transparent"
                  >
                    <IconComponent iconName="Ticket02Icon" size={16} color="#047857" />
                    Add another Ticket Type
                  </Button>
                )}
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mt-5">
        <Button
          type="submit"
          variant="gradient"
          disabled={
            !isValid || isSubmitting || isCreatingTicket || isUpdatingTicket || !experienceId
          }
          className="rounded-full px-5 text-xs text-white"
        >
          {isEditing ? 'Update Ticket' : 'Save Tickets'}
        </Button>
      </div>
    </form>
  );
};
