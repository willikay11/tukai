'use client';

import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { RRule } from 'rrule';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { TimePicker } from '@/components/ui/time-picker';
import { useUpdateExperience } from '@/hooks/experiences';
import { toast } from '@/hooks/use-toast';
import { Experience } from '@/types/experience';
import IconComponent from '@/app/components/iconComponent';

const weekdayValueSchema = z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']);

const timeSlotSchema = z.object({
  startTime: z.string().default(''),
  endTime: z.string().default(''),
});

const weekdayOptions: Array<{
  label: string;
  value: z.infer<typeof weekdayValueSchema>;
  dayIndex: number;
  rrule: (typeof RRule)['MO'];
}> = [
  { label: 'Mon', value: 'MO', dayIndex: 1, rrule: RRule.MO },
  { label: 'Tue', value: 'TU', dayIndex: 2, rrule: RRule.TU },
  { label: 'Wed', value: 'WE', dayIndex: 3, rrule: RRule.WE },
  { label: 'Thur', value: 'TH', dayIndex: 4, rrule: RRule.TH },
  { label: 'Fri', value: 'FR', dayIndex: 5, rrule: RRule.FR },
  { label: 'Sat', value: 'SA', dayIndex: 6, rrule: RRule.SA },
  { label: 'Sun', value: 'SU', dayIndex: 0, rrule: RRule.SU },
];

const parseRRuleDateToFormDate = (rawDate: string) => {
  if (!rawDate) {
    return '';
  }

  const parsedDate = moment.parseZone(
    rawDate,
    ['YYYYMMDD[T]HHmmssZ', 'YYYYMMDD[T]HHmmss[Z]', 'YYYYMMDD[T]HHmmss', 'YYYYMMDD'],
    true,
  );

  return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : '';
};

const isRRuleWeekday = (value: unknown): value is { weekday: number } => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (!('weekday' in value)) {
    return false;
  }

  return typeof (value as { weekday: unknown }).weekday === 'number';
};

