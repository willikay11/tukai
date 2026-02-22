'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useRouter } from 'next/navigation';

import IconComponent from '@/app/components/iconComponent';
import FileUploadField from '@/app/components/fileUploadField';
import { Button } from '@/components/ui/button';
import CategoryPill from '@/components/ui/categoryPill';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { TimePicker } from '@/components/ui/time-picker';
import { useGetInterestCategories } from '@/hooks/auth';
import { Interest } from '@/types/interest';

const experienceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  included: z.string().min(3, 'Please describe what is included'),
  notIncluded: z.string().min(1, 'Please describe what is not included'),
  location: z.string().min(3, 'Location is required'),
  meetingPoint: z.string().optional().default(''),
  meetingTime: z.string().optional().default(''),
  visibility: z.enum(['public', 'private']),
  selectedCategories: z.array(z.string()).min(1, 'Select at least one category'),
});

export default function CreateExperienceAbout() {
  const router = useRouter();
  const { data: categories } = useGetInterestCategories();

  const form = useForm<z.infer<typeof experienceSchema>>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: '',
      description: '',
      included: '',
      notIncluded: '',
      location: '',
      meetingPoint: '',
      meetingTime: '',
      visibility: 'public',
      selectedCategories: [],
    },
  });

  const handleCategoryToggle = (categoryId: string) => {
    const current = form.getValues('selectedCategories');
    const next = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    form.setValue('selectedCategories', next, { shouldValidate: true });
  };

  const onSubmit = (values: z.infer<typeof experienceSchema>) => {
    console.log('Form submitted:', values);
    // Handle form submission here
  };

  return (
    <div className="w-full">
      <div className="bg-white">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Create Experience</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Upload Photo */}
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-800">Add details about the experience</p>
              <FileUploadField
                id="experience-poster"
                label=" Upload a experience poster (Dimensions: 540*540, Max 15 Mbs)"
                buttonText="Add Photo(s)"
                accept="image/*"
                maxFiles={1}
                onFilesChange={() => {}}
              />
            </div>

            {/* Experience Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="title" className="block text-xs font-medium text-gray-800">
                    Experience Title
                  </label>
                  <FormControl>
                    <input
                      id="title"
                      type="text"
                      placeholder="Experience Title"
                      {...field}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience Visibility */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <p className="text-xs font-medium text-gray-800">
                    Experience type (who can see or access the experience)
                  </p>
                  <FormControl>
                    <PillRadioGroup
                      options={[
                        { value: 'public', label: 'Public experience' },
                        { value: 'private', label: 'Private experience' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-800">
                    Add your experience description
                  </label>
                  <FormControl>
                    <textarea
                      id="description"
                      placeholder="Grab people's attention with a detailed description about the experience..."
                      {...field}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* What's Included */}
            <FormField
              control={form.control}
              name="included"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="included" className="block text-sm font-semibold text-gray-800">
                    What's included
                  </label>
                  <FormControl>
                    <textarea
                      id="included"
                      placeholder="Add what is included in this experience..."
                      {...field}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* What's NOT Included */}
            <FormField
              control={form.control}
              name="notIncluded"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="notIncluded" className="block text-sm font-semibold text-gray-800">
                    What's NOT included
                  </label>
                  <FormControl>
                    <textarea
                      id="notIncluded"
                      placeholder="Add what is NOT included in this experience..."
                      {...field}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-800">
                    Where will the experience take place?
                  </label>
                  <FormControl>
                    <div className="relative">
                      <input
                        id="location"
                        type="text"
                        placeholder="Add location/name of the place..."
                        {...field}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                      />
                      <IconComponent
                        iconName="LocationIcon"
                        size={18}
                        color="currentColor"
                        className="absolute right-3 top-2.5 text-gray-400"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meeting Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Meeting Details (optional)</label>

              <FormField
                control={form.control}
                name="meetingPoint"
                render={({ field }) => (
                  <FormItem className="mb-3">
                    <FormControl>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Meeting/Pick-up Point"
                          {...field}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                        />
                        <IconComponent
                          iconName="LocationIcon"
                          size={18}
                          color="currentColor"
                          className="absolute right-3 top-2.5 text-gray-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select meeting time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categories */}
            <FormField
              control={form.control}
              name="selectedCategories"
              render={() => (
                <FormItem className="mt-4">
                  <p className="text-xs font-bold text-gray-800">
                    Select a category the experience falls under, e.g. Hiking, Safari, etc.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories?.map((category: Interest) => (
                      <CategoryPill
                        key={category.id}
                        category={category}
                        onClick={handleCategoryToggle}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <button
                type="button"
                className="text-sm text-red-500 hover:text-red-600"
              >
                Cancel
              </button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="rounded-full text-xs font-semibold">
                  Save & Exit
                </Button>
                <Button type="submit" variant="gradient" className="rounded-full px-6 text-xs font-semibold text-white">
                  Continue
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}