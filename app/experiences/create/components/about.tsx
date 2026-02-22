'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import IconComponent from '@/app/components/iconComponent';
import FileUploadField from '@/app/components/fileUploadField';
import { Button } from '@/components/ui/button';
import CategoryPill from '@/components/ui/categoryPill';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { useGetInterestCategories } from '@/hooks/auth';
import { Interest } from '@/types/interest';

export default function CreateExperienceAbout() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    included: '',
    notIncluded: '',
    location: '',
    meetingPoint: '',
    meetingTime: '',
  });

  const { data: categories } = useGetInterestCategories();
  const form = useForm<{ selectedCategories: string[]; visibility: 'public' | 'private' }>({
    defaultValues: {
      selectedCategories: [],
      visibility: 'public',
    },
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      form.setValue('selectedCategories', next, { shouldValidate: true });
      return next;
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full">
      <div className="bg-white">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Create Experience</h1>
        </div>

        <Form {...form}>
          <div className="space-y-6">
            {/* Upload Photo */}
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-900">Add details about the experience</p>
              <p className="mb-3 text-xs text-gray-600">
                Upload a experience poster (Dimensions: 540*540, Max 15 Mbs)
              </p>
              <FileUploadField
                id="experience-poster"
                label="Upload a experience poster"
                buttonText="Add Photo(s)"
                accept="image/*"
                maxFiles={1}
                onFilesChange={() => {}}
              />
            </div>

            {/* Experience Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-gray-900 mb-2">
                Experience Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Experience Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Experience Visibility */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <p className="text-xs font-medium text-gray-600">
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
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Add your experience description
              </label>
              <textarea
                id="description"
                placeholder="Grab people's attention with a detailed description about the experience..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                rows={4}
              />
            </div>

            {/* What's Included */}
            <div>
              <label htmlFor="included" className="block text-sm font-semibold text-gray-900 mb-2">
                What's included
              </label>
              <textarea
                id="included"
                placeholder="Add what is included in this experience..."
                value={formData.included}
                onChange={(e) => handleInputChange('included', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                rows={3}
              />
            </div>

            {/* What's NOT Included */}
            <div>
              <label htmlFor="notIncluded" className="block text-sm font-semibold text-gray-900 mb-2">
                What's NOT included
              </label>
              <textarea
                id="notIncluded"
                placeholder="Add what is NOT included in this experience..."
                value={formData.notIncluded}
                onChange={(e) => handleInputChange('notIncluded', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                rows={3}
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
                Where will the experience take place?
              </label>
              <div className="relative">
                <input
                  id="location"
                  type="text"
                  placeholder="Add location/name of the place..."
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                />
                <IconComponent
                  iconName="LocationIcon"
                  size={18}
                  color="currentColor"
                  className="absolute right-3 top-2.5 text-gray-400"
                />
              </div>
            </div>

            {/* Meeting Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Meeting Details (optional)</label>

              <div className="mb-3 relative">
                <input
                  type="text"
                  placeholder="Meeting/Pick-up Point"
                  value={formData.meetingPoint}
                  onChange={(e) => handleInputChange('meetingPoint', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                />
                <IconComponent
                  iconName="LocationIcon"
                  size={18}
                  color="currentColor"
                  className="absolute right-3 top-2.5 text-gray-400"
                />
              </div>

              <div className="relative">
                <input
                  type="time"
                  placeholder="Meeting Time"
                  value={formData.meetingTime}
                  onChange={(e) => handleInputChange('meetingTime', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                />
                <IconComponent
                  iconName="Clock01Icon"
                  size={18}
                  color="currentColor"
                  className="absolute right-3 top-2.5 text-gray-400"
                />
              </div>
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
                className="text-sm font-semibold text-red-500 hover:text-red-600"
              >
                Cancel
              </button>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full text-xs font-semibold">
                  Save & Exit
                </Button>
                <Button variant="gradient" className="rounded-full px-6 text-xs font-semibold text-white">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}