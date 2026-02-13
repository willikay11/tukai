'use client';

import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import IconComponent from '../../components/iconComponent';

const categories = [
  'Hiking',
  'Running',
  'Camping',
  'Cycling',
  'Backpacking',
  'Walking',
  'Overlanding',
  'Gym',
  'Bird Watching',
  'Sunset',
  'Fishing',
  'Safari',
  'Parks & Museums',
  'Horse Riding',
  'Rock Climbing',
  'Scenic Driving/Road Trip',
  'Restaurants',
  'Sports Activity',
  'Worship',
  'Shopping',
  'Kids',
  'Water Sports',
  'Night Life',
  'Other',
];

export default function CreateCommunity() {
  const uploadId = useId();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  return (
    <div className="mx-auto w-full px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Create Community</h1>
          <p className="mt-1 text-xs text-gray-800">
            Before you create an experience, please ensure you create a community
          </p>
        </div>
      </div>

      <div className="mt-4 inline-flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <span className="mt-0.5 shrink-0">
          <IconComponent iconName="UserMultipleIcon" color="#3B82F6" size={16} />
        </span>
        <span className="text-xs text-gray-800">
          Think of Community as your website, business, social media page or even a WhatsApp group.
          Having community will help you manage your experiences and keep members connected between
          experiences.
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-gray-800">
          Upload a community poster (Dimensions: 540*540, Max 15 Mbs)
        </p>
        <label
          htmlFor={uploadId}
          className="mt-2 inline-flex h-[105px] w-[155px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-50/50 text-center"
        >
          <IconComponent iconName="ImageAdd02Icon" color="#10B981" size={20} />
          <span className="mt-1 text-[10px] font-medium text-emerald-700">Add Photos</span>
        </label>
        <input id={uploadId} type="file" className="hidden" />
      </div>

      <div className="mt-4 space-y-3">
        <Input placeholder="Community Name" className='h-[55px]' />
        <Input
          placeholder="City e.g. Nairobi, Watamu..."
          className='h-[55px]'
          icon={<IconComponent iconName="Search01Icon" color="#9CA3AF" size={18} />}
        />
        <div>
          <p className="mb-2 text-xs font-bold text-gray-800">Add your community description</p>
          <Textarea
            placeholder="Grab people's attention with a detailed description about the community..."
            className="min-h-[110px] rounded-[10px] text-sm placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-gray-800">
          Select a category the community falls under, e.g. Hiking, Safari, etc.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  selected
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-600">What type of itinerary is this?</p>
        <div className="mt-2 space-y-2">
          <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-700">
            <input
              type="radio"
              name="visibility"
              className="mt-0.5 h-3.5 w-3.5 accent-emerald-500"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
            />
            <span>
              <span className="font-medium">Public</span> (Anyone can view the community and join)
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-700">
            <input
              type="radio"
              name="visibility"
              className="mt-0.5 h-3.5 w-3.5 accent-emerald-500"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
            />
            <span>
              <span className="font-medium">Private</span> (Only invited guests or members of a
              given communities can view and join)
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="text" className="text-xs text-red-500">
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 rounded-full border-primary px-4 text-xs text-primary"
          >
            Save &amp; Exit
          </Button>
          <Button variant="gradient" className="h-9 rounded-full px-4 text-xs text-white hover:bg-emerald-800">
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
}
