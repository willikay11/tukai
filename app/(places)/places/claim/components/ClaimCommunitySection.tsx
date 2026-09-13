'use client';

import { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import {
  CommunitySelector,
  type Community as CommunitySelectorOption,
} from '@/app/(experiences)/experiences/create/components/CommunitySelector';
import { SectionShell } from '@/app/shared/components/Sections';
import { Community } from '@/types/community';

/**
 * A place is owned by a community, never by a person — so the claim opens on
 * the communities this reader hosts, picked through the same selector step 1
 * of the create-experience flow uses.
 */
export const ClaimCommunitySection = ({
  communities,
  isLoading,
  selectedCommunityId,
  createCommunityHref,
  onSelect,
}: {
  communities: Community[];
  isLoading: boolean;
  selectedCommunityId: string;
  createCommunityHref: string;
  onSelect: (communityId: string) => void;
}) => {
  const router = useRouter();

  const options = useMemo<CommunitySelectorOption[]>(
    () =>
      communities.map((community) => ({
        id: community.id,
        name: community.title || 'Untitled community',
        imageUrl: community.photos?.[0]?.photo,
      })),
    [communities],
  );

  const selected = options.find((option) => option.id === selectedCommunityId) ?? null;

  return (
    <SectionShell
      id="claim-community"
      title="Select community"
      subtitle="The community that will own and manage this place on Tukai."
    >
      <CommunitySelector
        communities={options}
        value={selected}
        isLoading={isLoading}
        onChange={(community) => onSelect(community?.id ?? '')}
        // Carries the return path, so the new community comes back selected
        onCreateNew={() => router.push(createCommunityHref)}
      />
    </SectionShell>
  );
};
