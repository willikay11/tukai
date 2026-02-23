'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { TimePicker } from '@/components/ui/time-picker';
import { DatePicker } from '@/components/ui/date-picker';

const experienceDatesSchema = z.object({
  experienceType: z.enum(['paid', 'free']),
  dateType: z.enum(['one-day', 'multi-day', 'itinerary']),
  isRecurring: z.boolean().default(false),
  selectedDate: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select start time'),
  endTime: z.string().min(1, 'Please select end time'),
});

export default function ExperienceDates() {
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

  const onSubmit = (values: z.infer<typeof experienceDatesSchema>) => {
    console.log('Form submitted:', values);
    // Handle form submission here
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
                  <FormLabel className="text-sm font-medium text-gray-900">Experience Type</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="one-day"
                          checked={field.value === 'one-day'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-4 w-4 border-gray-300 accent-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-900">One-Day experience</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="multi-day"
                          checked={field.value === 'multi-day'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-4 w-4 border-gray-300 accent-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-900">
                          Multi-Day Experience/Itinerary (e.g., 2 days straight)
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="itinerary"
                          checked={field.value === 'itinerary'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-4 w-4 border-gray-300 accent-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-900">Itinerary</span>
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
                    <FormLabel className="text-sm font-normal text-gray-900 cursor-pointer">
                      Create a recurring experience
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Select Experience Date(s) */}
            <div className="space-y-4">
              <FormLabel className="text-sm font-medium text-gray-900">
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
              <button type="button" className="text-sm text-red-500 hover:text-red-600">
                Cancel
              </button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="rounded-full text-xs font-semibold">
                  Save & Exit
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="rounded-full px-6 text-xs font-semibold text-white"
                >
                  Create Tickets
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
