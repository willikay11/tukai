'use client';

import {
  PreviewCommunitiesSection,
  PreviewGuestsSection,
  PreviewLocationSection,
} from '@/app/shared/components/Preview';
import { PreviewPanel } from '@/app/shared/components/PreviewPanel';
import { PreviewCategoriesSection } from '@/app/(experiences)/experiences/create/components/PreviewCategoriesSection';
import { InvitedMember } from '@/components/ui/invite-members';
import { Interest } from '@/types/interest';

import { CommunityPreviewHeader } from '../CommunityPreviewHeader';
import { CommunityPreviewVisibility } from '../CommunityPreviewVisibility';

interface CommunityOption {
  id: string;
  name: string;
  imageUrl: string;
}

interface RightPanelProps {
  name: string;
  description: string;
  photos: string[];
  location: string | null;
  selectedCategories: string[];
  visibility: 'public' | 'private';
  categories: Interest[] | undefined;
  invitedGuests?: InvitedMember[];
  invitedCommunities?: string[];
  allCommunities?: CommunityOption[];
}

export const RightPanel = ({
  name,
  description,
  photos,
  location,
  selectedCategories,
  visibility,
  categories = [],
  invitedGuests = [],
  invitedCommunities = [],
  allCommunities = [],
}: RightPanelProps) => {
  const selectedCategoryObjects = (categories || []).filter((cat) =>
    selectedCategories.includes(cat.id),
  );

  const isEmpty = !name && !description && photos.length === 0;

  return (
    <PreviewPanel
      title="Preview Community"
      isEmpty={isEmpty}
      emptyText="Please add the details of the community"
    >
      <CommunityPreviewHeader photos={photos} name={name} description={description} />

      {location && <PreviewLocationSection location={location} label="Community Location" />}

      {selectedCategoryObjects.length > 0 && (
        <PreviewCategoriesSection categories={selectedCategoryObjects} />
      )}

      {invitedGuests.length > 0 && (
        <PreviewGuestsSection
          guests={invitedGuests}
          label="Invited Members"
          emptyText="No members invited yet"
        />
      )}

      {invitedCommunities.length > 0 && (
        <PreviewCommunitiesSection
          communityIds={invitedCommunities}
          allCommunities={allCommunities}
          label="Invited Communities"
          emptyText="No communities invited yet"
        />
      )}

      <CommunityPreviewVisibility visibility={visibility} />
    </PreviewPanel>
  );
};
