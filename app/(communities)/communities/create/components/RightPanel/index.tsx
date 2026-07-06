'use client';

import {
  PreviewCommunitiesSection,
  PreviewGuestsSection,
  PreviewLocationSection,
} from '@/app/shared/components/Preview';
import { PreviewPanel } from '@/app/shared/components/PreviewPanel';
import { InvitedMember } from '@/components/ui/invite-members';
import { Interest } from '@/types/interest';

import { CommunityPreviewCategory } from '../CommunityPreviewCategory';
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
  const categoryNames = (categories || [])
    .filter((cat) => selectedCategories.includes(cat.id))
    .map((cat) => cat.name);

  const isEmpty = !name && !description && photos.length === 0;

  return (
    <PreviewPanel
      title="Preview Community"
      isEmpty={isEmpty}
      emptyText="Please add the details of the community"
    >
      <CommunityPreviewHeader photos={photos} name={name} description={description} />

      {location && (
        <PreviewLocationSection
          location={location}
          label="Community Location"
          onEdit={() => {
            // Scroll to location field
          }}
        />
      )}

      {categoryNames.length > 0 && <CommunityPreviewCategory categories={categoryNames} />}

      {invitedGuests.length > 0 && (
        <PreviewGuestsSection
          guests={invitedGuests}
          label="Invited Members"
          emptyText="No members invited yet"
          onEdit={() => {
            // Scroll to invites field
          }}
        />
      )}

      {invitedCommunities.length > 0 && (
        <PreviewCommunitiesSection
          communityIds={invitedCommunities}
          allCommunities={allCommunities}
          label="Invited Communities"
          emptyText="No communities invited yet"
          onEdit={() => {
            // Scroll to invites field
          }}
        />
      )}

      <CommunityPreviewVisibility visibility={visibility} />
    </PreviewPanel>
  );
};
