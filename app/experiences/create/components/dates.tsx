'use client';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
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

const experienceDatesSchema = z.object({
  experienceType: z.enum(['paid', 'free']),
  dateType: z.enum(['one-day', 'multi-day', 'itinerary']),
  isRecurring: z.boolean().default(false),
  selectedDate: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select start time'),
  endTime: z.string().min(1, 'Please select end time'),
});

export default function ExperienceDates({
  experienceId,
  experience,
}: {
  experienceId?: string | null;
  experience?: Experience;
}) {
  const { mutateAsync: updateExperience, isPending: isUpdatingExperience } = useUpdateExperience(
    experienceId || '',
  );

  const form = useForm<z.infer<typeof experienceDatesSchema>>({
    resolver: zodResolver(experienceDatesSchema),
    defaultValues: {
      experienceType: 'paid',
      dateType: 'one-day',
      isRecurring: false,
      selectedDate: '',
      startTime: '',
      endTime: '',
    },
  });

  const toIsoDateTime = (date: string, time: string) => {
    const dateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm', true);

    if (!dateTime.isValid()) {
      return null;
    }

    return dateTime.toISOString();
  };

  const toIsoEndDateTime = (date: string, time: string, dateType: 'one-day' | 'multi-day' | 'itinerary') => {
    if (dateType === 'one-day') {
      const endOfDay = moment(date, 'YYYY-MM-DD', true).endOf('day');
      return endOfDay.isValid() ? endOfDay.toISOString() : null;
    }

    return toIsoDateTime(date, time);
  };

  const onSubmit = async (values: z.infer<typeof experienceDatesSchema>) => {
    if (!experienceId || !experience) {
      toast({
        title: 'Missing experience',
        description: 'Create experience details first before adding dates.',
        variant: 'destructive',
      });
      return;
    }

    const startDateTime = toIsoDateTime(values.selectedDate, values.startTime);
    const endDateTime = toIsoEndDateTime(values.selectedDate, values.endTime, values.dateType);

    if (!startDateTime || !endDateTime) {
      toast({
        title: 'Invalid date or time',
        description: 'Please choose a valid date and time range.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateExperience({
        title: experience.title,
        description: experience.description,
        googleMapPlaceId: 'ChIJkYb7L8EXLxgRWogSMeTPg8M', // Placeholder, update as needed
        startDate: startDateTime,
        endDate: endDateTime,
        recurrence_rule:
          (experience as any).recurrenceRule || (experience as any).recurrence_rule || '',
        categoriesIds: experience.categories?.map((category) => category.id) || [],
        isPublic: experience.isPublic,
        invitedCommunityIds: [],
        invitedGuestsEmails: [],
      });

      toast({
        title: 'Success',
        description: 'Experience dates updated successfully.',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update experience dates.',
        variant: 'destructive',
      });
    }
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
              name="experienceType"
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
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 accent-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer text-xs font-normal text-gray-900">
                      Create a recurring experience
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Select Experience Date(s) */}
            <div className="space-y-4">
              <FormLabel className="text-xs font-medium text-gray-900">
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

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <button type="button" className="text-xs text-red-500 hover:text-red-600">
                Cancel
              </button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full text-xs font-semibold"
                >
                  Save & Exit
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isUpdatingExperience}
                  className="rounded-full px-6 text-xs font-semibold text-white"
                >
                  {isUpdatingExperience ? 'Saving...' : 'Create Tickets'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