const parseRecurrenceRule = (recurrenceRule: string) => {
  if (!recurrenceRule?.trim()) {
    return null;
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

  const bydayMatch = rruleBody.match(/(?:^|;)BYDAY=([A-Z,]+)(?:;|$)/i);
  const bydayWeekdays = bydayMatch?.[1]
    ? bydayMatch[1]
        .split(',')
        .map((day) => day.trim().toUpperCase())
        .filter((day): day is z.infer<typeof weekdayValueSchema> =>
          weekdayValueSchema.safeParse(day).success,
        )
    : [];

  const dtstartMatch = normalizedRule.match(/DTSTART(?::|=)(\d{8}(?:T\d{6}Z?)?)/i);
  const untilMatch = rruleBody.match(/(?:^|;)UNTIL=(\d{8}(?:T\d{6}Z?)?)(?:;|$)/i);

  try {
    const parsedRRule = RRule.fromString(rruleBody);
    const rawByWeekday = parsedRRule.origOptions.byweekday ?? parsedRRule.options.byweekday;
    const byweekdayValues = Array.isArray(rawByWeekday)
      ? rawByWeekday
      : rawByWeekday !== undefined
        ? [rawByWeekday]
        : [];

    const recurrenceWeekdays = weekdayOptions
      .filter((option) =>
        byweekdayValues.some((weekday) => {
          if (typeof weekday === 'number') {
            return weekday === option.rrule.weekday;
          }

          if (isRRuleWeekday(weekday)) {
            return weekday.weekday === option.rrule.weekday;
          }

          return false;
        }),
      )
      .map((option) => option.value);

    return {
      recurrenceWeekdays:
        recurrenceWeekdays.length > 0
          ? recurrenceWeekdays
          : weekdayOptions
              .filter((option) => bydayWeekdays.includes(option.value))
              .map((option) => option.value),
      recurrenceStartDate: dtstartMatch?.[1] ? parseRRuleDateToFormDate(dtstartMatch[1]) : '',
      recurrenceEndDate: untilMatch?.[1] ? parseRRuleDateToFormDate(untilMatch[1]) : '',
    };
  } catch {
    return {
      recurrenceWeekdays: weekdayOptions
        .filter((option) => bydayWeekdays.includes(option.value))
        .map((option) => option.value),
      recurrenceStartDate: dtstartMatch?.[1] ? parseRRuleDateToFormDate(dtstartMatch[1]) : '',
      recurrenceEndDate: untilMatch?.[1] ? parseRRuleDateToFormDate(untilMatch[1]) : '',
    };
  }
};

const getFirstRecurringOccurrence = (
  startDate: string,
  recurrenceWeekdays: Array<z.infer<typeof weekdayValueSchema>>,
) => {
  if (!startDate || recurrenceWeekdays.length === 0) {
    return null;
  }

  const startMoment = moment(startDate, 'YYYY-MM-DD', true).startOf('day');

  if (!startMoment.isValid()) {
    return null;
  }

  for (let offset = 0; offset < 7; offset += 1) {
    const candidate = startMoment.clone().add(offset, 'day');
    const hasMatchingWeekday = weekdayOptions.some(
      (option) => recurrenceWeekdays.includes(option.value) && option.dayIndex === candidate.day(),
    );

    if (hasMatchingWeekday) {
      return candidate;
    }
  }

  return null;
};

const hasValidTimeRange = (startTime: string, endTime: string) => {
  const startMoment = moment(startTime, 'HH:mm', true);
  const endMoment = moment(endTime, 'HH:mm', true);

  if (!startMoment.isValid() || !endMoment.isValid()) {
    return false;
  }

  return endMoment.isAfter(startMoment);
};

const experienceDatesSchema = z
  .object({
  isPaid: z.enum(['paid', 'free']),
  dateType: z.enum(['one-day', 'multi-day', 'itinerary']),
  isRecurring: z.boolean().default(false),
  selectedDate: z.string().default(''),
  startTime: z.string().default(''),
  endTime: z.string().default(''),
  recurrenceStartDate: z.string().default(''),
  recurrenceEndDate: z.string().default(''),
  recurrenceWeekdays: z.array(weekdayValueSchema).default([]),
  timeSlots: z.array(timeSlotSchema).min(1).default([{ startTime: '', endTime: '' }]),
  })
  .superRefine((values, ctx) => {
    if (values.isRecurring) {
      if (!values.recurrenceStartDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a start date',
          path: ['recurrenceStartDate'],
        });
      }

      if (!values.recurrenceEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select an end date',
          path: ['recurrenceEndDate'],
        });
      }

      if (values.recurrenceWeekdays.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select at least one day',
          path: ['recurrenceWeekdays'],
        });
      }

      const recurrenceStartMoment = moment(values.recurrenceStartDate, 'YYYY-MM-DD', true);
      const recurrenceEndMoment = moment(values.recurrenceEndDate, 'YYYY-MM-DD', true);

      if (
        recurrenceStartMoment.isValid() &&
        recurrenceEndMoment.isValid() &&
        recurrenceEndMoment.isBefore(recurrenceStartMoment, 'day')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be on or after the start date',
          path: ['recurrenceEndDate'],
        });
      }

      const firstOccurrence = getFirstRecurringOccurrence(
        values.recurrenceStartDate,
        values.recurrenceWeekdays,
      );

      if (
        firstOccurrence &&
        recurrenceEndMoment.isValid() &&
        firstOccurrence.isAfter(recurrenceEndMoment, 'day')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select a date range that includes one of the chosen days',
          path: ['recurrenceEndDate'],
        });
      }

      values.timeSlots.forEach((slot, index) => {
        if (!slot.startTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please select start time',
            path: ['timeSlots', index, 'startTime'],
          });
        }

        if (!slot.endTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please select end time',
            path: ['timeSlots', index, 'endTime'],
          });
        }

        if (slot.startTime && slot.endTime && !hasValidTimeRange(slot.startTime, slot.endTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End time must be later than start time',
            path: ['timeSlots', index, 'endTime'],
          });
        }
      });

      return;
    }

    if (!values.selectedDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a date',
        path: ['selectedDate'],
      });
    }

    if (!values.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select start time',
        path: ['startTime'],
      });
    }

    if (!values.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select end time',
        path: ['endTime'],
      });
    }

    if (values.startTime && values.endTime && !hasValidTimeRange(values.startTime, values.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be later than start time',
        path: ['endTime'],
      });
    }
  });

