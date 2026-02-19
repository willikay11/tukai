'use client';

import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import CategoryPill from '@/components/ui/categoryPill';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetInterestCategories } from '@/hooks/auth';
import { Interest } from '@/types/interest';

import FileUploadField from '../../components/fileUploadField';
import IconComponent from '../../components/iconComponent';

export default function CreateCommunity() {
  const uploadId = useId();
  const visibilityId = useId();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [city, setCity] = useState('');

  const { data: categories } = useGetInterestCategories();

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
        <FileUploadField
          id={uploadId}
          label="Upload a community poster (Dimensions: 540*540, Max 15 Mbs)"
          multiple
        />
      </div>

      <div className="mt-4 space-y-3">
        <Input placeholder="Community Name" className="h-[55px]" />
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger
            className="h-[55px]"
            prefixIcon={<IconComponent iconName="Search01Icon" color="#9CA3AF" size={18} />}
          >
            <SelectValue placeholder="City e.g. Nairobi, Watamu..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nairobi">Nairobi</SelectItem>
            <SelectItem value="Watamu">Watamu</SelectItem>
            <SelectItem value="Mombasa">Mombasa</SelectItem>
            <SelectItem value="Nakuru">Nakuru</SelectItem>
            <SelectItem value="Kisumu">Kisumu</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <p className="mb-2 text-xs font-bold text-gray-800">Add your community description</p>
          <Textarea
            rows={5}
            placeholder="Grab people's attention with a detailed description about the community..."
            className="rounded-[10px] text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-gray-800">
          Select a category the community falls under, e.g. Hiking, Safari, etc.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories?.map((category: Interest) => {
            // const selected = selectedCategories.includes(category);
            return <CategoryPill key={category.id} category={category} onClick={toggleCategory} />;
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-600">What type of itinerary is this?</p>
        <RadioGroup
          className="mt-2 space-y-2"
          value={visibility}
          onValueChange={(value) => setVisibility(value as 'public' | 'private')}
        >
          <div className="flex items-start gap-2 text-xs text-gray-700">
            <RadioGroupItem
              value="public"
              id={`${visibilityId}-public`}
              className="mt-0.5 h-3.5 w-3.5 border-emerald-500 text-emerald-600"
            />
            <label htmlFor={`${visibilityId}-public`}>
              <span className="font-medium">Public</span> (Anyone can view the community and join)
            </label>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-700">
            <RadioGroupItem
              value="private"
              id={`${visibilityId}-private`}
              className="mt-0.5 h-3.5 w-3.5 border-emerald-500 text-emerald-600"
            />
            <label htmlFor={`${visibilityId}-private`}>
              <span className="font-medium">Private</span> (Only invited guests or members of a
              given communities can view and join)
            </label>
          </div>
        </RadioGroup>
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
          <Button
            variant="gradient"
            className="h-9 rounded-full px-4 text-xs text-white hover:bg-emerald-800"
          >
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
}
