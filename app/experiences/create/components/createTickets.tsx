'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import IconComponent from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import { useCreateExperienceTicket } from '@/hooks/experiences';
import { toast } from '@/hooks/use-toast';
import { Experience } from '@/types/experience';

const commissionOptions = [
  { value: 'organizer', label: 'I will fully pay the commission' },
  { value: 'customer', label: 'The customer will pay the commission' },
  { value: 'split', label: 'Split 50-50 between the customer and myself' },
] as const;

const ticketSchema = z.object({
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
  name: string;
  quantity: number;
  amount: number;
  validity: string;
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

export default function CreateTickets({
  experienceId,
  experience,
}: {
  experienceId?: string | null;
  experience?: Experience;
}) {
  const form = useForm<CreateTicketsFormValues>({
    resolver: zodResolver<CreateTicketsFormValues>(createTicketsSchema),
    mode: 'onChange',
    defaultValues: {
      commissionPayer: 'organizer',
      selectedDateSummary: '24/03/2026 - 06:00 AM - 09:00 PM',
      tickets: [
        {
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
  const { mutateAsync: createExperienceTicket, isPending: isCreatingTicket } =
    useCreateExperienceTicket();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tickets',
  });

  const watchedTickets = watch('tickets');
  const commissionPayer = watch('commissionPayer');
  const selectedDateSummary = watch('selectedDateSummary');

  const existingTickets = experience?.tickets ?? [];
  const coverPhoto =
    experience?.photos?.find((p) => p.isCover)?.photo ||
    experience?.photos?.[0]?.photo;

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
      .filter((entry) => Boolean(entry.fieldId) && !submittedTicketIds.includes(entry.fieldId as string));

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
    const didSubmit = await submitNewTickets(values);
    if (!didSubmit) {
      return;
    }

    toast({
      title: 'Tickets saved',
      description: 'Ticket details have been saved successfully.',
    });
  };

  const handleAddAnotherTicketType = () => {
    void handleSubmit(async (values) => {
      const didSubmit = await submitNewTickets(values);

      if (!didSubmit) {
        return;
      }

      append({
        ticketName: '',
        quantity: '',
        amount: '',
        salesStartDate: '',
        salesStartTime: '',
        salesEndDate: '',
        salesEndTime: '',
      });
    })();
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
        <div className="absolute left-0 top-5 w-5 border-t border-dashed border-gray-300" />
        <div className="absolute left-[1px] top-5 z-10 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />

        <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-primary bg-emerald-100 px-4 py-2 text-sm font-medium text-gray-900">
          <IconComponent iconName="Calendar03Icon" size={16} color="#064E3B" />
          <span className="text-xs text-green-900">Date: {selectedDateSummary}</span>
          <IconComponent iconName="ArrowDown01Icon" size={16} color="#064E3B" />
        </div>
        <input type="hidden" {...register('selectedDateSummary')} />

        <div className="mt-4 space-y-5">
          {/* Existing tickets from API */}
          {existingTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="relative rounded-[12px] border border-dashed border-primary bg-emerald-50 p-2"
            >
              {/* Top notch */}
              <div className="absolute -top-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-b-full border border-t-0 border-dashed border-primary bg-white" />
              {/* Bottom notch */}
              <div className="absolute -bottom-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-t-full border border-b-0 border-dashed border-primary bg-white" />

              <div className="flex items-center gap-3">
                <img
                  src={coverPhoto}
                  alt={ticket.name}
                  className="h-20 w-20 flex-shrink-0 rounded-[12px] object-cover"
                />

                <div className="h-16 border-l border-dashed border-primary" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-gray-800">{ticket.name}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="button" className="text-primary">
                        <IconComponent iconName="Edit02Icon" size={16} color="#047857" />
                      </button>
                      <button type="button" className="text-red-500">
                        <IconComponent iconName="Delete02Icon" size={16} color="#EF4444" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-6 gap-2">
                    <div className="col-span-1">
                      <p className="text-xs text-gray-500">Qty</p>
                      <p className="text-xs font-semibold text-gray-800">{ticket.quantity}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-xs font-semibold text-gray-800">{formatKsh(ticket.price)}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-xs text-gray-500">Available</p>
                      <p className="truncate text-xs font-semibold text-gray-800">
                        {ticket.availableQuantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* New tickets being created */}
          {fields.map((field, index) => {
            const ticketErrors = errors.tickets?.[index];
            const ticketQuantity = Number(watchedTickets?.[index]?.quantity) || 0;
            const ticketAmount = Number(watchedTickets?.[index]?.amount) || 0;
            const customerCommissionRate =
              commissionPayer === 'customer' ? 0.04 : commissionPayer === 'split' ? 0.02 : 0;
            const ticketTotalCost = ticketQuantity * ticketAmount;
            const customerSeesPerTicket = ticketAmount * (1 + customerCommissionRate);
            const savedTicket = savedTickets.find((ticket) => ticket.fieldId === field.id);

            if (savedTicket) {
              return (
                <div
                  key={field.id}
                  className="relative rounded-[12px] border border-dashed border-primary bg-emerald-50 p-2"
                >
                  {/* Top notch */}
                  <div className="absolute -top-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-b-full border border-t-0 border-dashed border-primary bg-white" />
                  {/* Bottom notch */}
                  <div className="absolute -bottom-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-t-full border border-b-0 border-dashed border-primary bg-white" />

                  <div className="flex items-center gap-3">
                    <img
                      src={coverPhoto}
                      alt={savedTicket.name}
                      className="h-20 w-20 flex-shrink-0 rounded-[12px] object-cover"
                    />

                    <div className="h-16 border-l border-dashed border-primary" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-gray-800">{savedTicket.name}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSubmittedTicketIds((prev) => prev.filter((id) => id !== field.id));
                            }}
                            className="text-primary"
                          >
                            <IconComponent iconName="Edit02Icon" size={16} color="#047857" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              remove(index);
                              setSubmittedTicketIds((prev) => prev.filter((id) => id !== field.id));
                              setSavedTickets((prev) =>
                                prev.filter((ticket) => ticket.fieldId !== field.id),
                              );
                            }}
                            className="text-red-500"
                          >
                            <IconComponent iconName="Delete02Icon" size={16} color="#EF4444" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-6 gap-2">
                        <div className='col-span-1'>
                          <p className="text-xs text-gray-500">Qty</p>
                          <p className="text-xs font-semibold text-gray-800">{savedTicket.quantity}</p>
                        </div>
                        <div className='col-span-2'>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-xs font-semibold text-gray-800">
                            {formatKsh(savedTicket.amount)}
                          </p>
                        </div>
                        <div className='col-span-3'>
                          <p className="text-xs text-gray-500">Validity</p>
                          <p className="truncate text-xs font-semibold text-gray-800">
                            {savedTicket.validity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-3">
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

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs font-medium text-red-500"
                  >
                    Remove ticket type
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={handleAddAnotherTicketType}
          disabled={isCreatingTicket}
          className="mt-2 px-0 hover:bg-transparent"
        >
          <IconComponent iconName="Ticket02Icon" size={16} color="#047857" />
          Add another Ticket Type
        </Button>
      </div>

      <div className="mt-5">
        <Button
          type="submit"
          variant="gradient"
          disabled={!isValid || isSubmitting || isCreatingTicket || !experienceId}
          className="rounded-full px-5 text-xs text-white"
        >
          Save Tickets
        </Button>
      </div>
    </form>
  );
}
