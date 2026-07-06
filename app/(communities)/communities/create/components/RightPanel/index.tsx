'use client';

import { Interest } from '@/types/interest';

import { CommunityPreviewCategory } from '../CommunityPreviewCategory';
import { CommunityPreviewHeader } from '../CommunityPreviewHeader';
import { CommunityPreviewLocation } from '../CommunityPreviewLocation';
import { CommunityPreviewVisibility } from '../CommunityPreviewVisibility';

interface RightPanelProps {
  name: string;
  description: string;
  photoUrl: string | null;
  location: string | null;
  selectedCategories: string[];
  visibility: 'public' | 'private';
  categories: Interest[] | undefined;
}

export const RightPanel = ({
  name,
  description,
  photoUrl,
  location,
  selectedCategories,
  visibility,
  categories = [],
}: RightPanelProps) => {
  const categoryNames = (categories || [])
    .filter((cat) => selectedCategories.includes(cat.id))
    .map((cat) => cat.name);

  const hasContent = name || description || photoUrl;

  return (
    <div className="sticky top-6 space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-500">Preview Community</p>
      </div>

      {hasContent ? (
        <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
          <CommunityPreviewHeader photo={photoUrl} name={name} description={description} />

          {location && <CommunityPreviewLocation location={location} />}

          {categoryNames.length > 0 && <CommunityPreviewCategory categories={categoryNames} />}

          <CommunityPreviewVisibility visibility={visibility} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="mt-4 text-sm text-gray-600">Add community details to see preview</p>
        </div>
      )}
    </div>
  );
};
