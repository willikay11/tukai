'use client';

import { PreviewPanel } from '@/app/shared/components/PreviewPanel';
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

  const isEmpty = !name && !description && !photoUrl;

  return (
    <PreviewPanel
      title="Preview Community"
      isEmpty={isEmpty}
      emptyText="Please add the details of the community"
    >
      <CommunityPreviewHeader photo={photoUrl} name={name} description={description} />

      {location && <CommunityPreviewLocation location={location} />}

      {categoryNames.length > 0 && <CommunityPreviewCategory categories={categoryNames} />}

      <CommunityPreviewVisibility visibility={visibility} />
    </PreviewPanel>
  );
};
