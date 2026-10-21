'use client';

import { DescriptionShowMore } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { SquarePhotoStrip } from '@/app/shared/components/Images/SquarePhotoStrip';
import { DetailsGrid } from '@/app/shared/components/Sections';
import { Community } from '@/types/community';
import { Photo } from '@/types/photo';

import { COMMUNITY_SECTIONS } from './tabs';

/**
 * Photos, description, categories and the two facts the API actually sends -
 * same content as the full page's own About section (AboutSection.tsx), built
 * fresh for the drawer rather than shared with it: a different scroll offset
 * and a narrower column, the same reason the place drawer carries its own
 * PlaceAboutSection instead of the page's.
 */
export const CommunityAboutSection = ({
  community,
  upcomingCount,
}: {
  community: Community;
  upcomingCount: number;
}) => {
  const photos = (community.photos ?? [])
    .map((photo: Photo) => photo.photo)
    .filter((photo): photo is string => Boolean(photo));

  const memberCount = community.membersCount ?? community.members?.length ?? 0;

  // ⚠️ No phone, email, location or meeting schedule on a community - only
  // these two rows have a source
  const details = [
    { icon: 'UserGroupIcon', label: 'Members', value: `${memberCount}` },
    { icon: 'Calendar03Icon', label: 'Experiences hosted', value: `${upcomingCount} upcoming` },
  ];

  return (
    <section id={COMMUNITY_SECTIONS.about} className="scroll-mt-[148px] space-y-6">
      {photos.length > 0 && (
        <div className="-mx-6">
          <SquarePhotoStrip photos={photos} variant="hero" />
        </div>
      )}

      <DescriptionShowMore text={community.description} />

      {community.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {community.categories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm text-gray-700"
            >
              <IconComponent iconName={category.icon} size={16} color="currentColor" />
              {category.name}
            </span>
          ))}
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-bold text-gray-900">Details</p>
        <DetailsGrid rows={details} />
      </div>
    </section>
  );
};