type ExperienceDatesFormValues = z.infer<typeof experienceDatesSchema>;

interface ExperienceDatesProps {
  experienceId?: string | null;
  experience?: Experience;
  onDatesUpdatedSuccess?: (nextStep?: 'guests') => void;
  onCancel?: () => void;
  cancelActionLabel?: string;
  saveAndExitActionLabel?: string;
  submitActionLabel?: string;
  pendingActionLabel?: string;
  hideSaveAndExit?: boolean;
}

export default function ExperienceDates({
  experienceId,
  experience,
  onDatesUpdatedSuccess,
  onCancel,
  cancelActionLabel = 'Cancel',
  saveAndExitActionLabel = 'Save & Exit',
  submitActionLabel,
  pendingActionLabel = 'Saving...',
  hideSaveAndExit = false,
}: ExperienceDatesProps) {
  const { mutateAsync: updateExperience, isPending: isUpdatingExperience } = useUpdateExperience(
    experienceId || '',
  );

  const form = useForm<ExperienceDatesFormValues>({
    resolver: zodResolver(experienceDatesSchema),
    mode: 'onChange',
    defaultValues: {
      isPaid: 'paid',
      dateType: 'one-day',
      isRecurring: false,
      selectedDate: '',
      startTime: '',
      endTime: '',
      recurrenceStartDate: '',
      recurrenceEndDate: '',
      recurrenceWeekdays: [],
      timeSlots: [{ startTime: '', endTime: '' }],
    },
  });

  const { fields: timeSlotFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'timeSlots',
  });

  const isRecurring = form.watch('isRecurring');
  const recurrenceStartDate = form.watch('recurrenceStartDate');
  const recurrenceWeekdays = form.watch('recurrenceWeekdays');
  const firstRecurringOccurrence = getFirstRecurringOccurrence(
    recurrenceStartDate,
    recurrenceWeekdays,
  );

  // Prefill form with existing experience data on load/reload
  useEffect(() => {
    if (experience) {
      const startMoment = experience.startDate ? moment(experience.startDate) : null;
      const endMoment = experience.endDate ? moment(experience.endDate) : null;
      const savedRecurrenceRule =
        (experience as Experience & { recurrenceRule?: string; recurrence_rule?: string })
          .recurrence_rule ||
        (experience as Experience & { recurrenceRule?: string; recurrence_rule?: string })
          .recurrenceRule ||
        '';
      const parsedRecurrence = parseRecurrenceRule(savedRecurrenceRule);
      const hasRecurringSelection = Boolean(parsedRecurrence?.recurrenceWeekdays.length);

      form.reset({
        isPaid: experience.isPaid ? 'paid' : 'free',
        dateType: 'one-day', // Default, as dateType isn't stored in experience
        isRecurring: hasRecurringSelection,
        selectedDate: startMoment?.isValid() ? startMoment.format('YYYY-MM-DD') : '',
        startTime: startMoment?.isValid() ? startMoment.format('HH:mm') : '',
        endTime: endMoment?.isValid() ? endMoment.format('HH:mm') : '',
        recurrenceStartDate:
          parsedRecurrence?.recurrenceStartDate ||
          (startMoment?.isValid() ? startMoment.format('YYYY-MM-DD') : ''),
        recurrenceEndDate:
          parsedRecurrence?.recurrenceEndDate ||
          (endMoment?.isValid() ? endMoment.format('YYYY-MM-DD') : ''),
        recurrenceWeekdays: parsedRecurrence?.recurrenceWeekdays || [],
        timeSlots: [
          {
            startTime: startMoment?.isValid() ? startMoment.format('HH:mm') : '',
            endTime: endMoment?.isValid() ? endMoment.format('HH:mm') : '',
          },
        ],
      });
    }
  }, [experience, form]);

  const toIsoDateTime = (date: string, time: string) => {
    const dateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm', true);

    if (!dateTime.isValid()) {
      return null;
    }

    return dateTime.toISOString();
  };

  const toIsoEndDateTime = (
    date: string,
    time: string,
    dateType: 'one-day' | 'multi-day' | 'itinerary',
  ) => {
    if (dateType === 'one-day') {
      const endOfDay = moment(date, 'YYYY-MM-DD', true).endOf('day');
      return endOfDay.isValid() ? endOfDay.toISOString() : null;
    }

    return toIsoDateTime(date, time);
  };

  const buildRecurringRule = (values: ExperienceDatesFormValues) => {
    const firstOccurrence = getFirstRecurringOccurrence(
      values.recurrenceStartDate,
      values.recurrenceWeekdays,
    );
    const primaryTimeSlot = values.timeSlots[0];

    if (!firstOccurrence || !primaryTimeSlot?.startTime) {
      return '';
    }

    const startDateTime = moment(
      `${firstOccurrence.format('YYYY-MM-DD')} ${primaryTimeSlot.startTime}`,
      'YYYY-MM-DD HH:mm',
      true,
    );
    const until = moment(values.recurrenceEndDate, 'YYYY-MM-DD', true).endOf('day');

    if (!startDateTime.isValid() || !until.isValid()) {
      return '';
    }

    const byweekday = weekdayOptions
      .filter((option) => values.recurrenceWeekdays.includes(option.value))
      .map((option) => option.rrule);

    return new RRule({
      freq: RRule.WEEKLY,
      interval: 1,
      byweekday,
      dtstart: startDateTime.toDate(),
      until: until.toDate(),
    }).toString();
  };

  const onSubmit = async (values: ExperienceDatesFormValues) => {
    if (!experienceId || !experience) {
      toast({
        title: 'Missing experience',
        description: 'Create experience details first before adding dates.',
        variant: 'destructive',
      });
      return;
    }

    const primaryDate = values.isRecurring
      ? firstRecurringOccurrence?.format('YYYY-MM-DD') || ''
      : values.selectedDate;
    const primaryStartTime = values.isRecurring ? values.timeSlots[0]?.startTime || '' : values.startTime;
    const primaryEndTime = values.isRecurring ? values.timeSlots[0]?.endTime || '' : values.endTime;
    const startDateTime = toIsoDateTime(primaryDate, primaryStartTime);
    const endDateTime = values.isRecurring
      ? toIsoDateTime(primaryDate, primaryEndTime)
      : toIsoEndDateTime(primaryDate, primaryEndTime, values.dateType);
    const recurrenceRule = values.isRecurring ? buildRecurringRule(values) : '';

    if (!startDateTime || !endDateTime || (values.isRecurring && !recurrenceRule)) {
      toast({
        title: 'Invalid date or time',
        description: 'Please choose a valid date and time range.',
        variant: 'destructive',
      });
      return;
    }

    const hasAtLeastOneTicket = Boolean(experience?.tickets?.length);

    try {
      await updateExperience({
        title: experience.title,
        description: experience.description,
        googleMapPlaceId: 'ChIJkYb7L8EXLxgRWogSMeTPg8M', // Placeholder, as location is required by API but not part of this form
        startDate: startDateTime,
        endDate: endDateTime,
        recurrence_rule: recurrenceRule,
        categoriesIds: experience.categories?.map((category) => category.id) || [],
        isPublic: experience.isPublic,
        isPaid: values.isPaid === 'paid',
        invitedCommunityIds: [],
        invitedGuestsEmails: [],
      });

      toast({
        title: 'Success',
        description: 'Experience dates updated successfully.',
        variant: 'success',
      });
      onDatesUpdatedSuccess?.(hasAtLeastOneTicket ? 'guests' : undefined);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : 'Failed to update experience dates.';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const toggleRecurringWeekday = (weekday: z.infer<typeof weekdayValueSchema>) => {
    const currentWeekdays = form.getValues('recurrenceWeekdays');
    const nextWeekdays = currentWeekdays.includes(weekday)
      ? currentWeekdays.filter((current) => current !== weekday)
      : weekdayOptions
          .filter((option) => [...currentWeekdays, weekday].includes(option.value))
          .map((option) => option.value);

    form.setValue('recurrenceWeekdays', nextWeekdays, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="w-full">
      <div className="bg-white">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-base font-bold text-gray-900">Add the dates and tickets</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Experience Type - Paid or Free */}
            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="block text-sm font-medium text-gray-900">
                    Is this a free or a paid experience?
                  </FormLabel>
                  <FormControl>
                    <PillRadioGroup
                      options={[
                        { value: 'paid', label: 'Paid experience' },
                        { value: 'free', label: 'Free experience' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience Type - Duration */}
            <FormField
              control={form.control}
              name="dateType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium text-gray-900">
                    Experience Type
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          value="one-day"
                          checked={field.value === 'one-day'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-4 w-4 border-gray-300 accent-primary focus:ring-primary"
                        />
                        <span className="text-xs text-gray-900">One-Day experience</span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          value="multi-day"
                          checked={field.value === 'multi-day'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-4 w-4 border-gray-300 accent-primary focus:ring-primary"
                        />
                        <span className="text-xs text-gray-900">
                          Multi-Day Experience (e.g., 2 days straight)
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          value="itinerary"
                          checked={field.value === 'itinerary'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-4 w-4 border-gray-300 accent-primary focus:ring-primary"
                        />
                        <span className="text-xs text-gray-900">Itinerary</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Experience Checkbox */}
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <label className="flex cursor-pointer items-center gap-3">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        className="h-4 w-4 rounded-[4px]"
                      />
                      <FormLabel className="cursor-pointer text-xs font-normal text-gray-900">
                        Create a recurring experience
                      </FormLabel>
                    </label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isRecurring ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="recurrenceWeekdays"
                  render={() => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <div className="flex flex-wrap gap-3 sm:gap-5">
                          {weekdayOptions.map((option) => {
                            const isSelected = recurrenceWeekdays.includes(option.value);

                            return (
                              <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-3"
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleRecurringWeekday(option.value)}
                                  className="h-4 w-4 rounded-[4px]"
                                />
                                <span className="text-xs font-medium text-gray-800">
                                  {option.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-xs font-semibold text-gray-800">
                    Recurrence start and end dates
                  </FormLabel>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="recurrenceStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Start Date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurrenceEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="End Date"
                              minDate={
                                recurrenceStartDate
                                  ? moment(recurrenceStartDate, 'YYYY-MM-DD', true).toDate()
                                  : undefined
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {firstRecurringOccurrence && (
                    <div className="inline-flex rounded-full border border-[#9CC3FF] bg-[#DCEBFF] px-4 py-2 text-xs italic font-medium text-[#65758B]">
                      Your first experience will be on{' '}
                      {firstRecurringOccurrence.format('dddd D, MMMM')}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-xs font-semibold text-gray-800">
                    Times/Time Slots
                  </FormLabel>

                  <div className="space-y-5">
                    {timeSlotFields.map((timeSlot, index) => (
                      <div key={timeSlot.id} className="space-y-2">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`timeSlots.${index}.startTime` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <TimePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Start Time"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`timeSlots.${index}.endTime` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <TimePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="End Time"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700"
                          >
                            Remove time slot
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => append({ startTime: '', endTime: '' })}
                    className="p-0 text-primary hover:bg-transparent hover:underline"
                  >
                    <IconComponent iconName="Clock05Icon" className="h-3 w-3" />
                    Add another time slot
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <FormLabel className="text-xs font-medium text-gray-800">
                  Select Experience date(s)
                </FormLabel>

                <FormField
                  control={form.control}
                  name="selectedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Start Time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="End Time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <Button
                variant="destructive"
                type="button"
                onClick={onCancel}
                className="bg-white p-0 text-sm text-red-500 hover:bg-white hover:text-red-600"
              >
                {cancelActionLabel}
              </Button>
              <div className="flex gap-3">
                {!hideSaveAndExit && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUpdatingExperience || !form.formState.isValid}
                    className="rounded-full text-xs font-semibold"
                  >
                    {saveAndExitActionLabel}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isUpdatingExperience || !form.formState.isValid}
                  className="rounded-full px-6 text-xs font-semibold text-white"
                >
                  {isUpdatingExperience
                    ? pendingActionLabel
                    : (submitActionLabel ??
                      (experience?.tickets?.length ? 'Continue' : 'Create Tickets'))}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
